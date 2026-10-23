"use client";
import { useEffect, type ReactNode } from "react";
import { STATUS_LABEL, SEVERITY_LABEL, type Status, type Severity } from "@/lib/testers/model";

const P: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  bug: "M8 6a4 4 0 0 1 8 0M7 9h10v5a5 5 0 0 1-10 0zM12 9v10M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2",
  build: "M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
  guide: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7M8 11h5",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  hand: "M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5v-6a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L3.6 16a1.6 1.6 0 0 1 2.4-2l2 2",
  chat: "M4 5h16v11H9l-5 4z",
  image: "M4 5h16v14H4zM4 15l4.5-4.5 4 4L15 12l5 5M15.5 9a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1",
  upload: "M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  phone: "M7 2.5h10v19H7zM11 18h2",
  play: "M5 3.5v17l15-8.5z",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  key: "M15 7a4 4 0 1 1-3.9 5H3v3h3v3h3v-3h2.1A4 4 0 0 1 15 7zM16 10h.01",
  pen: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  out: "M15 4h4v16h-4M10 17l5-5-5-5M15 12H3",
  check: "M5 12.5l4.5 4.5L19 7",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
};
export function Icon({ n, className = "th-ico" }: { n: keyof typeof P | string; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d={P[n] ?? ""} /></svg>;
}

export const STATUS_COLOR: Record<Status, string> = {
  new: "#818cf8", confirmed: "#fbbf24", fixing: "#c084fc", fixed: "#22d3ee", live: "#34d399", cant: "#9ca3af", wont: "#9ca3af", dup: "#9ca3af",
};
export const SEVERITY_COLOR: Record<Severity, string> = { blocker: "#f43f5e", major: "#fb923c", minor: "#facc15", polish: "#60a5fa" };

const cv = (c: string) => ({ ["--c" as string]: c });
export const StatusPill = ({ s }: { s: Status }) => <span className="th-pill" style={cv(STATUS_COLOR[s])}><i />{STATUS_LABEL[s]}</span>;
export const Sev = ({ s }: { s: Severity }) => <span className="th-sev" style={cv(SEVERITY_COLOR[s])}><i />{SEVERITY_LABEL[s]}</span>;
export const cssVar = cv;

/** Centered dialog on desktop, bottom sheet on phones. Escape and the backdrop close it. */
export function Sheet({ title, onClose, children, foot }: { title: ReactNode; onClose: () => void; children: ReactNode; foot?: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="th-veil" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="th-sheet" role="dialog" aria-modal="true">
        <header><h3>{title}</h3><button className="th-x" onClick={onClose} aria-label="Close"><Icon n="x" /></button></header>
        <div className="th-body">{children}</div>
        {foot && <div className="th-foot">{foot}</div>}
      </div>
    </div>
  );
}

export function Lightbox({ src, video, onClose }: { src: string; video: boolean; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="th-lb" onClick={onClose}>
      <button className="th-x" aria-label="Close"><Icon n="x" /></button>
      {video ? <video src={src} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} /> : <img src={src} alt="Screenshot" />}
    </div>
  );
}

/** Message Dev on Discord: the one way testers reach the owner directly. */
export function DiscordLink() {
  return <a className="th-dc" href="https://discord.com/users/1525166418965041162" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 5.3A17 17 0 0 0 15.4 4l-.5 1.1a15.7 15.7 0 0 0-5.8 0L8.6 4a17 17 0 0 0-4.2 1.3C1.7 9.3 1 13.2 1.3 17a17 17 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.8l.4-.3a12.2 12.2 0 0 0 10.4 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-3.1-11.7ZM8.7 14.7c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Zm6.6 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Z" /></svg>Message Dev on Discord</a>;
}
