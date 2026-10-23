"use client";
import { useEffect, useRef, useState } from "react";
import { RETESTABLE, VERIFY_AT, type Bug, type Retest as RetestRow, type RetestResult, type Shot } from "@/lib/testers/model";
import { ago, call, guessDevice, shownName } from "./api";
import { normalize } from "./Report";
import { Icon, Lightbox, Sev } from "./ui";

/** Reports a tester can check right now: bugs whose fix is in the store version. */
export const toRetest = (bugs: Bug[] | null) => (bugs ?? []).filter((b) => b.kind === "bug" && RETESTABLE.includes(b.status));
export const waiting = (bugs: Bug[] | null) => toRetest(bugs).filter((b) => !b.myRetest);

type Answer = { retest_ok: number; retest_still: number; status: Bug["status"]; comments?: number; myRetest: { result: RetestResult; at: string } };

/** Fixed for me / Still happening, with a note and screenshots when it's still happening. Used on the page and in a report. */
export function RetestAsk({ bug, onAnswered, toast }: { bug: Bug; onAnswered: (b: Bug) => void; toast: (m: string) => void }) {
  const [still, setStill] = useState(false), [note, setNote] = useState(""), [busy, setBusy] = useState(false);
  const [shots, setShots] = useState<{ key: string; preview: string; state: "up" | "done" | "err"; shot?: Shot }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploading = shots.some((s) => s.state === "up");

  async function add(files: FileList) {
    for (const raw of [...files].slice(0, Math.max(0, 4 - shots.length))) {
      const key = Math.random().toString(36).slice(2);
      setShots((s) => [...s, { key, preview: URL.createObjectURL(raw), state: "up" }]);
      try {
        const f = await normalize(raw);
        const { uploadUrl, publicUrl } = await call<{ uploadUrl: string; publicUrl: string }>("upload", { body: { type: f.type, size: f.size } });
        const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": f.type, "x-upsert": "false" }, body: f });
        if (!put.ok) throw new Error();
        setShots((s) => s.map((x) => (x.key === key ? { ...x, state: "done", shot: { url: publicUrl, type: f.type } } : x)));
      } catch { setShots((s) => s.map((x) => (x.key === key ? { ...x, state: "err" } : x))); }
    }
  }
  async function send(result: RetestResult) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await call<Answer>(`bugs/${bug.id}/retest`, { body: {
        result, note: result === "still" ? note : "", device: guessDevice().device,
        shots: shots.filter((s) => s.state === "done").map((s) => s.shot),
      } });
      onAnswered({ ...bug, ...r });
      toast(result === "fixed" ? (r.status === "verified" ? "Thank you. That makes it Verified fixed." : "Thank you for checking.") : "Thank you. It's back on the list and the team has been told.");
      setStill(false); setNote(""); setShots([]);
    } catch (e) { toast((e as Error).message); }
    setBusy(false);
  }

  if (bug.myRetest && !still) {
    const ok = bug.myRetest.result === "fixed";
    return (
      <div className="th-rt-done">
        <span className={ok ? "ok" : "no"}><Icon n={ok ? "check" : "flag"} />{ok ? "You said it's fixed for you" : "You said it's still happening"}</span>
        {ok && <button className="th-link" onClick={() => setStill(true)}>It came back</button>}
      </div>
    );
  }
  if (!still) {
    return (
      <div className="th-rt-acts">
        <button className="th-btn rt-ok" disabled={busy} onClick={() => send("fixed")}><Icon n="check" />Fixed for me</button>
        <button className="th-btn gh" disabled={busy} onClick={() => setStill(true)}><Icon n="flag" />Still happening</button>
      </div>
    );
  }
  return (
    <div className="th-rt-form">
      <textarea className="th-in" rows={3} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you see? Which build are you on?" />
      {shots.length > 0 && <div className="th-rt-shots">{shots.map((s) => (
        <span key={s.key} className={s.state}><img src={s.preview} alt="" />{s.state === "up" && <em>Uploading</em>}{s.state === "err" && <em>Failed</em>}</span>
      ))}</div>}
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
      <div className="th-rt-acts">
        <button className="th-btn gh sm" onClick={() => fileRef.current?.click()} disabled={shots.length >= 4}><Icon n="camera" />Screenshot</button>
        <span style={{ flex: 1 }} />
        <button className="th-btn gh sm" onClick={() => { setStill(false); setShots([]); }}>Cancel</button>
        <button className="th-btn pri sm" disabled={note.trim().length < 4 || uploading || busy} onClick={() => send("still")}>Send</button>
      </div>
    </div>
  );
}

/** Everyone's answers on one report, shown in the report itself. */
export function RetestList({ bug }: { bug: Bug }) {
  const [rows, setRows] = useState<RetestRow[] | null>(null), [lb, setLb] = useState<string | null>(null);
  const key = `${bug.id}:${bug.retest_ok}:${bug.retest_still}:${bug.status}`;
  useEffect(() => {
    let live = true;
    call<{ retests: RetestRow[] }>(`bugs/${bug.id}/retest`).then((r) => live && setRows(r.retests)).catch(() => live && setRows([]));
    return () => { live = false; };
  }, [key, bug.id]);
  if (!rows || rows.length === 0) return null;
  return (
    <div className="th-blk">
      <h5>Retests</h5>
      <div className="th-rt-list">{rows.map((r) => (
        <div key={r.id} className={r.result === "fixed" ? "ok" : "no"}>
          <Icon n={r.result === "fixed" ? "check" : "flag"} />
          <div>
            <p><b>{r.mine ? "You" : shownName(r.name)}</b> {r.result === "fixed" ? "says it's fixed" : "says it's still happening"}<span>{r.device ? `${r.device}, ` : ""}{ago(r.created_at)}</span></p>
            {r.note && <p className="nt">{r.note}</p>}
            {r.shots.length > 0 && <div className="th-rt-shots">{r.shots.map((s) => <button key={s.url} onClick={() => setLb(s.url)}><img src={s.url} alt="" /></button>)}</div>}
          </div>
        </div>
      ))}</div>
      {lb && <Lightbox src={lb} video={false} onClose={() => setLb(null)} />}
    </div>
  );
}

function Card({ b, owner, onOpen, onAnswered, toast }: { b: Bug; owner: boolean; onOpen: (id: number) => void; onAnswered: (b: Bug) => void; toast: (m: string) => void }) {
  const first = b.shots.find((s) => !s.type.startsWith("video"));
  const checked = b.retest_ok + b.retest_still;
  return (
    <article className="th-card th-rt">
      <div className="th-rt-top">
        <span className="th-rt-build live">{b.fixed_in ? `Fixed in v${b.fixed_in}` : "Fixed in the store version"}</span>
        <Sev s={b.severity} />
        <span className="th-dim" style={{ fontSize: 12.5, marginLeft: "auto" }}>{checked === 0 ? "No one has checked yet" : `Checked by ${checked} ${checked === 1 ? "tester" : "testers"}`}</span>
      </div>
      <div className="th-rt-body">
        {first && <button className="th-thumb" onClick={() => onOpen(b.id)} aria-label="Open report"><img src={first.url} alt="" loading="lazy" /></button>}
        <div style={{ minWidth: 0, flex: 1 }}>
          <button className="th-rt-title" onClick={() => onOpen(b.id)}><span>#{b.id}</span>{b.title}</button>
          <p className="th-rt-steps"><b>{b.mine ? "You wrote" : `${shownName(b.reporter_name)} wrote`}:</b> {b.happened}</p>
          {b.steps && <p className="th-rt-steps"><b>To make it happen:</b> {b.steps}</p>}
        </div>
      </div>
      {owner ? (
        <div className="th-rt-tally"><span className="ok"><Icon n="check" />{b.retest_ok} fixed</span><span className={b.retest_still ? "no" : "th-dim"}><Icon n="flag" />{b.retest_still} still happening</span>
          <span className="th-dim">{VERIFY_AT} fixed answers mark it Verified fixed</span></div>
      ) : <RetestAsk bug={b} onAnswered={onAnswered} toast={toast} />}
    </article>
  );
}

export default function Retest({ bugs, owner, onOpen, onAnswered, toast }: {
  bugs: Bug[] | null; owner: boolean; onOpen: (id: number) => void; onAnswered: (b: Bug) => void; toast: (m: string) => void;
}) {
  const all = toRetest(bugs);
  const open = owner ? all : all.filter((b) => !b.myRetest), done = owner ? [] : all.filter((b) => b.myRetest);
  const card = (b: Bug) => <Card key={b.id} b={b} owner={owner} onOpen={onOpen} onAnswered={onAnswered} toast={toast} />;
  return (
    <>
      <div className="th-sechead">
        <div><div className="th-eye">Ready to retest</div><h1 className="th-h1">Check our fixes</h1>
          <p>{owner ? "What testers say about each fix. Still happening sends it back to Confirmed and to your Desk."
            : `These bugs were fixed. Try them in your own game and tell us if the fix worked for you. Every check counts toward your month.`}</p></div>
      </div>
      {bugs === null ? <div className="th-list"><div className="th-skel" /><div className="th-skel" /></div> : all.length === 0 ? (
        <div className="th-empty">Nothing to retest right now. Fixes show up here once they&apos;re live in the App Store.</div>
      ) : (
        <div className="th-rt-wrap">
          {open.length > 0 && <section><h2 className="th-h2">In the App Store version</h2><p className="th-mut th-rt-sub">Update Sentience first, then try each one.</p>{open.map(card)}</section>}
          {!owner && open.length === 0 && <div className="th-empty">You&apos;ve checked every fix. Thank you.</div>}
          {done.length > 0 && <section><h2 className="th-h2">You checked</h2>{done.map(card)}</section>}
        </div>
      )}
    </>
  );
}
