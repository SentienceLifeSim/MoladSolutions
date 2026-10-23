"use client";
import { useState } from "react";
import { call } from "./api";
import { DiscordLink } from "./ui";

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
        <p className="th-small" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>Lost your code?<DiscordLink /></p>
      </div>
    </div>
  );
}
