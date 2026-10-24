"use client";
import { useEffect, useRef } from "react";
import type { BellItem } from "@/lib/testers/bell";
import { ago } from "./api";
import { Icon } from "./ui";

export type BellState = { items: BellItem[]; unread: number };

/** The bell button: an icon in the phone header, a "Notifications" row in the sidebar. */
export function BellButton({ bell, open, onToggle, side }: { bell: BellState | null; open: boolean; onToggle: () => void; side?: boolean }) {
  const n = bell?.unread ?? 0;
  const label = n ? `Notifications, ${n} new` : "Notifications";
  // Rings once when new items arrive, never on a loop.
  const prev = useRef(n), ring = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (n > prev.current && ring.current) { ring.current.classList.remove("ring"); void ring.current.offsetWidth; ring.current.classList.add("ring"); }
    prev.current = n;
  }, [n]);
  if (side) return (
    <button type="button" className="th-bellrow" aria-expanded={open} aria-label={label} onClick={onToggle}>
      <span ref={ring} className="th-bellico ring"><Icon n="bell" /></span>Notifications{n > 0 && <span className="th-bellcnt">{n}</span>}
    </button>
  );
  return (
    <button type="button" className={`th-bellbtn${open ? " on" : ""}`} aria-expanded={open} aria-label={label} onClick={onToggle}>
      <span ref={ring} className="th-bellico ring"><Icon n="bell" /></span>{n > 0 && <span className="th-belldot">{n > 9 ? "9+" : n}</span>}
    </button>
  );
}

const ICON: Record<BellItem["kind"], string> = { build: "build", focus: "bulb", reply: "chat", fixed: "check", live: "check", tester: "chat" };

/** The list. Tapping an item marks it read and goes there. */
export function BellPanel({ bell, onPick, onReadAll, onClose }: { bell: BellState | null; onPick: (i: BellItem) => void; onReadAll: () => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const d = (e: PointerEvent) => { const t = e.target as Element; if (box.current && !box.current.contains(t) && !t.closest(".th-bellbtn,.th-bellrow")) onClose(); };
    addEventListener("keydown", k); addEventListener("pointerdown", d);
    return () => { removeEventListener("keydown", k); removeEventListener("pointerdown", d); };
  }, [onClose]);
  return (
    <div className="th-bellpnl" ref={box} role="dialog" aria-label="Notifications">
      <header><b>Notifications</b>{!!bell?.unread && <button type="button" onClick={onReadAll}>Mark all read</button>}</header>
      {!bell ? <div className="th-skel" style={{ margin: 14, height: 54 }} /> : bell.items.length === 0 ? (
        <p className="th-bellnone">Nothing new yet. Updates will show up here.</p>
      ) : (
        <div className="th-belllist">
          {bell.items.map((i) => (
            <button type="button" key={i.id} className={`th-bellit k-${i.kind}${i.unread ? " unread" : ""}`} onClick={() => onPick(i)}>
              <span className="ic">{i.kind === "reply" ? "S" : i.kind === "tester" ? (i.title.trim().charAt(0).toUpperCase() || "?") : <Icon n={ICON[i.kind]} />}</span>
              <span className="t">
                <b>{i.title}</b>
                {i.text && <span>{i.text}</span>}
                {i.quote && <q>{i.quote}</q>}
                <small>{ago(i.at)}</small>
              </span>
              <span className="u" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
