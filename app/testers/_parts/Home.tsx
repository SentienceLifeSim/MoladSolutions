"use client";
import { MONTHLY_MIN, monthEnd, monthName, monthStart, type Bug, type Kind, type Post } from "@/lib/testers/model";
import { ago, firstName } from "./api";
import { finders, inGroup, type GroupKey } from "./groups";
import { DiscordLink, Icon } from "./ui";
import BugRow from "./BugRow";
import Composer from "./Composer";
import Notes from "./Notes";
import { Roster } from "./Month";
import type { Me } from "./Gate";

type Props = {
  me: Me; bugs: Bug[] | null; posts: Post[] | null;
  onReport: (kind?: Kind) => void; onOpen: (id: number) => void; onBoard: (g: GroupKey, mine?: boolean) => void;
  onPosted: (p: Post) => void; onDeletePost: (id: number) => void;
};

/** Home in the variation 3 layout: welcome, four summary tiles, recent reports with screenshots, a side column. */
export default function Home({ me, bugs, posts, onReport, onOpen, onBoard, onPosted, onDeletePost }: Props) {
  const owner = me.role === "owner";
  const all = bugs ?? [];
  const work = all.filter((b) => b.kind !== "clear"); // check-ins never sit in the open counts
  const count = (g: GroupKey) => work.filter((b) => inGroup(b, g)).length;
  const breaking = work.filter((b) => b.kind === "bug" && b.severity === "blocker" && inGroup(b, "open")).length;
  const start = monthStart();
  const monthN = all.filter((b) => b.mine && new Date(b.created_at) >= start).length;
  const fixedMonth = all.filter((b) => (b.status === "fixed" || b.status === "live") && new Date(b.updated_at) >= start).length;
  const daysLeft = Math.max(0, Math.ceil((monthEnd().getTime() + 864e5 - Date.now()) / 864e5));
  const focus = (posts ?? []).filter((p) => p.kind === "focus").slice(0, 4);
  const build = (posts ?? []).find((p) => p.kind === "build");
  const top = finders(all);
  const recent = owner ? all.filter((b) => b.status === "new" && b.kind !== "clear") : all.filter((b) => b.kind !== "clear");
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const n = (v: number) => (bugs ? v : "·");

  return (
    <>
      <section className="th-hero">
        <div>
          <p className="th-eye" style={{ margin: 0 }}>{today}</p>
          <h1 className="th-h1">{owner ? "Welcome back" : `Welcome back, ${firstName(me.name)}`}</h1>
          <p className="th-lead">{owner ? "Everything your testers sent, and what needs a status." : "Here's what's open on the board and what to test next."}</p>
        </div>
        <div className="acts">
          {!owner && <button className="th-btn" onClick={() => onReport("clear")}><Icon n="check" />Couldn&apos;t find a bug</button>}
          <button className="th-btn" onClick={() => onBoard("all")}>View board</button>
          <button className="th-btn pri" onClick={() => onReport("bug")}><Icon n="plus" />Report a bug</button>
        </div>
      </section>

      <div className="th-stats">
        <button className="th-stat" onClick={() => onBoard("open")}><span>Open</span><b>{n(count("open"))}</b><small>{breaking ? `${breaking} game breaking` : "Nothing game breaking"}</small></button>
        <button className="th-stat" onClick={() => onBoard("fixing")}><span>Being fixed</span><b>{n(count("fixing"))}</b><small>{count("fixing") ? "In progress now" : "None in progress"}</small></button>
        <button className="th-stat" onClick={() => onBoard("fixed")}><span>Fixed</span><b>{n(count("fixed"))}</b><small>{fixedMonth} this month</small></button>
        {owner ? (
          <button className="th-stat" onClick={() => onBoard("all")}><span>All reports</span><b>{n(all.length)}</b><small>{all.filter((b) => b.kind === "idea").length} suggestions, {all.filter((b) => b.kind === "clear").length} check-ins</small></button>
        ) : (
          <button className="th-stat" onClick={() => onBoard("all", true)}><span>Your {monthName()}</span><b>{n(monthN)}<em> / {MONTHLY_MIN}</em></b>
            <div className="th-meter"><i style={{ width: `${Math.min(100, (monthN / MONTHLY_MIN) * 100)}%` }} /></div>
            <small>{monthN >= MONTHLY_MIN ? "Requirement met. Thank you" : `${MONTHLY_MIN - monthN} more in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`}</small></button>
        )}
      </div>

      {owner && <div className="th-sec"><Composer kind="focus" onPosted={onPosted} /></div>}

      <div className="th-sec th-grid2">
        <section style={{ minWidth: 0 }}>
          <div className="th-sechead"><div><h2 className="th-h2">{owner ? "Waiting on you" : "Recent reports"}</h2><p>{owner ? "New reports that need a status." : "Bugs and suggestions from every tester."}</p></div>
            <button className="th-link" onClick={() => onBoard("all")}>View all</button></div>
          {bugs === null ? <div className="th-skel" /> : recent.length === 0 ? (
            <div className="th-empty">{owner ? "All caught up." : "Nothing reported yet. Be the first."}</div>
          ) : <div className="th-list">{recent.slice(0, 6).map((b) => <BugRow key={b.id} b={b} onOpen={onOpen} />)}</div>}
          {owner && <div className="th-sec"><Roster /></div>}
        </section>
        <aside className="th-col">
          <section className="th-card">
            <h3 className="th-h3" style={{ marginBottom: 10 }}>This week, please test</h3>
            {posts === null ? <div className="th-skel" style={{ height: 48 }} /> : focus.length === 0 ? (
              <p className="th-mut" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>Nothing specific this week. Play the way you normally do and report anything that feels off.</p>
            ) : (
              <div className="th-focus">{focus.map((p, i) => (
                <div className="th-fi" key={p.id}><span className="n">{i + 1}</span><div style={{ flex: 1, minWidth: 0 }}>
                  <h4>{p.title}</h4>{p.body && <p>{p.body}</p>}
                  {owner && <button className="th-link" style={{ marginTop: 6, fontSize: 12.5, color: "var(--danger)" }} onClick={() => onDeletePost(p.id)}>Remove</button>}
                </div></div>
              ))}</div>
            )}
          </section>
          <section className="th-card th-build">
            <h3 className="th-h3">Latest build</h3>
            {posts === null ? <div className="th-skel" style={{ height: 40 }} /> : build ? (
              <>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{build.version && <span className="th-ver">v{build.version}</span>}<span className="th-dim" style={{ fontSize: 12.5 }}>{ago(build.created_at)}</span></div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{build.title}</p>
                <Notes body={build.body} />
              </>
            ) : <p className="th-mut" style={{ margin: 0, fontSize: 13.5 }}>Build notes appear here when a new version ships.</p>}
          </section>
          <section className="th-card">
            <h3 className="th-h3" style={{ marginBottom: 6 }}>Top finders</h3>
            {top.length === 0 ? <p className="th-mut" style={{ margin: 0, fontSize: 13.5 }}>The first confirmed bug puts you here.</p> : (
              <div className="th-finders">{top.map((f, i) => (
                <div key={f.name} className={`th-finder${f.me ? " me" : ""}`}><span className="rk">{i + 1}</span><span className="nm">{f.name}</span><span className="ct">{f.n} confirmed</span></div>
              ))}</div>
            )}
          </section>
          {!owner && <section className="th-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}><h3 className="th-h3">Need help?</h3><DiscordLink /></section>}
        </aside>
      </div>
    </>
  );
}
