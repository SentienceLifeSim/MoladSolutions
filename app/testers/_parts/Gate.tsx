"use client";
import { useState } from "react";
import { call } from "./api";

export type Me = { role: "tester" | "owner"; name: string };

export default function Gate({ onIn }: { onIn: (me: Me) => void }) {
  const [code, setCode] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true); setErr("");
    try { onIn((await call<{ me: Me }>("session", { body: { code } })).me); }
    catch (x) { setErr((x as Error).message); setBusy(false); }
  }
  return (
    <div className="th-gate">
      <div className="th-gatebox">
        <div className="th-orb"><img src="/sentience-icon.png" alt="" /></div>
        <div className="th-word">SENTIENCE</div>
        <h1>Tester Hub</h1>
        <p>Sign in with your personal tester code. It&apos;s the same code you redeemed in the game.</p>
        <form className="th-gateform" onSubmit={go}>
          <input className="th-code" value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} placeholder="SNT-XXXX-XXXX"
            autoCapitalize="characters" autoCorrect="off" autoComplete="one-time-code" spellCheck={false} aria-label="Tester code" autoFocus />
          <button className="th-btn pri" disabled={!code.trim() || busy}>{busy ? "Checking..." : "Enter"}</button>
          <div className="th-err" role="alert">{err}</div>
        </form>
        <p className="th-small" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>Lost your code?<a className="th-dc" href="https://discord.com/users/1525166418965041162" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 5.3A17 17 0 0 0 15.4 4l-.5 1.1a15.7 15.7 0 0 0-5.8 0L8.6 4a17 17 0 0 0-4.2 1.3C1.7 9.3 1 13.2 1.3 17a17 17 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.8l.4-.3a12.2 12.2 0 0 0 10.4 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-3.1-11.7ZM8.7 14.7c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Zm6.6 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Z" /></svg>Message Dev on Discord</a></p>
      </div>
    </div>
  );
}
