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
        <nav className="th-tabsline" aria-label="Status">
          {GROUPS.map((g) => (
            <button key={g.key} aria-current={filter.g === g.key ? "true" : undefined} onClick={() => setFilter({ ...filter, g: g.key })}>
              {g.label}<b>{base.filter((b) => inGroup(b, g.key)).length}</b>
            </button>
          ))}
        </nav>
        <div className="th-toolbar">
          <label className="th-search"><Icon n="search" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, or #12" type="search" aria-label="Search reports" /></label>
          <select className="th-in th-sel" value={kind} onChange={(e) => setKind(e.target.value as Kind | "all")} aria-label="Type">
            <option value="all">Bugs and improvements</option><option value="bug">Bugs only</option><option value="idea">Improvements only</option><option value="clear">{KIND_LABEL.clear}</option>
          </select>
          <select className="th-in th-sel" value={plat} onChange={(e) => setPlat(e.target.value as Platform | "all")} aria-label="Device">
            <option value="all">All devices</option><option value="ios">iPhone</option><option value="android">Android</option>
          </select>
          <select className="th-in th-sel" value={sort} onChange={(e) => setSort(e.target.value as "new" | "metoo")} aria-label="Sort">
            <option value="new">Newest first</option><option value="metoo">Most Me too</option>
          </select>
          <button type="button" className="th-switch" role="switch" aria-checked={filter.mine} onClick={() => setFilter({ ...filter, mine: !filter.mine })}><i />Only mine</button>
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
