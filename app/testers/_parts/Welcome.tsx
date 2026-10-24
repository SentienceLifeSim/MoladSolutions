"use client";
import { useEffect, useState } from "react";
import type { Bug } from "@/lib/testers/model";
import type { PlayerBoard } from "@/app/api/testers/player-bugs/route";
import { call } from "./api";
import { Icon } from "./ui";

// Owner only: once per visit, greet her and list what needs her right away:
// tester reports Claude graded Urgent or High that still need a status, and
// critical player bugs from the live game that are not fixed yet.
const SEEN = "th_welcome_seen";

export default function Welcome({ bugs, onOpen, onPlayers }: { bugs: Bug[]; onOpen: (id: number) => void; onPlayers: () => void }) {
  const [show, setShow] = useState(false);
  const [players, setPlayers] = useState<PlayerBoard | null | undefined>(undefined);
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === "1"; sessionStorage.setItem(SEEN, "1"); } catch { /* private mode: show it */ }
    if (seen) return;
    setShow(true);
    call<{ board: PlayerBoard | null }>("player-bugs").then((r) => setPlayers(r.board)).catch(() => setPlayers(null));
  }, []);
  useEffect(() => {
    if (!show) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [show]);
  if (!show) return null;

  const rank = { urgent: 0, high: 1 } as Record<string, number>;
  const hot = bugs
    .filter((b) => b.status === "new" && (b.urgency === "urgent" || b.urgency === "high"))
    .sort((a, z) => rank[a.urgency!] - rank[z.urgency!] || z.id - a.id);
  const waiting = bugs.filter((b) => b.status === "new" && b.kind !== "clear").length;
  const critical = players?.bugs.filter((b) => b.level === "critical" && b.status !== "shipped") ?? [];
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const close = () => setShow(false);
  const nothing = !hot.length && players !== undefined && !critical.length;

  return (
    <div className="th-veil" onClick={(e) => e.target === e.currentTarget && close()}>
      <section className="th-sheet th-welcome" role="dialog" aria-modal="true" aria-labelledby="th-welcome-h">
        <header>
          <h3 id="th-welcome-h">{hello}, Asia</h3>
          <button className="th-x" onClick={close} aria-label="Close"><Icon n="x" /></button>
        </header>
        <div className="th-body">
          <p className="th-welcome-lead">
            {nothing ? "Nothing needs you right away." : "Here's what needs your attention first."}
            {waiting > 0 && ` ${waiting} tester ${waiting === 1 ? "report is" : "reports are"} waiting for a status.`}
          </p>

          {hot.length > 0 && (
            <div className="th-welcome-group">
              <h4>Tester reports</h4>
              {hot.map((b) => (
                <button key={b.id} className="th-welcome-row" onClick={() => { close(); onOpen(b.id); }}>
                  <span className={`th-urg u-${b.urgency}`}>{b.urgency === "urgent" ? "Urgent" : "High"}</span>
                  <span className="t"><b>#{b.id} {b.title}</b>{b.urgencyWhy && <small>{b.urgencyWhy}</small>}</span>
                  <Icon n="chev" />
                </button>
              ))}
            </div>
          )}

          {players === undefined ? <div className="th-skel" /> : critical.length > 0 && (
            <div className="th-welcome-group">
              <h4>Players in the live game</h4>
              {critical.slice(0, 5).map((b) => (
                <button key={b.rank} className="th-welcome-row" onClick={() => { close(); onPlayers(); }}>
                  <span className="th-urg u-urgent">Critical</span>
                  <span className="t"><b>{b.title}</b><small>{b.players === 1 ? "1 report" : `${b.players} reports`}</small></span>
                  <Icon n="chev" />
                </button>
              ))}
              {critical.length > 5 && <p className="th-welcome-more">And {critical.length - 5} more critical in Players reported bugs.</p>}
            </div>
          )}
        </div>
        <footer className="th-foot"><button className="th-btn pri" onClick={close}>Got it</button></footer>
      </section>
    </div>
  );
}
