import { who, json, denied } from "@/lib/testers/session";
import { bellFor, markRead, ownerBell } from "@/lib/testers/bell";

/** The bell: a tester hears from the team; the team hears testers' comments. */
export async function GET(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  try {
    return json(w.role === "owner" ? await ownerBell() : await bellFor(w.code));
  } catch {
    return json({ error: "Couldn't load notifications." }, 500);
  }
}

/** { read: "<item id>" } marks one read; { hide: "<item id>" } removes it from the list; { all: true } marks everything read. */
export async function POST(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  const b = (await req.json().catch(() => ({}))) as { read?: unknown; hide?: unknown; all?: unknown };
  const ok = (v: unknown): v is string => typeof v === "string" && /^[a-z]\d{1,12}(:[\w:.+-]{1,40})?$/.test(v);
  const hide = ok(b.hide);
  const item = b.all === true ? "all" : ok(b.hide) ? b.hide : ok(b.read) ? b.read : null;
  if (!item) return json({ error: "Nothing to mark." }, 400);
  try {
    await markRead(w.role === "owner" ? "owner" : w.code, item, hide);
    return json({ ok: true });
  } catch {
    return json({ error: "Couldn't save that. Try again." }, 500);
  }
}
