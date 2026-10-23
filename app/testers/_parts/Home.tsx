"use client";
import type { Bug, Post } from "@/lib/testers/model";
import { ago, firstName } from "./api";
import { finders, inGroup, type GroupKey } from "./groups";
import { Icon, cssVar } from "./ui";
import BugRow from "./BugRow";
import Composer from "./Composer";
import Notes from "./Notes";
import type { Me } from "./Gate";

type Props = {
  me: Me; bugs: Bug[] | null; posts: Post[] | null;
  onReport: () => void; onOpen: (id: number) => void; onBoard: (g: GroupKey, mine?: boolean) => void;
  onPosted: (p: Post) => void; onDeletePost: (id: number) => void;
};

export default function Home({ me, bugs, posts, onReport, onOpen, onBoard, onPosted, onDeletePost }: Props) {
  const owner = me.role === "owner";
  const all = bugs ?? [];
  const count = (g: GroupKey) => all.filter((b) => inGroup(b, g)).length;
  const mine = all.filter((b) => b.mine);
  const focus = (posts ?? []).filter((p) => p.kind === "focus").slice(0, 4);
  const build = (posts ?? []).find((p) => p.kind === "build");
  const top = finders(all);
  const tiles: { g: GroupKey; label: string; c: string; mine?: boolean }[] = [
    { g: "open", label: "Open", c: "#818cf8" }, { g: "fixing", label: "Being fixed", c: "#c084fc" },
    { g: "fixed", label: "Fixed", c: "#22d3ee" }, { g: "all", label: owner ? "All reports" : "Your reports", c: "#f472b6", mine: !owner },
  ];
  return (
    <>
      <section className="th-hero">
        <div>
          <div className="th-eye">{owner ? "Team view" : "Tester Hub"}</div>
          <h1 className="th-h1">Hi, <em>{owner ? "team" : firstName(me.name)}</em>.</h1>
          <p className="th-lead">{owner ? "Everything your testers found, in one place. Set statuses and post what to test next." : "Thank you for helping shape Sentience. Here's what's happening and what to look at next."}</p>
        </div>
        <div className="acts">
          <button className="th-btn pri" onClick={onReport}><Icon n="plus" />Report a bug</button>
          <button className="th-btn gh" onClick={() => onBoard("all")}>See the board</button>
        </div>
      </section>

      <div className="th-stats">
        {tiles.map((t) => (
          <button key={t.label} className="th-stat" style={cssVar(t.c)} onClick={() => onBoard(t.g, t.mine)}>
            <b>{bugs ? (t.mine ? mine.length : count(t.g)) : "·"}</b><span><i />{t.label}</span>
          </button>
        ))}
      </div>

      {owner && <div className="th-sec"><Composer kind="focus" onPosted={onPosted} /></div>}

      <div className="th-sec th-grid2">
        <div>
          <div className="th-sechead"><div><h2 className="th-h2">This week, please test</h2><p>Where your eyes help most right now.</p></div></div>
          <div className="th-focus">
            {posts === null ? <div className="th-skel" /> : focus.length === 0 ? (
              <div className="th-empty">Nothing specific this week. Play the way you normally do and report anything that feels off.</div>
            ) : focus.map((p, i) => (
              <div className="th-fi" key={p.id}>
                <span className="n">{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4>{p.title}</h4>{p.body && <p>{p.body}</p>}
                  {owner && <button className="th-link" style={{ marginTop: 8, fontSize: 12.5, color: "#fda4af" }} onClick={() => onDeletePost(p.id)}>Remove</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="th-card glow th-build">
            <div className="th-eye" style={{ color: "#a5f3fc" }}>Latest build</div>
            {posts === null ? <div className="th-skel" style={{ height: 60 }} /> : build ? (
              <>
                <h3 className="th-h3" style={{ fontSize: 17 }}>{build.title}</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {build.version && <span className="th-ver">v{build.version}</span>}<span className="th-dim" style={{ fontSize: 12.5 }}>{ago(build.created_at)}</span>
                </div>
                <Notes body={build.body} />
              </>
            ) : <p className="th-mut" style={{ margin: 0, fontSize: 14 }}>Build notes show up here when a new version goes out.</p>}
          </div>
          <div className="th-card">
            <h3 className="th-h3" style={{ marginBottom: 8 }}>Top finders</h3>
            {top.length === 0 ? <p className="th-mut" style={{ margin: 0, fontSize: 14 }}>The first confirmed bug puts you here.</p> : (
              <div className="th-finders">
                {top.map((f, i) => (
                  <div key={f.name} className={`th-finder${f.me ? " me" : ""}`}>
                    <span className="rk">{i + 1}</span><span className="nm">{f.name}</span><span className="ct">{f.n} confirmed</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!owner && (
        <div className="th-sec">
          <div className="th-sechead"><div><h2 className="th-h2">Your reports</h2><p>Statuses update as the team works through them.</p></div></div>
          {bugs === null ? <div className="th-skel" /> : mine.length === 0 ? (
            <div className="th-empty">You haven&apos;t reported anything yet. When something feels off, tap Report a bug.</div>
          ) : <div className="th-list">{mine.slice(0, 5).map((b) => <BugRow key={b.id} b={b} onOpen={onOpen} />)}</div>}
          {mine.length > 5 && <button className="th-link" style={{ marginTop: 14 }} onClick={() => onBoard("all", true)}>See all {mine.length}</button>}
        </div>
      )}
      {owner && (
        <div className="th-sec">
          <div className="th-sechead"><div><h2 className="th-h2">Waiting on you</h2><p>New reports that need a status.</p></div></div>
          {bugs === null ? <div className="th-skel" /> : all.filter((b) => b.status === "new").length === 0 ? (
            <div className="th-empty">All caught up.</div>
          ) : <div className="th-list">{all.filter((b) => b.status === "new").slice(0, 8).map((b) => <BugRow key={b.id} b={b} onOpen={onOpen} />)}</div>}
        </div>
      )}
    </>
  );
}
