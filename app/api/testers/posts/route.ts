import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import type { Post } from "@/lib/testers/model";

/** What to test this week and build notes, newest first. */
export async function GET(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  try {
    return json({ posts: await rest<Post[]>("tester_posts?select=id,kind,title,body,version,created_at&order=created_at.desc&limit=100") });
  } catch {
    return json({ error: "Couldn't load updates." }, 500);
  }
}

export async function POST(req: Request) {
  const w = await who(req);
  if (!w || w.role !== "owner") return json({ error: "Only the team can post updates." }, 403);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = b.kind === "build" ? "build" : "focus";
  const title = typeof b.title === "string" ? b.title.trim().slice(0, 140) : "";
  if (!title) return json({ error: "Add a title." }, 400);
  const s = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
  try {
    const [p] = await rest<Post[]>("tester_posts?select=id,kind,title,body,version,created_at", {
      method: "POST", prefer: "return=representation", body: { kind, title, body: s(b.body, 6000), version: s(b.version, 30) },
    });
    return json({ post: p });
  } catch {
    return json({ error: "Couldn't post that." }, 500);
  }
}

export async function DELETE(req: Request) {
  const w = await who(req);
  if (!w || w.role !== "owner") return denied();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return json({ error: "No such post." }, 404);
  try {
    await rest(`tester_posts?id=eq.${id}`, { method: "DELETE" });
    return json({ ok: true });
  } catch {
    return json({ error: "Couldn't delete that." }, 500);
  }
}
