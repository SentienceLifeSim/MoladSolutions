import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import type { Comment } from "@/lib/testers/model";
import { cleanShots, saveCommentShots } from "@/lib/testers/commentShots";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const w = await who(req, true);
  if (!w) return denied();
  const raw = (await params).id, id = /^\d{1,12}$/.test(raw) ? Number(raw) : 0;
  const { body, shots: rawShots } = (await req.json().catch(() => ({}))) as { body?: unknown; shots?: unknown };
  const text = typeof body === "string" ? body.trim().slice(0, 2000) : "";
  const shots = cleanShots(rawShots);
  if (!text && !shots.length) return json({ error: "Write something or add a screenshot first." }, 400);
  try {
    const [c] = await rest<Comment[]>("tester_bug_comments?select=id,name,owner,body,created_at", {
      method: "POST", prefer: "return=representation",
      body: { bug_id: id, code: w.code, name: w.name, owner: w.role === "owner", body: text },
    });
    await saveCommentShots(c.id, shots);
    const all = await rest<{ id: number }[]>(`tester_bug_comments?select=id&bug_id=eq.${id}`);
    await rest(`tester_bugs?id=eq.${id}`, { method: "PATCH", body: { comments: all.length } });
    return json({ comment: { ...c, mine: true, shots }, count: all.length });
  } catch {
    return json({ error: "Couldn't post your comment." }, 500);
  }
}
