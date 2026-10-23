import { lookup, who, sessionCookie, clearCookie, json, type Who } from "@/lib/testers/session";
import { rest } from "@/lib/testers/db";

const view = (w: Who, first = false) => ({ role: w.role, name: w.name, needName: w.role === "tester" && !w.named, first });

export async function GET(req: Request) {
  const w = await who(req, true);
  return json({ me: w ? view(w) : null });
}

/** Sign in with a tester code (or the team code). A tester who hasn't given their name is asked next. */
export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: unknown };
  if (typeof code !== "string" || !code.trim()) return json({ error: "Enter your tester code." }, 400);
  try {
    const w = await lookup(code);
    if (!w) return json({ error: "That code isn't on the tester list. Check it and try again." }, 401);
    if (w.role === "tester") await rest(`tester_codes?code=eq.${encodeURIComponent(w.code)}`, { method: "PATCH", body: { hub_seen_at: new Date().toISOString() } });
    return json({ me: view(w) }, 200, { "Set-Cookie": sessionCookie(w) });
  } catch {
    return json({ error: "Couldn't reach the tester list. Try again in a moment." }, 500);
  }
}

/** First sign in: the tester's real name. It also replaces the placeholder on everything they already sent. */
export async function PATCH(req: Request) {
  const w = await who(req, true);
  if (!w || w.role !== "tester") return json({ error: "Please sign in again." }, 401);
  const { name } = (await req.json().catch(() => ({}))) as { name?: unknown };
  // First name only (owner 2026-10-23).
  const clean = typeof name === "string" ? name.trim().split(/\s+/)[0].slice(0, 30) : "";
  if (clean.length < 2 || !/\p{L}/u.test(clean)) return json({ error: "Enter your first name." }, 400);
  try {
    const code = encodeURIComponent(w.code);
    await rest(`tester_codes?code=eq.${code}`, { method: "PATCH", body: { hub_name: clean } });
    await rest(`tester_bugs?reporter_code=eq.${code}`, { method: "PATCH", body: { reporter_name: clean } });
    await rest(`tester_bug_comments?code=eq.${code}`, { method: "PATCH", body: { name: clean } });
    const next: Who = { ...w, name: clean, named: true };
    return json({ me: view(next, true) }, 200, { "Set-Cookie": sessionCookie(next) });
  } catch {
    return json({ error: "Couldn't save your name. Try again in a moment." }, 500);
  }
}

export async function DELETE() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie });
}
