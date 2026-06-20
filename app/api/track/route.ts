export async function POST() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return Response.json({ ok: false }, { status: 500 });
  }

  const res = await fetch(`${url}/incr/molad_page_views`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  return Response.json({ ok: true, count: data.result });
}
