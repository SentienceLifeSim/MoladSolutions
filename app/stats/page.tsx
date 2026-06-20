import { notFound } from "next/navigation";

async function upstashGet(url: string, token: string, commands: [string, string][]) {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  return res.json();
}

async function getStats() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { total: 0, home: 0, services: 0 };
  try {
    const data = await upstashGet(url, token, [
      ["GET", "molad_views_total"],
      ["GET", "molad_views_page_/"],
      ["GET", "molad_views_page_/services"],
    ]);
    const n = (i: number) => parseInt(data[i]?.result ?? "0", 10) || 0;
    return { total: n(0), home: n(1), services: n(2) };
  } catch {
    return { total: 0, home: 0, services: 0 };
  }
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const secret = process.env.STATS_SECRET;

  if (!secret || key !== secret) {
    notFound();
  }

  const { total, home, services } = await getStats();
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-xs space-y-10">
        <p className="text-center text-white/25 text-xs tracking-[0.35em] uppercase font-mono">
          Molad Solutions · Analytics
        </p>

        {/* Total */}
        <div className="text-center space-y-2">
          <p className="text-white/30 text-sm">Unique Visitors</p>
          <p className="text-8xl font-bold tabular-nums tracking-tight">
            {total.toLocaleString()}
          </p>
          <p className="text-white/20 text-xs">one count per browser session</p>
        </div>

        {/* Per-page breakdown */}
        <div className="space-y-3">
          {[
            { label: "Home", path: "/", count: home },
            { label: "Services", path: "/services", count: services },
          ].map(({ label, path, count }) => (
            <div
              key={path}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-sm text-white/70">{label}</p>
                <p className="text-[11px] text-white/25 font-mono">{path}</p>
              </div>
              <p className="text-xl font-bold tabular-nums">{count.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-xs">as of {dateStr}</p>
      </div>
    </main>
  );
}
