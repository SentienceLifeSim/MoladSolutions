import { lookup, who, sessionCookie, clearCookie, json } from "@/lib/testers/session";

export async function GET(req: Request) {
  const w = await who(req, true);
  return json({ me: w ? { role: w.role, name: w.name } : null });
}

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: unknown };
  if (typeof code !== "string" || !code.trim()) return json({ error: "Enter your tester code." }, 400);
  try {
    const w = await lookup(code);
    if (!w) return json({ error: "That code isn't on the tester list. Check it and try again." }, 401);
    return json({ me: { role: w.role, name: w.name } }, 200, { "Set-Cookie": sessionCookie(w) });
  } catch {
    return json({ error: "Couldn't reach the tester list. Try again in a moment." }, 500);
  }
}

export async function DELETE() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie });
}
