// Server only: the tester bell (owner 2026-10-24). A tester hears about a new build or
// "What to test" post, the team replying on a report they reported, backed (Me too) or
// commented on, and their own report being fixed. Items are built from what the Hub already
// stores; only what each tester has read is kept, in desk_settings (key tester_bell), so no
// new table or column is needed.
import { rest } from "./db";
import type { Status } from "./model";

export type BellKind = "build" | "focus" | "reply" | "fixed" | "live";
export type BellItem = { id: string; kind: BellKind; title: string; text: string | null; quote: string | null; at: string; bug: number | null; comment: number | null; unread: boolean };
type Reads = { clearedAt?: string; read?: string[] };

const KEY = "tester_bell";
const DAYS = 30, FIRST_VISIT_DAYS = 7, MAX = 30;
const day = 86400000;
const iso = (t: number) => new Date(t).toISOString();
const firstLine = (s: string | null, n = 120) => {
  const l = (s ?? "").split("\n").map((x) => x.replace(/^[•\-*\s]+/, "").trim()).find(Boolean) ?? "";
  return l ? (l.length > n ? `${l.slice(0, n - 1).trimEnd()}…` : l) : null;
};
const ids = (xs: number[]) => [...new Set(xs)].join(",");

async function loadAll(): Promise<Record<string, Reads>> {
  const rows = await rest<{ value: Record<string, Reads> | null }[]>(`desk_settings?select=value&key=eq.${KEY}`);
  const v = rows[0]?.value;
  return v && typeof v === "object" ? v : {};
}

/** Marks one item read, or everything ("all"). Re-reads first so another tester's marks are kept. */
export async function markRead(code: string, item: string | "all"): Promise<void> {
  const all = await loadAll();
  const mine: Reads = all[code] ?? {};
  if (item === "all") all[code] = { clearedAt: new Date().toISOString(), read: [] };
  else all[code] = { ...mine, read: [...new Set([item, ...(mine.read ?? [])])].slice(0, 100) };
  await rest("desk_settings?on_conflict=key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: [{ key: KEY, value: all, updated_at: new Date().toISOString() }],
  });
}

/** The bell for one tester: newest first, up to 30 items from the last 30 days. */
export async function bellFor(code: string): Promise<{ items: BellItem[]; unread: number }> {
  const now = Date.now(), since = iso(now - DAYS * day);
  const c = encodeURIComponent(code);
  const [posts, mine, backed, said, reads] = await Promise.all([
    rest<{ id: number; kind: "build" | "focus"; title: string; body: string | null; version: string | null; created_at: string }[]>(`tester_posts?select=id,kind,title,body,version,created_at&created_at=gte.${since}&order=created_at.desc&limit=20`),
    rest<{ id: number; title: string; status: Status; fixed_at: string | null }[]>(`tester_bugs?select=id,title,status,fixed_at&reporter_code=eq.${c}`),
    rest<{ bug_id: number }[]>(`tester_bug_metoo?select=bug_id&code=eq.${c}`),
    rest<{ bug_id: number }[]>(`tester_bug_comments?select=bug_id&code=eq.${c}`),
    loadAll(),
  ]);
  const followed = ids([...mine.map((b) => b.id), ...backed.map((m) => m.bug_id), ...said.map((s) => s.bug_id)]);
  const [replies, titled] = followed
    ? await Promise.all([
        rest<{ id: number; bug_id: number; body: string; created_at: string }[]>(`tester_bug_comments?select=id,bug_id,body,created_at&owner=is.true&bug_id=in.(${followed})&created_at=gte.${since}&order=created_at.desc&limit=30`),
        rest<{ id: number; title: string }[]>(`tester_bugs?select=id,title&id=in.(${followed})`),
      ])
    : [[], []];
  const title = new Map(titled.map((b) => [b.id, b.title]));

  const items: Omit<BellItem, "unread">[] = [];
  for (const p of posts) {
    items.push(p.kind === "build"
      ? { id: `b${p.id}`, kind: "build", title: p.version ? `New build: ${p.version}` : `New build: ${p.title}`, text: p.version ? p.title : firstLine(p.body), quote: null, at: p.created_at, bug: null, comment: null }
      : { id: `p${p.id}`, kind: "focus", title: `This week, please test: ${p.title}`, text: firstLine(p.body), quote: null, at: p.created_at, bug: null, comment: null });
  }
  for (const r of replies) {
    if (!title.has(r.bug_id)) continue;
    items.push({ id: `c${r.id}`, kind: "reply", title: `The team replied on #${r.bug_id} ${title.get(r.bug_id)}`, text: null, quote: firstLine(r.body, 140), at: r.created_at, bug: r.bug_id, comment: r.id });
  }
  for (const b of mine) {
    if (!b.fixed_at || Date.parse(b.fixed_at) < now - DAYS * day) continue;
    if (b.status === "fixed") items.push({ id: `f${b.id}:${b.fixed_at}`, kind: "fixed", title: `#${b.id} is fixed for the next build`, text: "Retest it when the new build reaches you.", quote: null, at: b.fixed_at, bug: b.id, comment: null });
    else if (b.status === "live") items.push({ id: `l${b.id}:${b.fixed_at}`, kind: "live", title: `#${b.id} is fixed and live`, text: "Update the game, then check it on Ready to retest.", quote: null, at: b.fixed_at, bug: b.id, comment: null });
  }
  items.sort((a, z) => Date.parse(z.at) - Date.parse(a.at));

  const r = reads[code] ?? {};
  // A tester's first visit only flags the last week as new, so they don't open to a wall of old news.
  const cleared = Date.parse(r.clearedAt ?? iso(now - FIRST_VISIT_DAYS * day));
  const read = new Set(r.read ?? []);
  const out = items.slice(0, MAX).map((i) => ({ ...i, unread: Date.parse(i.at) > cleared && !read.has(i.id) }));
  return { items: out, unread: out.filter((i) => i.unread).length };
}
