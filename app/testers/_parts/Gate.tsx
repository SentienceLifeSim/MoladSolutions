"use client";
import { useState } from "react";
import { call } from "./api";
import { DiscordLink } from "./ui";

/** needName: a tester who hasn't told us their name yet. first: they just did, so it's "Welcome", not "Welcome back". */
export type Me = { role: "tester" | "owner"; name: string; needName?: boolean; first?: boolean };

/** Sign in: the tester code, then (first time only) the name they'd like to go by. */
export default function Gate({ onIn, askName = false }: { onIn: (me: Me) => void; askName?: boolean }) {
  const [step, setStep] = useState<"code" | "name">(askName ? "name" : "code");
  const [code, setCode] = useState(""), [name, setName] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr("");
    try {
      if (step === "code") {
        if (!code.trim()) return setBusy(false);
        const { me } = await call<{ me: Me }>("session", { body: { code } });
        if (me.needName) { setStep("name"); setBusy(false); return; }
        onIn(me);
      } else {
        if (name.trim().length < 2) return setBusy(false);
        onIn((await call<{ me: Me }>("session", { method: "PATCH", body: { name } })).me);
      }
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }
  const naming = step === "name";
  return (
    <div className="th-gate">
      <div className="th-gatebox">
        <div className="th-orb"><img src="/sentience-icon.png" alt="" /></div>
        <div className="th-word">SENTIENCE</div>
        <h1>{naming ? "One last thing" : "Tester Hub"}</h1>
        <p>{naming ? "What's your first name? It shows on your reports and comments." : "Sign in with your personal tester code. It's the same code you redeemed in the game."}</p>
        <form className="th-gateform" onSubmit={go}>
          {naming ? (
            <input key="name" className="th-in" style={{ height: 50, textAlign: "center", fontSize: 17 }} value={name} onChange={(e) => { setName(e.target.value); setErr(""); }}
              placeholder="First name" autoComplete="given-name" maxLength={30} aria-label="Your first name" autoFocus />
          ) : (
            <input key="code" className="th-code" value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} placeholder="SNT-XXXX-XXXX"
              autoCapitalize="characters" autoCorrect="off" autoComplete="one-time-code" spellCheck={false} aria-label="Tester code" autoFocus />
          )}
          <button className="th-btn pri" disabled={(naming ? name.trim().length < 2 : !code.trim()) || busy}>{busy ? (naming ? "Saving..." : "Checking...") : naming ? "Continue" : "Enter"}</button>
          <div className="th-err" role="alert">{err}</div>
        </form>
        {!naming && <p className="th-small" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>Lost your code?<DiscordLink /></p>}
      </div>
    </div>
  );
}
