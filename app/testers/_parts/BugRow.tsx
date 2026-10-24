"use client";
import type { Bug } from "@/lib/testers/model";
import { KIND_LABEL, PLATFORM_LABEL } from "@/lib/testers/model";
import { ago, shownName } from "./api";
import { Icon, StatusPill, Sev } from "./ui";

// Only the owner's board carries urgency (the server never sends it to testers).
const URGENCY_TEXT = { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" } as const;

/** Owner only: "Mentioned twice", and whether players reported it in the live game too. */
function dupe(b: Bug) {
  const t = b.sameTesters?.length ?? 0, p = b.samePlayers?.length ?? 0;
  if (!t && !p) return null;
  const times = 1 + t + p;
  const words = times === 2 ? "Mentioned twice" : `Mentioned ${times} times`;
  const who = t && p ? "testers and players" : p ? "players too" : "testers";
  const tip = [t ? `Same as tester report ${b.sameTesters!.map((x) => `#${x}`).join(", ")}` : "", p ? "Also in Players reported bugs" : ""].filter(Boolean).join(". ");
  return <><span className="th-dupe-tag" title={tip}>{words}: {who}</span><i className="dot" /></>;
}

export default function BugRow({ b, onOpen }: { b: Bug; onOpen: (id: number) => void }) {
  const first = b.shots[0], vid = first?.type.startsWith("video");
  return (
    <button className="th-bug" onClick={() => onOpen(b.id)}>
      <span className="th-thumb">
        {first ? (vid ? <video src={first.url} muted playsInline preload="metadata" /> : <img src={first.url} alt="" loading="lazy" />) : <Icon n={b.kind === "idea" ? "bulb" : b.kind === "clear" ? "check" : "bug"} />}
        {b.shots.length > 1 && <em>+{b.shots.length - 1}</em>}
      </span>
      <span className="bd">
        <span className="tp">
          <span className="tt"><span>#{b.id}</span>{b.title}</span>
          <span className="th-pills">
            {b.urgency && <span className={`th-urg u-${b.urgency}`} title={b.urgencyWhy}>{URGENCY_TEXT[b.urgency]}</span>}
            <StatusPill s={b.status} />
          </span>
        </span>
        <span className="th-meta">
          {b.kind === "bug" ? <Sev s={b.severity} /> : <span className={`th-kind k-${b.kind}`}>{KIND_LABEL[b.kind]}</span>}<i className="dot" />{PLATFORM_LABEL[b.platform]}{b.area && <><i className="dot" />{b.area}</>}
        </span>
        <span className="th-meta">
          {dupe(b)}
          {b.mine ? <span className="th-mine">Yours</span> : <span>{shownName(b.reporter_name)}</span>}<i className="dot" />{ago(b.created_at)}
          <span className="th-counts" style={{ marginLeft: "auto" }}>
            <span className={b.iMetoo ? "on" : ""}><Icon n="hand" />{b.metoo}</span>
            <span><Icon n="chat" />{b.comments}</span>
          </span>
        </span>
      </span>
    </button>
  );
}
