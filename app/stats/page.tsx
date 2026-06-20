import { notFound } from "next/navigation";

async function getViewCount(): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return 0;
  try {
    const res = await fetch(`${url}/get/molad_page_views`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return parseInt(data.result ?? "0", 10) || 0;
  } catch {
    return 0;
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
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-3 font-mono text-sm">
          <p className="text-red-400">Auth failed</p>
          <p className="text-white/40">secret set: {secret ? "yes" : "NO — env var missing"}</p>
          <p className="text-white/40">key received: &quot;{key ?? "(none)"}&quot;</p>
        </div>
      </main>
    );
  }

  const total = await getViewCount();
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-8">
        <p className="text-white/25 text-xs tracking-[0.35em] uppercase font-mono">
          Molad Solutions · Analytics
        </p>

        <div className="space-y-3">
          <p className="text-white/30 text-sm">Total Site Views</p>
          <p className="text-8xl font-bold tabular-nums tracking-tight">
            {total.toLocaleString()}
          </p>
        </div>

        <p className="text-white/20 text-xs">
          as of {dateStr}
        </p>
      </div>
    </main>
  );
}
