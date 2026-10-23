import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import { STATUSES, type Comment } from "@/lib/testers/model";

type Ctx = { params: Promise<{ id: string }> };
const num = (s: string) => (/^\d{1,12}$/.test(s) ? Number(s) : 0);

/** The conversation under one report. */
export async function GET(req: Request, { params }: Ctx) {
  const w = await who(req, true);
  if (!w) return denied();
  const id = num((await params).id);
  if (!id) return json({ error: "No such report." }, 404);
  try {
    const rows = await rest<(Comment & { code: string })[]>(`tester_bug_comments?select=id,name,owner,body,created_at,code&bug_id=eq.${id}&order=created_at.asc&limit=500`);
    return json({ comments: rows.map(({ code, ...c }) => ({ ...c, mine: code === w.code })) });
  } catch {
    return json({ error: "Couldn't load the comments." }, 500);
  }
}

/** Owner only: status, a note to testers, or marking a duplicate. */
export async function PATCH(req: Request, { params }: Ctx) {
  const w = await who(req);
  if (!w) return denied();
  if (w.role !== "owner") return json({ error: "Only the team can change a report." }, 403);
  const id = num((await params).id);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (STATUSES.includes(b.status as never)) patch.status = b.status;
  if (typeof b.owner_note === "string") patch.owner_note = b.owner_note.trim().slice(0, 2000) || null;
  if (b.duplicate_of === null || (typeof b.duplicate_of === "number" && b.duplicate_of > 0 && b.duplicate_of !== id)) patch.duplicate_of = b.duplicate_of;
  try {
    if (patch.status === "fixed" || patch.status === "live") {
      const [old] = await rest<{ status: string; fixed_in: string | null }[]>(`tester_bugs?select=status,fixed_in&id=eq.${id}`);
      // A new fix (not fixed moving to live) starts retesting over; earlier answers were about the old build.
      if (old && !["fixed", "live", "verified"].includes(old.status)) { patch.fixed_at = patch.updated_at; patch.retest_ok = 0; patch.retest_still = 0; patch.fixed_in = null; }
      // Marked live by hand: the fix is in the newest App Store version on the Builds page.
      if (patch.status === "live" && (!old?.fixed_in || patch.fixed_in === null)) {
        const [v] = await rest<{ version: string }[]>("tester_posts?select=version&kind=eq.build&version=not.is.null&version=not.like.TestFlight*&order=created_at.desc&limit=1");
        if (v) patch.fixed_in = v.version;
      }
    }
    await rest(`tester_bugs?id=eq.${id}`, { method: "PATCH", body: patch });
    return json({ ok: true, fixed_in: patch.fixed_in, fixed_at: patch.fixed_at });
  } catch {
    return json({ error: "Couldn't update the report." }, 500);
  }
}

/** Owner only: remove a report (spam or a mistake). */
export async function DELETE(req: Request, { params }: Ctx) {
  const w = await who(req);
  if (!w || w.role !== "owner") return json({ error: "Only the team can delete a report." }, 403);
  const id = num((await params).id);
  try {
    await rest(`tester_bugs?duplicate_of=eq.${id}`, { method: "PATCH", body: { duplicate_of: null } });
    await rest(`tester_bugs?id=eq.${id}`, { method: "DELETE" });
    return json({ ok: true });
  } catch {
    return json({ error: "Couldn't delete the report." }, 500);
  }
}
