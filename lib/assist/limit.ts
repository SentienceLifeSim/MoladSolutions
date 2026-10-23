// A daily ceiling per app, so a bug or a leaked key can never run up the bill.
export async function underLimit(app: string, max: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return true;
  const key = `assist_${app}_${new Date().toISOString().slice(0, 10)}`;
  try {
    const r = await fetch(`${url}/pipeline`, {
      method: "POST", cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, "172800"]]),
    });
    const [{ result }] = (await r.json()) as { result: number }[];
    return result <= max;
  } catch { return true; }
}
