import { who, json, denied } from "@/lib/testers/session";
import { bellFor, markRead } from "@/lib/testers/bell";

/** The tester bell. The team never gets one: it is what the team sends. */
export async function GET(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  if (w.role === "owner") return json({ items: [], unread: 0 });
  try {
    return json(await bellFor(w.code));
  } catch {
    return json({ error: "Couldn't load notifications." }, 500);
  }
}

/** { read: "<item id>" } marks one read; { all: true } marks everything read. */
export async function POST(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  if (w.role === "owner") return json({ ok: true });
  const b = (await req.json().catch(() => ({}))) as { read?: unknown; all?: unknown };
  const item = b.all === true ? "all" : typeof b.read === "string" && /^[a-z]\d{1,12}(:[\w:.+-]{1,40})?$/.test(b.read) ? b.read : null;
  if (!item) return json({ error: "Nothing to mark." }, 400);
  try {
    await markRead(w.code, item);
    return json({ ok: true });
  } catch {
    return json({ error: "Couldn't save that. Try again." }, 500);
  }
}
