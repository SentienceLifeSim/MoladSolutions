import { rest, publicShotPrefix } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import { RETEST_RESULTS, type Bug, type Retest, type RetestResult, type Shot } from "@/lib/testers/model";
import { current, deskAlert, recount } from "@/lib/testers/retest";

type Ctx = { params: Promise<{ id: string }> };
const num = (s: string) => (/^\d{1,12}$/.test(s) ? Number(s) : 0);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Every tester's answer since the current fix landed, newest first. */
export async function GET(req: Request, { params }: Ctx) {
  const w = await who(req, true);
  if (!w) return denied();
  const id = num((await params).id);
  try {
    const [bug] = await rest<Pick<Bug, "fixed_at">[]>(`tester_bugs?select=fixed_at&id=eq.${id}`);
    if (!bug) return json({ error: "No such report." }, 404);
    const rows = await rest<(Retest & { code: string })[]>(`tester_bug_retests?select=id,name,result,note,shots,device,created_at,code&bug_id=eq.${id}&order=created_at.desc`);
    return json({ retests: rows.filter((r) => current(bug, r.created_at)).map(({ code, ...r }) => ({ ...r, mine: code === w.code })) });
  } catch {
    return json({ error: "Couldn't load the retests." }, 500);
  }
}

/** A tester's answer. "Still happening" reopens the report and tells the team in Sublime Desk. */
export async function POST(req: Request, { params }: Ctx) {
  const w = await who(req, true);
  if (!w) return denied();
  if (w.role === "owner") return json({ error: "The team closes a report with the Verified fixed status." }, 403);
  const id = num((await params).id);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = b.result as RetestResult;
  if (!RETEST_RESULTS.includes(result)) return json({ error: "Choose Fixed for me or Still happening." }, 400);
  const note = text(b.note, 2000), device = text(b.device, 80) || null;
  if (result === "still" && note.length < 4) return json({ error: "Tell us what you saw so the team can look again." }, 400);
  const prefix = publicShotPrefix();
  const shots: Shot[] = (Array.isArray(b.shots) ? b.shots : [])
    .filter((s: any) => typeof s?.url === "string" && s.url.startsWith(prefix) && typeof s?.type === "string")
    .slice(0, 4).map((s: any) => ({ url: s.url, type: s.type.slice(0, 40) }));
  try {
    const [bug] = await rest<Pick<Bug, "id" | "kind" | "title" | "status" | "fixed_at">[]>(`tester_bugs?select=id,kind,title,status,fixed_at&id=eq.${id}`);
    if (!bug) return json({ error: "No such report." }, 404);
    if (bug.kind !== "bug" || !["fixed", "live", "verified"].includes(bug.status)) return json({ error: "This report isn't ready to retest." }, 400);
    const at = new Date().toISOString();
    await rest("tester_bug_retests?on_conflict=bug_id,code", {
      method: "POST", prefer: "resolution=merge-duplicates",
      body: { bug_id: id, code: w.code, name: w.name, result, note: note || null, shots, device, created_at: at },
    });
    if (result === "still") {
      // Back on the list: Confirmed, with the tester's words in the conversation for everyone.
      await rest(`tester_bugs?id=eq.${id}`, { method: "PATCH", body: { status: "confirmed", updated_at: at } });
      await rest("tester_bug_comments", { method: "POST", body: { bug_id: id, code: w.code, name: w.name, owner: false, body: `Still happening for me${device ? ` on ${device}` : ""}: ${note}` } });
      const all = await rest<{ id: number }[]>(`tester_bug_comments?select=id&bug_id=eq.${id}`);
      await rest(`tester_bugs?id=eq.${id}`, { method: "PATCH", body: { comments: all.length } });
      const counts = await recount({ ...bug, status: "confirmed" });
      await deskAlert(`Tester says #${id} is still happening: ${bug.title}`,
        `${w.name}${device ? ` (${device})` : ""} retested it and said:\n\n${note}\n\nScreenshots: ${shots.length}\nhttps://sublimelabs.tech/testers?bug=${id}\n\nThe report went back to Confirmed.`);
      return json({ ...counts, comments: all.length, myRetest: { result, at } });
    }
    return json({ ...(await recount(bug)), myRetest: { result, at } });
  } catch {
    return json({ error: "Couldn't save that. Try again in a moment." }, 500);
  }
}
