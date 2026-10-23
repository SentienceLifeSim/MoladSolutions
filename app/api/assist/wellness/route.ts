import { timingSafeEqual } from "crypto";
import { ask, type Turn } from "@/lib/assist/claude";
import { underLimit } from "@/lib/assist/limit";
import { SYSTEM, TOOLS } from "@/lib/assist/wellness";

// The app runs inside Capacitor, so it calls from capacitor://localhost.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Assist-Key" };
const out = (data: unknown, status = 200) => Response.json(data, { status, headers: { ...CORS, "Cache-Control": "no-store" } });

export function OPTIONS() { return new Response(null, { status: 204, headers: CORS }); }

function keyOk(req: Request) {
  const want = Buffer.from(process.env.WELLNESS_ASSIST_KEY ?? ""), got = Buffer.from(req.headers.get("x-assist-key") ?? "");
  return want.length > 0 && want.length === got.length && timingSafeEqual(want, got);
}

export async function POST(req: Request) {
  if (!keyOk(req)) return out({ error: "Not allowed." }, 401);
  if (!(await underLimit("wellness", 200))) return out({ error: "That's a lot for one day. Let's talk tomorrow, love." }, 429);
  const b = (await req.json().catch(() => ({}))) as { message?: unknown; history?: unknown; state?: unknown };
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!message) return out({ error: "Say something first." }, 400);
  const history = (Array.isArray(b.history) ? b.history : []).filter(
    (t): t is Turn => (t?.role === "user" || t?.role === "assistant") && typeof t?.text === "string" && t.text.trim().length > 0,
  );
  try {
    return out(await ask({ system: SYSTEM, tools: TOOLS, history, message, state: typeof b.state === "string" ? b.state : "" }));
  } catch (e) {
    console.error("assist wellness", (e as Error).message);
    return out({ error: "I couldn't think just now. Try again in a moment." }, 502);
  }
}
