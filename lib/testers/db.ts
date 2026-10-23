// Server only: talks to the Sentience Supabase project with the service role.
const BASE = () => process.env.SUPABASE_URL ?? "";
const KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function headers(extra: Record<string, string> = {}) {
  return { apikey: KEY(), Authorization: `Bearer ${KEY()}`, "Content-Type": "application/json", ...extra };
}

/** PostgREST call. Throws on any non-2xx so routes answer with one error path. */
export async function rest<T = unknown>(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  const res = await fetch(`${BASE()}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers: headers(init.prefer ? { Prefer: init.prefer } : {}),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`db ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** A one-time upload link straight to the screenshot bucket, so big files never pass through Vercel. */
export async function signedUpload(path: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const res = await fetch(`${BASE()}/storage/v1/object/upload/sign/tester-shots/${path}`, {
    method: "POST", headers: headers(), body: "{}", cache: "no-store",
  });
  if (!res.ok) throw new Error(`storage ${res.status}`);
  const { url } = (await res.json()) as { url: string };
  return {
    uploadUrl: `${BASE()}/storage/v1${url}`,
    publicUrl: `${BASE()}/storage/v1/object/public/tester-shots/${path}`,
  };
}

export const publicShotPrefix = () => `${BASE()}/storage/v1/object/public/tester-shots/`;
