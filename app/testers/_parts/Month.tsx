"use client";
import { useEffect, useState } from "react";
import { MONTHLY_MIN, monthEnd, monthName, monthStart, type Bug, type RosterRow } from "@/lib/testers/model";
import { call } from "./api";

const daysLeft = () => Math.max(0, Math.ceil((monthEnd().getTime() + 864e5 - Date.now()) / 864e5));
const endLabel = () => monthEnd().toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

/** A tester's own progress toward the monthly minimum. */
export function YourMonth({ bugs, onReport }: { bugs: Bug[] | null; onReport: () => void }) {
  const start = monthStart();
  const n = (bugs ?? []).filter((b) => b.mine && new Date(b.created_at) >= start).length;
  const done = n >= MONTHLY_MIN, left = MONTHLY_MIN - n;
  return (
    <div className="th-card glow th-month">
      <div className="hd">
        <div><div className="th-eye">Your {monthName()}</div>
          <p className="big">{bugs ? n : "·"}<span> of {MONTHLY_MIN} reports</span></p></div>
        {!done && <button className="th-btn pri sm" onClick={onReport}>Report a bug</button>}
      </div>
      <div className="bar"><i style={{ width: `${Math.min(100, (n / MONTHLY_MIN) * 100)}%` }} /></div>
      <p className="th-mut" style={{ margin: 0, fontSize: 14 }}>
        {done ? `You're all set for ${monthName()}. Thank you.` : `${left} more by ${endLabel()} to keep your tester spot. ${daysLeft()} ${daysLeft() === 1 ? "day" : "days"} left.`}
      </p>
    </div>
  );
}

/** The team's view: who is on track this month and who isn't. */
export function Roster() {
  const [rows, setRows] = useState<RosterRow[] | null>(null), [err, setErr] = useState("");
  useEffect(() => { call<{ roster: RosterRow[] }>("roster").then((r) => setRows(r.roster)).catch((e) => setErr((e as Error).message)); }, []);
  const short = rows?.filter((r) => r.month < MONTHLY_MIN).length ?? 0;
  return (
    <div className="th-card">
      <div className="th-sechead" style={{ marginBottom: 10 }}>
        <div><h3 className="th-h3" style={{ fontSize: 17 }}>Tester activity, {monthName()}</h3>
          <p>{rows ? `${short} of ${rows.length} still need to reach ${MONTHLY_MIN}. ${daysLeft()} days left.` : err || "Loading..."}</p></div>
      </div>
      {rows && (
        <div className="th-roster">
          <div className="hd"><span>Tester</span><span>This month</span><span>Last month</span></div>
          {rows.map((r) => (
            <div key={r.name} className={r.month >= MONTHLY_MIN ? "ok" : ""}>
              <span className="nm">{r.name}</span>
              <span><b>{r.month}</b> {r.month >= MONTHLY_MIN ? <em className="on">On track</em> : <em>{MONTHLY_MIN - r.month} to go</em>}</span>
              {r.last === null ? <span className="th-dim" style={{ fontSize: 12 }}>Before hub</span> : <span className={r.last < MONTHLY_MIN ? "lo" : ""}>{r.last}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
