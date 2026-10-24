"use client";
import { useCallback, useEffect, useState } from "react";
import type { PlayerBoard, PlayerBug } from "@/app/api/testers/player-bugs/route";
import { call, SignedOut } from "./api";
import { Icon } from "./ui";

const LEVELS: { key: PlayerBug["level"]; label: string; note: string }[] = [
  { key: "critical", label: "Critical", note: "Breaks the game" },
  { key: "high", label: "High", note: "Blocks a feature" },
  { key: "medium", label: "Medium", note: "Wrong but playable" },
  { key: "low", label: "Low", note: "Small or unclear" },
];
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** Owner only. Bugs real players reported since the last store update, most urgent first. Kept apart from tester reports. */
export default function PlayerBugs({ onSignedOut, toast }: { onSignedOut: () => void; toast: (m: string) => void }) {
  const [board, setBoard] = useState<PlayerBoard | null | undefined>(undefined);
  const load = useCallback(async () => {
    try { setBoard((await call<{ board: PlayerBoard | null }>("player-bugs")).board); }
    catch (e) { if (e instanceof SignedOut) onSignedOut(); else { toast((e as Error).message); setBoard((b) => b ?? null); } }
  }, [onSignedOut, toast]);
  useEffect(() => { load(); }, [load]);

  async function mark(b: PlayerBug) {
    if (!b.voicesId) return;
    const next = b.status === "shipped" ? "open" : "shipped";
    const set = (s: PlayerBug["status"]) => setBoard((x) => x && { ...x, bugs: x.bugs.map((y) => (y.rank === b.rank ? { ...y, status: s } : y)) });
    set(next);
    try { await call("player-bugs", { body: { voicesId: b.voicesId, status: next } }); toast(next === "shipped" ? "Marked fixed. Voices updated too." : "Reopened"); }
    catch (e) { set(b.status); if (e instanceof SignedOut) onSignedOut(); else toast((e as Error).message); }
  }

  const fixed = board ? board.bugs.filter((b) => b.status === "shipped").length : 0;
  return (
    <>
      <div className="th-sechead">
        <div>
          <div className="th-eye">Team only</div>
          <h1 className="th-h1">Players reported bugs</h1>
          <p>{board ? `From players in the live game since version ${board.release} (${day(board.since)}), most urgent first. ${fixed} of ${board.bugs.length} fixed. Testers can't see this tab.` : "From players in the live game, most urgent first. Testers can't see this tab."}</p>
        </div>
      </div>
      {board === undefined ? (
        <div className="th-list"><div className="th-skel" /><div className="th-skel" /><div className="th-skel" /></div>
      ) : !board || board.bugs.length === 0 ? (
        <div className="th-empty">No player reports yet.</div>
      ) : (
        LEVELS.map((L) => {
          const group = board.bugs.filter((b) => b.level === L.key);
          if (!group.length) return null;
          return (
            <section key={L.key} className={`th-pb-lvl lv-${L.key}`}>
              <h2><span>{L.label}</span>{L.note}<b>{group.length}</b></h2>
              <div className="th-list">{group.map((b) => <Row key={b.rank} b={b} onMark={() => mark(b)} />)}</div>
            </section>
          );
        })
      )}
    </>
  );
}

function Row({ b, onMark }: { b: PlayerBug; onMark: () => void }) {
  const [open, setOpen] = useState(false);
  const done = b.status === "shipped";
  return (
    <article className={`th-card th-pb${done ? " done" : ""}`}>
      <div className="th-pb-top">
        <span className="th-pb-rank">{b.rank}</span>
        <div className="th-pb-main">
          <h3>{b.title}</h3>
          {b.why && <p>{b.why}</p>}
          {b.cause && <p className="th-pb-cause">{b.cause}</p>}
          <div className="th-meta">
            <span>{b.players === 1 ? "1 report" : `${b.players} reports`}</span>
            {done && <><i className="dot" /><span className="th-pb-fixed">Fixed</span></>}
            {!b.voicesId && <><i className="dot" /><span>Not on Voices</span></>}
          </div>
        </div>
        {b.voicesId && (
          <button type="button" className={`th-pb-check${done ? " on" : ""}`} aria-pressed={done} aria-label={done ? "Reopen" : "Mark fixed"} title={done ? "Reopen" : "Mark fixed"} onClick={onMark}>
            <Icon n="check" />
          </button>
        )}
      </div>
      {b.quotes.length > 0 && (
        <>
          <button type="button" className="th-pb-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? "Hide player words" : `Player words (${b.quotes.length})`}
          </button>
          {open && b.quotes.map((q, i) => (
            <blockquote key={i} className="th-pb-q">{q.text}<span>{q.source}{q.at ? `, ${day(q.at)}` : ""}</span></blockquote>
          ))}
        </>
      )}
    </article>
  );
}
