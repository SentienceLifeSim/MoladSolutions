import { timingSafeEqual } from "crypto";

// Sublime Wellness tells Sublime Desk when today's work day ends, so Discord and
// Reddit alerts wait until morning after that (owner 2026-10-23).
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Assist-Key" };
const out = (data: unknown, status = 200) => Response.json(data, { status, headers: { ...CORS, "Cache-Control": "no-store" } });

export function OPTIONS() { return new Response(null, { status: 204, headers: CORS }); }

function keyOk(req: Request) {
  const want = Buffer.from(process.env.WELLNESS_ASSIST_KEY ?? ""), got = Buffer.from(req.headers.get("x-assist-key") ?? "");
  return want.length > 0 && want.length === got.length && timingSafeEqual(want, got);
}

export async function POST(req: Request) {
  if (!keyOk(req)) return out({ error: "Not allowed." }, 401);
  const { workEnd } = (await req.json().catch(() => ({}))) as { workEnd?: unknown };
  if (typeof workEnd !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(workEnd)) return out({ error: "workEnd must look like 18:30" }, 400);
  const r = await fetch("https://www.sentiencelifesim.com/api/desk", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.DESK_TOKEN ?? ""}`, "Content-Type": "application/json" },
    body: JSON.stringify({ op: "settings.set", value: { workEnd } }),
  }).catch(() => null);
  return r?.ok ? out({ ok: true }) : out({ error: "Desk didn't answer." }, 502);
}
