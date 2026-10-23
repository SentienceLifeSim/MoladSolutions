"use client";
import { useEffect, useState } from "react";
import { KIND_LABEL, PLATFORM_LABEL, STATUSES, STATUS_LABEL, type Bug, type Comment, type Status } from "@/lib/testers/model";
import { ago, call, initial } from "./api";
import { Icon, Lightbox, Sev, Sheet, StatusPill, STATUS_COLOR, cssVar } from "./ui";
import type { Me } from "./Gate";

export default function Detail({ bug, me, onClose, onChange, onDeleted, onOpen, onMetoo, toast }: {
  bug: Bug; me: Me; onClose: () => void; onChange: (b: Bug) => void; onDeleted: (id: number) => void;
  onOpen: (id: number) => void; onMetoo: (b: Bug) => void; toast: (m: string) => void;
}) {
  const owner = me.role === "owner";
  const [cmts, setCmts] = useState<Comment[] | null>(null), [say, setSay] = useState(""), [sending, setSending] = useState(false);
  const [lb, setLb] = useState<{ src: string; video: boolean } | null>(null);
  const [note, setNote] = useState(bug.owner_note ?? ""), [dup, setDup] = useState(bug.duplicate_of ? String(bug.duplicate_of) : "");

  useEffect(() => {
    let live = true;
    setCmts(null);
    call<{ comments: Comment[] }>(`bugs/${bug.id}`).then((r) => live && setCmts(r.comments)).catch(() => live && setCmts([]));
    return () => { live = false; };
  }, [bug.id]);
  useEffect(() => { setNote(bug.owner_note ?? ""); setDup(bug.duplicate_of ? String(bug.duplicate_of) : ""); }, [bug.id, bug.owner_note, bug.duplicate_of]);

  async function post() {
    if (!say.trim() || sending) return;
    setSending(true);
    try {
      const r = await call<{ comment: Comment; count: number }>(`bugs/${bug.id}/comments`, { body: { body: say } });
      setCmts((c) => [...(c ?? []), r.comment]); setSay(""); onChange({ ...bug, comments: r.count });
    } catch (e) { toast((e as Error).message); }
    setSending(false);
  }
  async function patch(p: { status?: Status; owner_note?: string; duplicate_of?: number | null }) {
    try {
      await call(`bugs/${bug.id}`, { method: "PATCH", body: p });
      onChange({ ...bug, ...p, owner_note: p.owner_note !== undefined ? p.owner_note.trim() || null : bug.owner_note });
      toast("Saved");
    } catch (e) { toast((e as Error).message); }
  }
  async function remove() {
    if (!confirm(`Delete report #${bug.id}? This can't be undone.`)) return;
    try { await call(`bugs/${bug.id}`, { method: "DELETE" }); onDeleted(bug.id); } catch (e) { toast((e as Error).message); }
  }

  const facts: [string, string | null][] = [
    ["Device", bug.device || PLATFORM_LABEL[bug.platform]],
    ["App version", bug.app_version], ["Part of the game", bug.area],
    ["Reported by", bug.mine ? "You" : bug.reporter_name], ["When", new Date(bug.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })],
  ];

  return (
    <Sheet title={<span className="th-dim" style={{ fontWeight: 600 }}>Report #{bug.id}</span>} onClose={onClose}>
      <div className="th-dhead">
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{bug.kind === "clear" ? null : <StatusPill s={bug.status} />}{bug.kind === "bug" ? <Sev s={bug.severity} /> : <span className={`th-kind k-${bug.kind}`}>{KIND_LABEL[bug.kind]}</span>}</div>
        <h2>{bug.title}</h2>
      </div>
      {bug.status === "dup" && bug.duplicate_of && (
        <button className="th-link" style={{ alignSelf: "flex-start" }} onClick={() => onOpen(bug.duplicate_of!)}>Same as #{bug.duplicate_of}. See that report</button>
      )}
      {bug.owner_note && <div className="th-note"><b>From the team</b><p>{bug.owner_note}</p></div>}
      {bug.shots.length > 0 && (
        <div className="th-gal">
          {bug.shots.map((s) => {
            const v = s.type.startsWith("video");
            return (
              <button key={s.url} onClick={() => setLb({ src: s.url, video: v })} aria-label="Open screenshot">
                {v ? <><video src={s.url} muted playsInline preload="metadata" /><em><Icon n="play" /></em></> : <img src={s.url} alt="" loading="lazy" />}
              </button>
            );
          })}
        </div>
      )}
      <div className="th-blk"><h5>{bug.kind === "bug" ? "What happened" : bug.kind === "idea" ? "Suggestion" : "What they tested"}</h5><p>{bug.happened}</p></div>
      {bug.steps && <div className="th-blk"><h5>How to make it happen</h5><p>{bug.steps}</p></div>}
      {bug.expected && <div className="th-blk"><h5>Expected</h5><p>{bug.expected}</p></div>}
      <dl className="th-facts" style={{ margin: 0 }}>{facts.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>

      {!bug.mine && <div className="th-metoo">
        <button className="th-btn gh" aria-pressed={!!bug.iMetoo} onClick={() => onMetoo(bug)}><Icon n="hand" />{bug.iMetoo ? "You see it too" : "Me too"}</button>
        <span className="th-mut" style={{ fontSize: 14 }}>{bug.metoo === 0 ? "Seeing this as well? Let the team know." : `${bug.metoo} ${bug.metoo === 1 ? "tester sees" : "testers see"} this too`}</span>
      </div>}
      {bug.mine && bug.metoo > 0 && <p className="th-mut" style={{ margin: 0, fontSize: 14 }}>{bug.metoo} {bug.metoo === 1 ? "tester sees" : "testers see"} this too.</p>}

      {owner && (
        <div className="th-own">
          <b>Team controls</b>
          <div className="th-chips">
            {STATUSES.map((s) => <button key={s} className="th-chip" style={cssVar(STATUS_COLOR[s])} aria-pressed={bug.status === s} onClick={() => patch({ status: s })}>{STATUS_LABEL[s]}</button>)}
          </div>
          <textarea className="th-in" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A note every tester sees on this report" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button className="th-btn gh sm" disabled={note === (bug.owner_note ?? "")} onClick={() => patch({ owner_note: note })}>Save note</button>
            <input className="th-in" style={{ width: 130, padding: "8px 12px" }} inputMode="numeric" value={dup} onChange={(e) => setDup(e.target.value.replace(/\D/g, ""))} placeholder="Same as #" />
            <button className="th-btn gh sm" disabled={!dup || Number(dup) === bug.duplicate_of} onClick={() => patch({ duplicate_of: Number(dup), status: "dup" })}>Mark duplicate</button>
            <button className="th-btn danger sm" style={{ marginLeft: "auto" }} onClick={remove}>Delete</button>
          </div>
        </div>
      )}

      <div>
        <h5 className="th-dim" style={{ margin: "0 0 12px", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>Conversation</h5>
        <div className="th-cmts">
          {cmts === null ? <div className="th-skel" style={{ height: 54 }} /> : cmts.length === 0 ? (
            <p className="th-mut" style={{ margin: 0, fontSize: 14 }}>No comments yet. Add detail, or say if it happens to you differently.</p>
          ) : cmts.map((c) => (
            <div key={c.id} className={`th-cmt${c.owner ? " team" : ""}`}>
              <span className="th-av">{c.owner ? "S" : initial(c.name)}</span>
              <div className="bx">
                <div><b>{c.mine ? "You" : c.name ?? "A tester"}</b>{c.owner && <span className="tm">Team</span>}<span>{ago(c.created_at)}</span></div>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="th-say" style={{ marginTop: 14 }}>
          <textarea className="th-in" rows={1} value={say} onChange={(e) => setSay(e.target.value)} placeholder="Add a comment"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) post(); }} />
          <button className="th-btn pri sm" style={{ height: 46 }} disabled={!say.trim() || sending} onClick={post}>Send</button>
        </div>
      </div>
      {lb && <Lightbox src={lb.src} video={lb.video} onClose={() => setLb(null)} />}
    </Sheet>
  );
}
