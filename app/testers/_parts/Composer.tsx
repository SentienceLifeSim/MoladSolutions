"use client";
import { useState } from "react";
import { call } from "./api";
import type { Post } from "@/lib/testers/model";

/** Owner only: post what to test this week, or the notes for a new build. */
export default function Composer({ kind: start, onPosted }: { kind: Post["kind"]; onPosted: (p: Post) => void }) {
  const [kind, setKind] = useState(start), [title, setTitle] = useState(""), [version, setVersion] = useState(""), [body, setBody] = useState("");
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  async function post() {
    setBusy(true); setErr("");
    try {
      const { post } = await call<{ post: Post }>("posts", { body: { kind, title, version, body } });
      onPosted(post); setTitle(""); setVersion(""); setBody("");
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  }
  return (
    <div className="th-own th-compose">
      <b>Post an update</b>
      <div className="th-seg">
        <button type="button" aria-pressed={kind === "focus"} onClick={() => setKind("focus")}>What to test</button>
        <button type="button" aria-pressed={kind === "build"} onClick={() => setKind("build")}>Build notes</button>
      </div>
      <div className={kind === "build" ? "th-row2" : ""}>
        <input className="th-in" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "build" ? "Build title, like Royal Dynasty update" : "Focus, like The new Witch Pack"} />
        {kind === "build" && <input className="th-in" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Version, like 5.55" />}
      </div>
      <textarea className="th-in" rows={3} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder={kind === "build" ? "One change per line" : "What should testers try, and what are you unsure about?"} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="th-err" style={{ flex: 1, minHeight: 0 }}>{err}</span>
        <button className="th-btn pri sm" disabled={!title.trim() || busy} onClick={post}>{busy ? "Posting..." : "Post"}</button>
      </div>
    </div>
  );
}
