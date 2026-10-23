"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Bug, Post } from "@/lib/testers/model";
import { call, initial, SignedOut } from "./api";
import { Icon } from "./ui";
import Gate, { type Me } from "./Gate";
import Home from "./Home";
import Board, { type BoardFilter } from "./Board";
import Builds from "./Builds";
import Guide from "./Guide";
import Report from "./Report";
import Detail from "./Detail";
import Assist from "./Assist";
import type { Prefill } from "./Report";

const TABS = [
  { key: "home", label: "Home", icon: "home" }, { key: "bugs", label: "Bugs", icon: "bug" },
  { key: "builds", label: "Builds", icon: "build" }, { key: "guide", label: "Guide", icon: "guide" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function Hub() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [tab, setTabState] = useState<Tab>("home");
  const [bugs, setBugs] = useState<Bug[] | null>(null), [posts, setPosts] = useState<Post[] | null>(null);
  const [open, setOpen] = useState<number | null>(null), [reporting, setReporting] = useState(false), [prefill, setPrefill] = useState<Prefill | null>(null);
  const [filter, setFilter] = useState<BoardFilter>({ g: "all", mine: false });
  const [menu, setMenu] = useState(false), [msg, setMsg] = useState("");
  const msgT = useRef<number | undefined>(undefined);

  const toast = useCallback((m: string) => { setMsg(m); clearTimeout(msgT.current); msgT.current = window.setTimeout(() => setMsg(""), 2600); }, []);
  const out = useCallback(() => { setMe(null); setBugs(null); setPosts(null); }, []);
  const guard = useCallback((e: unknown) => { if (e instanceof SignedOut) out(); else toast((e as Error).message); }, [out, toast]);

  const setTab = (t: Tab) => { setTabState(t); history.replaceState(null, "", t === "home" ? location.pathname : `#${t}`); window.scrollTo({ top: 0 }); };

  const refresh = useCallback(async () => {
    try {
      const [b, p] = await Promise.all([call<{ bugs: Bug[] }>("bugs"), call<{ posts: Post[] }>("posts")]);
      setBugs(b.bugs); setPosts(p.posts);
    } catch (e) { guard(e); }
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
    if (!me) return;
    refresh();
    const t = window.setInterval(() => document.visibilityState === "visible" && refresh(), 45000);
    const v = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", v);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", v); };
  }, [me, refresh]);

  const openBug = (id: number) => { setReporting(false); setOpen(id); };
  const closeBug = () => { setOpen(null); if (location.search) history.replaceState(null, "", location.pathname + location.hash); };
  const update = (b: Bug) => setBugs((all) => all?.map((x) => (x.id === b.id ? { ...x, ...b } : x)) ?? all);

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

  const sky = <div className="th-sky" aria-hidden="true"><i /><i /><i /></div>;
  if (me === undefined) return <div className="th">{sky}</div>;
  if (me === null) return <div className="th">{sky}<Gate onIn={setMe} /></div>;

  const current = open !== null ? bugs?.find((b) => b.id === open) : undefined;
  return (
    <div className="th">
      {sky}
      <header className="th-head">
        <div className="th-wrap">
          <button className="th-brand" onClick={() => setTab("home")}>
            <img src="/sentience-icon.png" alt="" /><span><b>SENTIENCE</b><small>Tester Hub</small></span>
          </button>
          <nav className="th-tabs">{TABS.map((t) => <button key={t.key} aria-current={tab === t.key ? "page" : undefined} onClick={() => setTab(t.key)}>{t.label}</button>)}</nav>
          <div className="th-me">
            <button onClick={() => setMenu((m) => !m)} aria-expanded={menu}><span className="th-av">{me.role === "owner" ? "S" : initial(me.name)}</span><span>{me.role === "owner" ? "Team" : me.name}</span></button>
            {menu && (
              <div className="th-menu" onMouseLeave={() => setMenu(false)}>
                <p>Signed in as {me.role === "owner" ? "the team" : me.name}</p>
                <button onClick={signOut}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="th-main th-wrap">
        {tab === "home" && <Home me={me} bugs={bugs} posts={posts} onReport={() => setReporting(true)} onOpen={openBug}
          onBoard={(g, mine) => { setFilter({ g, mine: !!mine }); setTab("bugs"); }} onPosted={posted} onDeletePost={deletePost} />}
        {tab === "bugs" && <Board bugs={bugs} filter={filter} setFilter={setFilter} onOpen={openBug} onReport={() => setReporting(true)} />}
        {tab === "builds" && <Builds owner={me.role === "owner"} bugs={bugs} posts={posts} onOpen={openBug} onPosted={posted} onDeletePost={deletePost} />}
        {tab === "guide" && <Guide />}
      </main>
      <nav className="th-bar">{TABS.map((t) => <button key={t.key} aria-current={tab === t.key ? "page" : undefined} onClick={() => setTab(t.key)}><Icon n={t.icon} />{t.label}</button>)}</nav>

      <Assist me={me} bugs={bugs} onDraft={(p) => { setOpen(null); setPrefill(p); setReporting(true); }} onMetoo={metoo} onChanged={refresh} toast={toast} />
      {reporting && <Report bugs={bugs ?? []} prefill={prefill} onClose={() => { setReporting(false); setPrefill(null); }} onOpen={openBug} onMetoo={metoo}
        onDone={async (id) => { setReporting(false); setPrefill(null); toast("Thank you. Your report is on the board."); await refresh(); setOpen(id); }} />}
      {current && <Detail bug={current} me={me} onClose={closeBug} onChange={update} onOpen={openBug} onMetoo={metoo} toast={toast}
        onDeleted={(id) => { setBugs((all) => all?.filter((b) => b.id !== id) ?? all); closeBug(); toast("Deleted"); }} />}
      {msg && <div className="th-toast" role="status">{msg}</div>}
    </div>
  );
}
