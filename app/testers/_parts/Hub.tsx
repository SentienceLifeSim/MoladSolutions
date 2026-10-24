"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Bug, Post } from "@/lib/testers/model";
import { call, initial, SignedOut } from "./api";
import { Icon } from "./ui";
import Gate, { type Me } from "./Gate";
import Home from "./Home";
import Board, { type BoardFilter } from "./Board";
import Builds from "./Builds";
import Retest, { waiting } from "./Retest";
import Guide from "./Guide";
import Report from "./Report";
import Detail from "./Detail";
import Assist from "./Assist";
import PlayerBugs from "./PlayerBugs";
import Welcome from "./Welcome";
import { BellButton, BellPanel, type BellState } from "./Bell";
import type { BellItem } from "@/lib/testers/bell";
import type { Prefill } from "./Report";

const TABS = [
  { key: "home", label: "Home", icon: "home" }, { key: "bugs", label: "Bugs", icon: "bug" },
  { key: "retest", label: "Retest", icon: "retest" }, { key: "builds", label: "Builds", icon: "build" }, { key: "guide", label: "Guide", icon: "guide" },
  { key: "players", label: "Players", icon: "flag" },
] as const;
const OWNER_ONLY: readonly string[] = ["players"];
type Tab = (typeof TABS)[number]["key"];

export default function Hub() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [tab, setTabState] = useState<Tab>("home");
  const [bugs, setBugs] = useState<Bug[] | null>(null), [posts, setPosts] = useState<Post[] | null>(null);
  const [retestDates, setRetestDates] = useState<string[]>([]);
  const [open, setOpen] = useState<number | null>(null), [reporting, setReporting] = useState(false), [prefill, setPrefill] = useState<Prefill | null>(null);
  const [filter, setFilter] = useState<BoardFilter>({ g: "all", mine: false });
  const [menu, setMenu] = useState(false), [msg, setMsg] = useState("");
  // The tester bell (owner 2026-10-24): new builds, the team's replies, their own reports fixed.
  const [bell, setBell] = useState<BellState | null>(null), [bellOpen, setBellOpen] = useState(false), [focusComment, setFocusComment] = useState<number | null>(null);
  const msgT = useRef<number | undefined>(undefined);
  // Light or dark: the tester's choice, remembered on this device; until they choose, their system's.
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("th_theme"); } catch { /* private mode */ }
    setTheme(saved === "dark" || saved === "light" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);
  const flip = () => setTheme((t) => { const n = t === "dark" ? "light" : "dark"; try { localStorage.setItem("th_theme", n); } catch { /* private mode */ } return n; });
  const themeBtn = (
    <button type="button" className="th-theme" onClick={flip} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <Icon n={theme === "dark" ? "sun" : "moon"} /><span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );

  const toast = useCallback((m: string) => { setMsg(m); clearTimeout(msgT.current); msgT.current = window.setTimeout(() => setMsg(""), 2600); }, []);
  const out = useCallback(() => { setMe(null); setBugs(null); setPosts(null); }, []);
  const guard = useCallback((e: unknown) => { if (e instanceof SignedOut) out(); else toast((e as Error).message); }, [out, toast]);

  const setTab = (t: Tab) => { setTabState(t); history.replaceState(null, "", t === "home" ? location.pathname : `#${t}`); window.scrollTo({ top: 0 }); };

  const refresh = useCallback(async () => {
    try {
      const [b, p] = await Promise.all([call<{ bugs: Bug[]; retestDates?: string[] }>("bugs"), call<{ posts: Post[] }>("posts")]);
      setBugs(b.bugs); setPosts(p.posts); setRetestDates(b.retestDates ?? []);
    } catch (e) { guard(e); }
    call<BellState>("bell").then(setBell).catch(() => {});
  }, [guard]);

  // Session, starting tab and a ?bug= link (from the email) on first load.
  useEffect(() => {
    const h = location.hash.slice(1) as Tab;
    if (TABS.some((t) => t.key === h)) setTabState(h);
    const b = Number(new URLSearchParams(location.search).get("bug"));
    if (b > 0) setOpen(b);
    call<{ me: Me | null }>("session").then((r) => setMe(r.me)).catch(() => setMe(null));
  }, []);
  useEffect(() => {
    if (!me || me.needName) return;
    refresh();
    const t = window.setInterval(() => document.visibilityState === "visible" && refresh(), 45000);
    const v = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", v);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", v); };
  }, [me, refresh]);

  const openBug = (id: number) => { setReporting(false); setOpen(id); };
  const pickBell = (i: BellItem) => {
    setBellOpen(false);
    if (i.unread) {
      setBell((s) => s && { items: s.items.map((x) => (x.id === i.id ? { ...x, unread: false } : x)), unread: Math.max(0, s.unread - 1) });
      call("bell", { body: { read: i.id } }).catch(() => {});
    }
    if (i.bug) { setFocusComment(i.comment); openBug(i.bug); }
    else setTab(i.kind === "build" ? "builds" : "home");
  };
  const readAllBell = () => {
    setBell((s) => s && { items: s.items.map((x) => ({ ...x, unread: false })), unread: 0 });
    call("bell", { body: { all: true } }).catch(() => {});
  };
  const closeBug = () => { setFocusComment(null); setOpen(null); if (location.search) history.replaceState(null, "", location.pathname + location.hash); };
  const update = (b: Bug) => setBugs((all) => all?.map((x) => (x.id === b.id ? { ...x, ...b } : x)) ?? all);
  // A retest answer: update the report and count it toward the month right away (a changed answer counts once).
  const answered = (b: Bug) => {
    const before = bugs?.find((x) => x.id === b.id)?.myRetest;
    update(b);
    if (b.myRetest && !before) setRetestDates((d) => [...d, b.myRetest!.at]);
  };

  async function metoo(b: Bug) {
    const on = !b.iMetoo;
    update({ ...b, iMetoo: on, metoo: b.metoo + (on ? 1 : -1) });
    try { const r = await call<{ metoo: number; iMetoo: boolean }>(`bugs/${b.id}/metoo`, { body: { on } }); update({ ...b, ...r }); }
    catch (e) { update(b); guard(e); }
  }
  async function signOut() { await call("session", { method: "DELETE" }).catch(() => {}); setMenu(false); out(); }
  async function deletePost(id: number) {
    if (!confirm("Remove this post?")) return;
    try { await call(`posts?id=${id}`, { method: "DELETE" }); setPosts((p) => p?.filter((x) => x.id !== id) ?? p); } catch (e) { guard(e); }
  }
  const posted = (p: Post) => { setPosts((all) => [p, ...(all ?? [])]); toast("Posted"); };

  if (me === undefined) return <div className="th" data-theme={theme} />;
  if (me === null || me.needName) return <div className="th" data-theme={theme}><div className="th-gatetheme">{themeBtn}</div><Gate key={me ? "name" : "code"} askName={!!me?.needName} onIn={setMe} /></div>;

  const current = open !== null ? bugs?.find((b) => b.id === open) : undefined;
  const toCheck = me.role === "owner" ? 0 : waiting(bugs).length;
  // Players reported bugs is the team's own list, never shown to testers.
  const tabs = TABS.filter((t) => me.role === "owner" || !OWNER_ONLY.includes(t.key));
  if (!tabs.some((t) => t.key === tab)) setTabState("home");
  const badge = (k: Tab) => (k === "retest" && toCheck > 0 ? <span className="th-badge">{toCheck}</span> : null);
  return (
    <div className="th" data-theme={theme}>
      <aside className="th-side">
        <button className="th-brand" onClick={() => setTab("home")}><img src="/sentience-icon.png" alt="" /><span><b>Sentience</b><small>Tester Hub</small></span></button>
        <nav className="th-nav">{<BellButton side bell={bell} open={bellOpen} onToggle={() => setBellOpen((o) => !o)} />}{tabs.map((t) => <button key={t.key} aria-current={tab === t.key ? "page" : undefined} onClick={() => setTab(t.key)}><Icon n={t.icon} />{t.key === "bugs" ? "Bug board" : t.key === "retest" ? "Ready to retest" : t.key === "players" ? "Players reported bugs" : t.label}{badge(t.key)}</button>)}</nav>
        <div className="th-sidefoot">
          {themeBtn}
          <div className="th-me"><span className="th-av">{me.role === "owner" ? "S" : initial(me.name)}</span><span><b>{me.role === "owner" ? "Team" : me.name}</b><button onClick={signOut}>Sign out</button></span></div>
        </div>
      </aside>
      <div className="th-content">
        <header className="th-head">
          <button className="th-brand" onClick={() => setTab("home")}><img src="/sentience-icon.png" alt="" /><span><b>Sentience</b><small>Tester Hub</small></span></button>
          {themeBtn}
          {<BellButton bell={bell} open={bellOpen} onToggle={() => setBellOpen((o) => !o)} />}
          <div style={{ position: "relative" }}>
            <button className="th-av" style={{ border: 0 }} onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Account">{me.role === "owner" ? "S" : initial(me.name)}</button>
            {menu && (
              <div className="th-menu" onMouseLeave={() => setMenu(false)}>
                <p>Signed in as {me.role === "owner" ? "the team" : me.name}</p>
                <button onClick={signOut}>Sign out</button>
              </div>
            )}
          </div>
        </header>
        <main className="th-main th-wrap">
          {tab === "home" && <Home me={me} bugs={bugs} posts={posts} retestDates={retestDates} onRetest={() => setTab("retest")} onReport={(k) => { if (k && k !== "bug") setPrefill({ kind: k }); setReporting(true); }} onOpen={openBug}
            onBoard={(g, mine) => { setFilter({ g, mine: !!mine }); setTab("bugs"); }} onPosted={posted} onDeletePost={deletePost} />}
          {tab === "bugs" && <Board bugs={bugs} filter={filter} setFilter={setFilter} onOpen={openBug} onReport={() => setReporting(true)} />}
          {tab === "retest" && <Retest bugs={bugs} owner={me.role === "owner"} onOpen={openBug} onAnswered={answered} toast={toast} />}
          {tab === "builds" && <Builds owner={me.role === "owner"} bugs={bugs} posts={posts} onOpen={openBug} onPosted={posted} onDeletePost={deletePost} />}
          {tab === "guide" && <Guide />}
          {tab === "players" && me.role === "owner" && <PlayerBugs onSignedOut={out} toast={toast} />}
        </main>
      </div>
      <nav className="th-bar" style={{ gridTemplateColumns: `repeat(${tabs.length},1fr)` }}>{tabs.map((t) => <button key={t.key} aria-current={tab === t.key ? "page" : undefined} onClick={() => setTab(t.key)}><Icon n={t.icon} />{t.label}{badge(t.key)}</button>)}</nav>

      <Assist me={me} bugs={bugs} onDraft={(p) => { setOpen(null); setPrefill(p); setReporting(true); }} onMetoo={metoo} onChanged={refresh} toast={toast} />
      {reporting && <Report bugs={bugs ?? []} prefill={prefill} onClose={() => { setReporting(false); setPrefill(null); }} onOpen={openBug} onMetoo={metoo}
        onDone={async (id) => { setReporting(false); setPrefill(null); toast("Thank you. Your report is on the board."); await refresh(); setOpen(id); }} />}
      {bellOpen && <BellPanel bell={bell} onPick={pickBell} onReadAll={readAllBell} onClose={() => setBellOpen(false)} />}
      {current && <Detail bug={current} me={me} focusComment={focusComment} onClose={closeBug} onChange={update} onAnswered={answered} onOpen={openBug} onMetoo={metoo} toast={toast}
        onDeleted={(id) => { setBugs((all) => all?.filter((b) => b.id !== id) ?? all); closeBug(); toast("Deleted"); }} />}
      {me.role === "owner" && bugs && <Welcome bugs={bugs} onOpen={openBug} onPlayers={() => setTab("players")} />}
      {msg && <div className="th-toast" role="status">{msg}</div>}
    </div>
  );
}
