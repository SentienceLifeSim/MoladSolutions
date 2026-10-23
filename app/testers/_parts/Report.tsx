"use client";
import { useEffect, useRef, useState } from "react";
import { AREAS, PLATFORM_LABEL, PLATFORMS, SEVERITIES, SEVERITY_HINT, SEVERITY_LABEL, type Bug, type Platform, type Severity, type Shot } from "@/lib/testers/model";
import { call, guessDevice, words } from "./api";
import { Icon, Sheet, StatusPill, SEVERITY_COLOR, cssVar } from "./ui";

type Up = { key: string; preview: string; video: boolean; state: "up" | "done" | "err"; shot?: Shot; msg?: string };
type Draft = { title: string; happened: string; steps: string; expected: string; platform: Platform; device: string; version: string; severity: Severity; area: string };
const DRAFT = "th_draft", DEVICE = "th_device";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

function load<T>(k: string): T | null { try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; } }
function save(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } }

/** HEIC and other image types become JPEG in the browser, so every screenshot can be shown on the board. */
async function normalize(f: File): Promise<File> {
  if (ALLOWED.includes(f.type)) return f;
  if (!f.type.startsWith("image/") && !/\.hei[cf]$/i.test(f.name)) throw new Error("Screenshots or screen recordings only.");
  const bmp = await createImageBitmap(f).catch(() => { throw new Error("That image type can't be read here. Try a PNG or JPEG."); });
  const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height;
  c.getContext("2d")!.drawImage(bmp, 0, 0);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.9));
  if (!blob) throw new Error("Couldn't convert that image.");
  return new File([blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export default function Report({ bugs, onClose, onDone, onOpen, onMetoo }: {
  bugs: Bug[]; onClose: () => void; onDone: (id: number) => void; onOpen: (id: number) => void; onMetoo: (b: Bug) => void;
}) {
  const [d, setD] = useState<Draft>(() => {
    const g = guessDevice(), dev = load<{ platform: Platform; device: string; version: string }>(DEVICE);
    return { title: "", happened: "", steps: "", expected: "", severity: "minor", area: "", platform: dev?.platform ?? g.platform, device: dev?.device ?? g.device, version: dev?.version ?? "", ...load<Partial<Draft>>(DRAFT) };
  });
  const [ups, setUps] = useState<Up[]>([]), [over, setOver] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null), hp = useRef<HTMLInputElement>(null);
  const set = (p: Partial<Draft>) => setD((o) => ({ ...o, ...p }));

  useEffect(() => { save(DRAFT, d); }, [d]);

  async function add(files: FileList | File[]) {
    const list = [...files].slice(0, Math.max(0, 6 - ups.length));
    for (const raw of list) {
      const key = Math.random().toString(36).slice(2);
      const video = raw.type.startsWith("video");
      setUps((u) => [...u, { key, preview: URL.createObjectURL(raw), video, state: "up" }]);
      try {
        const f = await normalize(raw);
        const { uploadUrl, publicUrl } = await call<{ uploadUrl: string; publicUrl: string }>("upload", { body: { type: f.type, size: f.size } });
        const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": f.type, "x-upsert": "false" }, body: f });
        if (!put.ok) throw new Error("Upload failed. Try again.");
        setUps((u) => u.map((x) => (x.key === key ? { ...x, state: "done", shot: { url: publicUrl, type: f.type } } : x)));
      } catch (e) {
        setUps((u) => u.map((x) => (x.key === key ? { ...x, state: "err", msg: (e as Error).message } : x)));
      }
    }
  }

  useEffect(() => {
    const p = (e: ClipboardEvent) => { const f = [...(e.clipboardData?.files ?? [])]; if (f.length) { e.preventDefault(); add(f); } };
    window.addEventListener("paste", p);
    return () => window.removeEventListener("paste", p);
  });

  // Reports already on the board that share words with this title.
  const tw = words(d.title);
  const dupes = tw.length === 0 ? [] : bugs
    .map((b) => ({ b, n: words(b.title).filter((w) => tw.includes(w)).length }))
    .filter((x) => x.n >= Math.min(2, tw.length) && !["wont", "dup"].includes(x.b.status))
    .sort((a, b) => b.n - a.n).slice(0, 3).map((x) => x.b);

  const uploading = ups.some((u) => u.state === "up");
  const ready = d.title.trim().length >= 4 && d.happened.trim().length >= 4 && !uploading && !busy;

  async function send() {
    if (!ready) return;
    if (hp.current?.value) { onClose(); return; }
    setBusy(true); setErr("");
    try {
      const { id } = await call<{ id: number }>("bugs", { body: {
        title: d.title, happened: d.happened, steps: d.steps, expected: d.expected, platform: d.platform,
        device: d.device, app_version: d.version, severity: d.severity, area: d.area,
        shots: ups.filter((u) => u.state === "done").map((u) => u.shot),
      } });
      save(DEVICE, { platform: d.platform, device: d.device, version: d.version });
      try { localStorage.removeItem(DRAFT); } catch { /* private mode */ }
      onDone(id);
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  return (
    <Sheet title="Report a bug" onClose={onClose} foot={<>
      <span className="msg">{err || (uploading ? "Uploading..." : "")}</span>
      <button className="th-btn gh sm" onClick={onClose}>Cancel</button>
      <button className="th-btn pri sm" disabled={!ready} onClick={send}>{busy ? "Sending..." : "Send report"}</button>
    </>}>
      <input ref={hp} className="th-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="th-f">
        <label htmlFor="r-title">Title</label>
        <input id="r-title" className="th-in" value={d.title} onChange={(e) => set({ title: e.target.value })} maxLength={140} placeholder="Short and specific, like Wedding popup shows twice" autoFocus />
      </div>
      {dupes.length > 0 && (
        <div className="th-dupes">
          <p>Already on the board?</p>
          {dupes.map((b) => (
            <div className="th-dupe" key={b.id}>
              <StatusPill s={b.status} />
              <span role="button" tabIndex={0} style={{ cursor: "pointer" }} onClick={() => onOpen(b.id)}>#{b.id} {b.title}</span>
              {b.mine ? <span className="th-mine">Yours</span> : <button className="th-btn gh sm" style={{ height: 30 }} aria-pressed={b.iMetoo} onClick={() => onMetoo(b)}>{b.iMetoo ? "Counted" : "Me too"}</button>}
            </div>
          ))}
        </div>
      )}
      <div className="th-f">
        <label htmlFor="r-what">What happened</label>
        <textarea id="r-what" className="th-in" rows={3} value={d.happened} onChange={(e) => set({ happened: e.target.value })} placeholder="Tell us what you saw." />
      </div>
      <div className="th-f">
        <label htmlFor="r-steps">How to make it happen<small>optional</small></label>
        <textarea id="r-steps" className="th-in" rows={3} value={d.steps} onChange={(e) => set({ steps: e.target.value })} placeholder={"1. Opened the Relationships tab\n2. Tapped Propose\n3. ..."} />
      </div>
      <div className="th-f">
        <label htmlFor="r-exp">What you expected<small>optional</small></label>
        <input id="r-exp" className="th-in" value={d.expected} onChange={(e) => set({ expected: e.target.value })} placeholder="What should have happened instead?" />
      </div>
      <div className="th-f">
        <span className="th-lbl">Screenshots or a recording<small>up to 6</small></span>
        <div className={`th-drop${over ? " over" : ""}`} role="button" tabIndex={0}
          onClick={() => fileRef.current?.click()} onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}>
          <Icon n="upload" /><b>Add screenshots</b><span>Tap to choose, drag them here, or paste</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
        {ups.length > 0 && (
          <div className="th-shots">
            {ups.map((u) => (
              <div key={u.key} className={`th-shot${u.state === "err" ? " err" : ""}`} title={u.msg}>
                {u.video ? <video src={u.preview} muted playsInline /> : <img src={u.preview} alt="" />}
                {u.state === "up" && <span className="st">Uploading</span>}
                {u.state === "err" && <span className="st" style={{ color: "#fda4af" }}>{u.msg ?? "Failed"}</span>}
                <button className="rm" aria-label="Remove" onClick={() => setUps((x) => x.filter((y) => y.key !== u.key))}><Icon n="x" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="th-f">
        <span className="th-lbl">How bad is it?</span>
        <div className="th-sevs">
          {SEVERITIES.map((s) => (
            <button key={s} type="button" style={cssVar(SEVERITY_COLOR[s])} aria-pressed={d.severity === s} onClick={() => set({ severity: s })}>
              <b><i />{SEVERITY_LABEL[s]}</b><span>{SEVERITY_HINT[s]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="th-f">
        <span className="th-lbl">Device</span>
        <div className="th-seg">{PLATFORMS.map((p) => <button key={p} type="button" aria-pressed={d.platform === p} onClick={() => set({ platform: p })}>{PLATFORM_LABEL[p]}</button>)}</div>
      </div>
      <div className="th-row2">
        <div className="th-f"><label htmlFor="r-dev">Model and OS<small>optional</small></label>
          <input id="r-dev" className="th-in" value={d.device} onChange={(e) => set({ device: e.target.value })} placeholder={d.platform === "ios" ? "iPhone 16, iOS 26.1" : "Pixel 9, Android 15"} /></div>
        <div className="th-f"><label htmlFor="r-ver">App version<small>optional</small></label>
          <input id="r-ver" className="th-in" value={d.version} onChange={(e) => set({ version: e.target.value })} placeholder={d.platform === "ios" ? "Like 5.54" : "Like 2.2"} /></div>
      </div>
      <div className="th-f">
        <label htmlFor="r-area">Part of the game<small>optional</small></label>
        <select id="r-area" className="th-in" value={d.area} onChange={(e) => set({ area: e.target.value })}>
          <option value="">Not sure</option>{AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
    </Sheet>
  );
}
