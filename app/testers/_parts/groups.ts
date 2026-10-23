import type { Bug, Status } from "@/lib/testers/model";

// Board filters group the eight statuses into what testers care about.
export const GROUPS = [
  { key: "all", label: "All", has: null },
  { key: "open", label: "Open", has: ["new", "confirmed"] },
  { key: "fixing", label: "Being fixed", has: ["fixing"] },
  { key: "fixed", label: "Fixed", has: ["fixed", "live"] },
  { key: "closed", label: "Closed", has: ["cant", "wont", "dup"] },
] as const satisfies readonly { key: string; label: string; has: readonly Status[] | null }[];
export type GroupKey = (typeof GROUPS)[number]["key"];

export const inGroup = (b: Bug, g: GroupKey) => {
  const has = GROUPS.find((x) => x.key === g)?.has;
  return !has || (has as readonly Status[]).includes(b.status);
};

/** Testers whose reports turned out real (confirmed or further), most first. */
export function finders(bugs: Bug[]) {
  const real = new Set<Status>(["confirmed", "fixing", "fixed", "live"]);
  const m = new Map<string, { name: string; n: number; total: number; me: boolean }>();
  for (const b of bugs) {
    const name = b.reporter_name ?? "A tester";
    const r = m.get(name) ?? { name, n: 0, total: 0, me: false };
    r.total++; if (real.has(b.status)) r.n++; if (b.mine) r.me = true;
    m.set(name, r);
  }
  return [...m.values()].filter((r) => r.n > 0).sort((a, b) => b.n - a.n || b.total - a.total).slice(0, 5);
}
