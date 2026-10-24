import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";

// Owner only: bugs real players reported since the last store update, ranked by urgency.
// The list is written by the lead's Claude session into desk_settings (key bug_board) on the
// Sentience project; each row's fixed state is the matching Voices item, so a check off here
// also shows on the public Voices board, and the reverse.
export type PlayerBug = {
  rank: number; level: "critical" | "high" | "medium" | "low"; title: string; voicesId: string | null;
  players: number; why: string; cause: string | null; quotes: { text: string; source: string; at: string | null }[];
  status: "open" | "shipped";
};
export type PlayerBoard = { release: string; since: string; updatedAt: string; bugs: PlayerBug[] };

async function owner(req: Request) {
  const w = await who(req);
  if (!w) return denied();
  if (w.role !== "owner") return json({ error: "Only the team can see this." }, 403);
  return null;
}

export async function GET(req: Request) {
  const no = await owner(req);
  if (no) return no;
  try {
    const rows = await rest<{ value: Omit<PlayerBoard, "bugs"> & { bugs: Omit<PlayerBug, "status">[] } }[]>("desk_settings?select=value&key=eq.bug_board");
    const v = rows[0]?.value;
    if (!v || !Array.isArray(v.bugs)) return json({ board: null });
    const ids = v.bugs.map((b) => b.voicesId).filter((x): x is string => !!x);
    const items = ids.length
      ? await rest<{ id: string; status: string }[]>(`voices_items?select=id,status&id=in.(${ids.map((i) => `"${i}"`).join(",")})`)
      : [];
    const shipped = new Set(items.filter((i) => i.status === "shipped").map((i) => i.id));
    const board: PlayerBoard = { ...v, bugs: v.bugs.map((b) => ({ ...b, status: b.voicesId && shipped.has(b.voicesId) ? "shipped" : "open" })) };
    return json({ board });
  } catch {
    return json({ error: "Couldn't load player reports." }, 500);
  }
}

/** Mark a player bug fixed (or reopen it): sets the matching Voices item. */
export async function POST(req: Request) {
  const no = await owner(req);
  if (no) return no;
  const b = (await req.json().catch(() => null)) as { voicesId?: unknown; status?: unknown } | null;
  const id = typeof b?.voicesId === "string" ? b.voicesId : "";
  if (!/^[a-z0-9-]{3,120}$/.test(id) || (b?.status !== "open" && b?.status !== "shipped")) return json({ error: "Bad request." }, 400);
  try {
    const out = await rest<{ id: string }[]>(`voices_items?id=eq.${id}`, { method: "PATCH", body: { status: b.status }, prefer: "return=representation" });
    if (!out?.length) return json({ error: "That Voices item is gone." }, 404);
    return json({ ok: true, status: b.status });
  } catch {
    return json({ error: "Couldn't save. Try again." }, 500);
  }
}
