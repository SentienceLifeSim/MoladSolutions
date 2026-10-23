"use client";
import { useEffect, useRef, useState } from "react";
import { SEVERITY_LABEL, STATUS_LABEL, type Bug, type Severity, type Status } from "@/lib/testers/model";
import { call } from "./api";
import { Icon } from "./ui";
import type { Me } from "./Gate";
import type { Prefill } from "./Report";

type Action = { name: string; input: Record<string, any> };
type Turn = { role: "user" | "assistant"; text: string; actions?: Action[]; state?: "open" | "applied" | "dismissed" };

const SPARK = "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z";
const HINTS = {
  tester: ["The wedding popup showed up twice", "How many reports do I have this month?", "How do I record my screen?"],
  owner: ["Find duplicates on the board", "Draft this week's What to test", "Who is short this month?"],
};

/** The hub's helper: testers describe a bug and get a filled report; the team gets sorting help. */
export default function Assist({ me, bugs, onDraft, onMetoo, onChanged, toast }: {
  me: Me; bugs: Bug[] | null; onDraft: (p: Prefill) => void; onMetoo: (b: Bug) => Promise<void>; onChanged: () => Promise<void>; toast: (m: string) => void;
}) {
  const owner = me.role === "owner";
  const [open, setOpen] = useState(false), [turns, setTurns] = useState<Turn[]>([]), [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [turns, busy, open]);
  const bug = (id: unknown) => bugs?.find((b) => b.id === id);
  const name = (id: unknown) => (bug(id) ? `#${id} ${bug(id)!.title}` : `#${id}`);

  function describe(a: Action): string {
    const i = a.input;
    switch (a.name) {
      case "draft_report": return `Open a report: ${i.title} (${SEVERITY_LABEL[i.severity as Severity] ?? "Minor"})`;
      case "me_too": return `Me too on ${name(i.id)}`;
      case "mark_duplicate": return `${name(i.id)} is the same as #${i.of}`;
      case "set_status": return `${name(i.id)}: ${STATUS_LABEL[i.status as Status] ?? i.status}`;
      case "team_note": return `Note on ${name(i.id)}: ${i.note}`;
      case "post_update": return `${i.kind === "build" ? "Build notes" : "What to test"}: ${i.title}`;
      default: return a.name;
    }
  }

  async function apply(a: Action): Promise<boolean> {
    const i = a.input;
    switch (a.name) {
      case "draft_report":
        onDraft({
          title: String(i.title ?? ""), happened: String(i.happened ?? ""), steps: i.steps ?? "", expected: i.expected ?? "",
          severity: i.severity, ...(i.area ? { area: i.area } : {}), ...(i.platform ? { platform: i.platform } : {}), ...(i.device ? { device: i.device } : {}),
        });
        setOpen(false);
        return false;
      case "me_too": { const b = bug(i.id); if (b && !b.mine && !b.iMetoo) await onMetoo(b); return false; }
      case "mark_duplicate": if (bug(i.id) && bug(i.of) && i.id !== i.of) await call(`bugs/${i.id}`, { method: "PATCH", body: { duplicate_of: i.of, status: "dup" } }); return true;
      case "set_status": if (bug(i.id)) await call(`bugs/${i.id}`, { method: "PATCH", body: { status: i.status } }); return true;
      case "team_note": if (bug(i.id)) await call(`bugs/${i.id}`, { method: "PATCH", body: { owner_note: String(i.note ?? "") } }); return true;
      case "post_update": await call("posts", { body: { kind: i.kind, title: i.title, body: i.body ?? "", version: i.version ?? "" } }); return true;
    }
    return false;
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    const history = turns.map((t) => ({ role: t.role, text: t.text + (t.actions?.length ? `\n(Proposed: ${t.actions.map(describe).join("; ")}. ${t.state === "applied" ? "Applied." : t.state === "dismissed" ? "Not now." : ""})` : "") }));
    setTurns((x) => [...x, { role: "user", text: message }]); setDraft(""); setErr(""); setBusy(true);
    try {
      const r = await call<{ reply: string; actions: Action[] }>("assist", { body: { message, history } });
      const actions = Array.isArray(r.actions) ? r.actions : [];
      setTurns((x) => [...x, { role: "assistant", text: r.reply || (actions.length ? "Here's what I'd do:" : "I'm here."), actions, state: actions.length ? "open" : undefined }]);
    } catch (e) {
      setErr((e as Error).message); setTurns((x) => x.slice(0, -1)); setDraft(message);
    }
    setBusy(false);
  }

  async function applyTurn(n: number) {
    const t = turns[n];
    if (!t?.actions || t.state !== "open") return;
    setTurns((x) => x.map((y, k) => (k === n ? { ...y, state: "applied" } : y)));
    let changed = false;
    try { for (const a of t.actions) changed = (await apply(a)) || changed; } catch (e) { toast((e as Error).message); }
    if (changed) { await onChanged(); toast("Done"); }
  }

  return (
    <>
      <button className="th-astab" aria-label="Ask the helper" onClick={() => setOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={SPARK} /></svg></button>
      {open && (
        <div className="th-veil" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="th-sheet th-aspanel" role="dialog" aria-modal="true" aria-label="Helper">
            <header><h3><span className="th-eye">{owner ? "Team helper" : "Your helper"}</span></h3><button className="th-x" onClick={() => setOpen(false)} aria-label="Close"><Icon n="x" /></button></header>
            <div className="th-aslog" ref={log}>
              {turns.length === 0 && (
                <>
                  <div className="th-am a"><p>{owner ? "I can find duplicates, help you sort reports, and draft What to test or build notes. Nothing changes until you tap Apply." : "Tell me what went wrong in your own words. I'll check whether it's already on the board, or fill in a report for you to finish with a screenshot."}</p></div>
                  <div className="th-chips" style={{ flexWrap: "wrap" }}>{HINTS[owner ? "owner" : "tester"].map((h) => <button key={h} className="th-chip" onClick={() => setDraft(h)}>{h}</button>)}</div>
                </>
              )}
              {turns.map((t, n) => (
                <div key={n} className={`th-am ${t.role === "user" ? "u" : "a"}`}>
                  <p>{t.text}</p>
                  {!!t.actions?.length && (
                    <div className="th-asprop">
                      <ul>{t.actions.map((a, k) => <li key={k}>{describe(a)}</li>)}</ul>
                      {t.state === "open" ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="th-btn pri sm" onClick={() => void applyTurn(n)}>{t.actions.some((a) => a.name === "draft_report") ? "Open the report" : "Apply"}</button>
                          <button className="th-btn gh sm" onClick={() => setTurns((x) => x.map((y, k) => (k === n ? { ...y, state: "dismissed" } : y)))}>Not now</button>
                        </div>
                      ) : <span className="th-dim" style={{ fontSize: 12.5, fontWeight: 600 }}>{t.state === "applied" ? "Done" : "Left as is"}</span>}
                    </div>
                  )}
                </div>
              ))}
              {busy && <div className="th-am a"><p className="th-dots"><i /><i /><i /></p></div>}
              {err && <p className="th-err" style={{ textAlign: "center" }}>{err}</p>}
            </div>
            <form className="th-ascompose" onSubmit={(e) => { e.preventDefault(); void send(draft); }}>
              <textarea className="th-in" rows={1} value={draft} placeholder={owner ? "Find duplicates..." : "What went wrong?"} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(draft); } }} />
              <button className="th-btn pri" style={{ width: 46, height: 46, padding: 0, borderRadius: "50%" }} disabled={busy || !draft.trim()} aria-label="Send">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
