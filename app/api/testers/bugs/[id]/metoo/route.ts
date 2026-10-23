import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";

type Ctx = { params: Promise<{ id: string }> };

/** "Me too": one per tester per report, tapping again takes it back. Returns the new count. */
export async function POST(req: Request, { params }: Ctx) {
  const w = await who(req, true);
  if (!w) return denied();
  const raw = (await params).id, id = /^\d{1,12}$/.test(raw) ? Number(raw) : 0;
  const { on } = (await req.json().catch(() => ({}))) as { on?: boolean };
  try {
    const code = encodeURIComponent(w.code);
    if (on) await rest("tester_bug_metoo", { method: "POST", prefer: "resolution=ignore-duplicates", body: { bug_id: id, code: w.code } });
    else await rest(`tester_bug_metoo?bug_id=eq.${id}&code=eq.${code}`, { method: "DELETE" });
    // Recount from the source table so the cached number can never drift.
    const all = await rest<{ code: string }[]>(`tester_bug_metoo?select=code&bug_id=eq.${id}`);
    await rest(`tester_bugs?id=eq.${id}`, { method: "PATCH", body: { metoo: all.length } });
    return json({ metoo: all.length, iMetoo: all.some((m) => m.code === w.code) });
  } catch {
    return json({ error: "Couldn't save that." }, 500);
  }
}
