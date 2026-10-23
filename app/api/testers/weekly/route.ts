import { buildWeekly, sendToDesk } from "@/lib/assist/weekly";

// Vercel Cron calls this every Monday with Authorization: Bearer CRON_SECRET. ?dry=1 builds without sending.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  try {
    const w = await buildWeekly();
    if (!dry) await sendToDesk(w);
    return Response.json({ ok: true, dry, ...w }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("tester weekly", (e as Error).message);
    return Response.json({ ok: false, error: "report failed" }, { status: 500 });
  }
}
