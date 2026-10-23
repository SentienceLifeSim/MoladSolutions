"use client";
import { useEffect, useState } from "react";
import { MONTHLY_MIN, monthEnd, monthName, type RosterRow } from "@/lib/testers/model";
import { call } from "./api";

const daysLeft = () => Math.max(0, Math.ceil((monthEnd().getTime() + 864e5 - Date.now()) / 864e5));

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
