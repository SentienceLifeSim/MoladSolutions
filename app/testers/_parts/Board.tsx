"use client";
import { useMemo, useState } from "react";
import { KIND_LABEL, type Bug, type Kind, type Platform } from "@/lib/testers/model";
import { words } from "./api";
import { GROUPS, inGroup, type GroupKey } from "./groups";
import { Icon } from "./ui";
import BugRow from "./BugRow";

export type BoardFilter = { g: GroupKey; mine: boolean };

export default function Board({ bugs, filter, setFilter, onOpen, onReport }: {
  bugs: Bug[] | null; filter: BoardFilter; setFilter: (f: BoardFilter) => void; onOpen: (id: number) => void; onReport: () => void;
}) {
  const [q, setQ] = useState(""), [plat, setPlat] = useState<Platform | "all">("all"), [sort, setSort] = useState<"new" | "metoo">("new"), [kind, setKind] = useState<Kind | "all">("all");
  const all = bugs ?? [];
  const base = all.filter((b) => (plat === "all" || b.platform === plat) && (!filter.mine || b.mine) && (kind === "all" ? b.kind !== "clear" : b.kind === kind));
  const shown = useMemo(() => {
    const qs = words(q), num = /^#?(\d+)$/.exec(q.trim());
    let r = base.filter((b) => inGroup(b, filter.g));
    if (num) r = r.filter((b) => b.id === Number(num[1]));
    else if (qs.length) {
      r = r.filter((b) => {
        const hay = `${b.title} ${b.happened} ${b.area ?? ""} ${b.device ?? ""} ${b.reporter_name ?? ""}`.toLowerCase();
        return qs.every((w) => hay.includes(w));
      });
    }
    return sort === "metoo" ? [...r].sort((a, b) => b.metoo - a.metoo || b.id - a.id) : r;
  }, [base, filter.g, q, sort]);

  return (
    <>
      <div className="th-sechead">
        <div><div className="th-eye">Bug board</div><h1 className="th-h1">Everything reported</h1>
          <p>Check here first. If it&apos;s already on the board, tap Me too instead of a new report.</p></div>
        <button className="th-btn pri" onClick={onReport} style={{ flex: "none" }}><Icon n="plus" />Report a bug</button>
      </div>
      <div className="th-tools">
        <label className="th-search"><Icon n="search" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, or type a number like #12" type="search" /></label>
        <div className="th-chips">
          {GROUPS.map((g) => (
            <button key={g.key} className="th-chip" aria-pressed={filter.g === g.key} onClick={() => setFilter({ ...filter, g: g.key })}>
              {g.label}<b>{base.filter((b) => inGroup(b, g.key)).length}</b>
            </button>
          ))}
        </div>
        <div className="th-chips">
          {(["all", "bug", "idea", "clear"] as const).map((k) => (
            <button key={k} className="th-chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k === "all" ? "Bugs and suggestions" : k === "bug" ? "Bugs" : k === "idea" ? "Suggestions" : KIND_LABEL.clear}</button>
          ))}
        </div>
        <div className="th-chips">
          {(["all", "ios", "android"] as const).map((p) => (
            <button key={p} className="th-chip" aria-pressed={plat === p} onClick={() => setPlat(p)}>{p === "all" ? "All devices" : p === "ios" ? "iPhone" : "Android"}</button>
          ))}
          <button className="th-chip sep" aria-pressed={filter.mine} onClick={() => setFilter({ ...filter, mine: !filter.mine })}>Only mine</button>
          <button className="th-chip" aria-pressed={sort === "metoo"} onClick={() => setSort(sort === "new" ? "metoo" : "new")}>Most Me too</button>
        </div>
      </div>
      {bugs === null ? (
        <div className="th-list"><div className="th-skel" /><div className="th-skel" /><div className="th-skel" /></div>
      ) : shown.length === 0 ? (
        <div className="th-empty">{all.length === 0 ? "No bugs reported yet. Be the first." : "Nothing matches. Try another filter or search."}</div>
      ) : (
        <div className="th-list">{shown.map((b) => <BugRow key={b.id} b={b} onOpen={onOpen} />)}</div>
      )}
      <button className="th-btn pri th-fab" onClick={onReport} aria-label="Report a bug"><Icon n="plus" />Report</button>
    </>
  );
}
