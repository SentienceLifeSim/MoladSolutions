import { syncAppStore, syncTestFlight } from "@/lib/testers/builds";

// Vercel Cron, daily. ?dry=1 reports what would happen without writing.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const dry = new URL(req.url).searchParams.get("dry") === "1";
    // App Store first, so a release and its TestFlight twin are posted once, as the release.
    const appStore = await syncAppStore(dry);
    const testFlight = await syncTestFlight(dry).catch((e) => ({ checked: 0, version: null, posted: false, reason: (e as Error).message }));
    return Response.json({ ok: true, appStore, testFlight }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("builds sync", (e as Error).message);
    return Response.json({ ok: false, error: "sync failed" }, { status: 500 });
  }
}
