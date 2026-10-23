// Tester sign in: a personal tester code (the same one redeemed in the game)
// or the owner's admin code. The session is a signed cookie, nothing stored.
import { createHmac, timingSafeEqual } from "crypto";
import { rest } from "./db";

/** named: the tester has told us their real name (codes only carry "Tester 06"). */
export type Who = { role: "tester" | "owner"; code: string; name: string; named?: boolean };

const COOKIE = "th_session";
const DAYS = 30;
// Secure everywhere on Vercel; plain http only for a local test run.
const SECURE = process.env.VERCEL ? " Secure;" : "";

function sign(body: string) {
  return createHmac("sha256", process.env.TESTERS_SECRET ?? "").update(body).digest("base64url");
}

export function sessionCookie(who: Who): string {
  const body = Buffer.from(JSON.stringify({ ...who, exp: Date.now() + DAYS * 864e5 })).toString("base64url");
  return `${COOKIE}=${body}.${sign(body)}; Path=/; HttpOnly;${SECURE} SameSite=Lax; Max-Age=${DAYS * 86400}`;
}
export const clearCookie = `${COOKIE}=; Path=/; HttpOnly;${SECURE} SameSite=Lax; Max-Age=0`;

function readCookie(req: Request): Who | null {
  if (!process.env.TESTERS_SECRET) return null;
  const raw = (req.headers.get("cookie") ?? "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [body, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(sign(body)), got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const v = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof v.exp !== "number" || v.exp < Date.now()) return null;
    return { role: v.role === "owner" ? "owner" : "tester", code: String(v.code), name: String(v.name) };
  } catch { return null; }
}

/** Checks a typed code. Testers must still be active in tester_codes. */
export async function lookup(code: string): Promise<Who | null> {
  const c = code.trim();
  const owner = process.env.FEEDBACK_ACCESS_CODE;
  if (owner && c === owner) return { role: "owner", code: "owner", name: "Sublime Labs" };
  const up = c.toUpperCase();
  if (!/^[A-Z0-9-]{6,40}$/.test(up)) return null;
  const rows = await rest<{ code: string; name: string | null; hub_name: string | null }[]>(
    `tester_codes?select=code,name,hub_name&active=is.true&code=eq.${encodeURIComponent(up)}`,
  );
  if (!rows[0]) return null;
  const given = rows[0].hub_name?.trim();
  return { role: "tester", code: rows[0].code, name: given || rows[0].name?.trim() || `Tester ${up.slice(-4)}`, named: !!given };
}

/** The signed in person, or null. fresh re-checks that a tester was not revoked since signing in. */
export async function who(req: Request, fresh = false): Promise<Who | null> {
  const w = readCookie(req);
  if (!w || !fresh || w.role === "owner") return w;
  // Fresh: still active, and always the name they gave us, even on an older cookie.
  const rows = await rest<{ code: string; hub_name: string | null }[]>(`tester_codes?select=code,hub_name&active=is.true&code=eq.${encodeURIComponent(w.code)}`);
  if (!rows[0]) return null;
  const given = rows[0].hub_name?.trim();
  return given ? { ...w, name: given, named: true } : { ...w, named: false };
}

export const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", ...extra } });
export const denied = () => json({ error: "Please sign in again." }, 401);
