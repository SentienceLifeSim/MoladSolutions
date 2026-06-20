export async function POST(request: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return Response.json({ ok: false }, { status: 500 });
  }

  const { page = "/", newSession = false } = await request.json().catch(() => ({}));

  // Always increment per-page counter. Only increment site-wide total on new sessions.
  const commands: [string, string][] = [["INCR", `molad_views_page_${page}`]];
  if (newSession) commands.push(["INCR", "molad_views_total"]);

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  const data = await res.json();
  return Response.json({ ok: true, count: data[0]?.result });
}
