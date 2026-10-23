"use client";
import type { Bug, Post } from "@/lib/testers/model";
import { ago } from "./api";
import BugRow from "./BugRow";
import Composer from "./Composer";
import Notes from "./Notes";

export default function Builds({ owner, bugs, posts, onOpen, onPosted, onDeletePost }: {
  owner: boolean; bugs: Bug[] | null; posts: Post[] | null; onOpen: (id: number) => void; onPosted: (p: Post) => void; onDeletePost: (id: number) => void;
}) {
  const coming = (bugs ?? []).filter((b) => b.status === "fixed");
  const builds = (posts ?? []).filter((p) => p.kind === "build");
  return (
    <>
      <div className="th-sechead"><div><div className="th-eye">Builds</div><h1 className="th-h1" style={{ fontSize: "clamp(30px,5vw,42px)" }}>What&apos;s new</h1>
        <p>Every update, and the fixes waiting to go out.</p></div></div>
      {owner && <div style={{ marginBottom: 28 }}><Composer kind="build" onPosted={onPosted} /></div>}
      <div className="th-grid2">
        <div>
          <h2 className="th-h2" style={{ marginBottom: 14 }}>Release notes</h2>
          {posts === null ? <div className="th-skel" /> : builds.length === 0 ? (
            <div className="th-empty">No build notes yet. They&apos;ll appear here with each update.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {builds.map((p, i) => (
                <div key={p.id} className={`th-card th-build${i === 0 ? " glow" : ""}`}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {p.version && <span className="th-ver">v{p.version}</span>}
                    {i === 0 && <span className="th-pill" style={{ ["--c" as string]: "#34d399" }}><i />Latest</span>}
                    <span className="th-dim" style={{ fontSize: 12.5, marginLeft: "auto" }}>{ago(p.created_at)}</span>
                  </div>
                  <h3 className="th-h3" style={{ fontSize: 17 }}>{p.title}</h3>
                  <Notes body={p.body} />
                  {owner && <button className="th-link" style={{ alignSelf: "flex-start", fontSize: 12.5, color: "#fda4af" }} onClick={() => onDeletePost(p.id)}>Remove</button>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="th-h2" style={{ marginBottom: 14 }}>Coming in the next build</h2>
          {bugs === null ? <div className="th-skel" /> : coming.length === 0 ? (
            <div className="th-empty">Fixed bugs line up here until the next update ships.</div>
          ) : <div className="th-list">{coming.map((b) => <BugRow key={b.id} b={b} onOpen={onOpen} />)}</div>}
        </div>
      </div>
    </>
  );
}
