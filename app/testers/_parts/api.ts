// Browser side calls to /api/testers. A 401 means the session ended.
export class SignedOut extends Error {}

export async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/testers/${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new SignedOut(data.error ?? "Please sign in again.");
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
  return data as T;
}

export function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const firstName = (n: string) => n.trim().split(/\s+/)[0] || n;
export const initial = (n: string | null) => (n ?? "?").trim().charAt(0).toUpperCase() || "?";

/** Best guess at the device from the browser, used to prefill a new report. */
export function guessDevice(): { platform: "ios" | "android"; device: string } {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.exec(ua);
  if (ios) {
    const v = /OS (\d+)[_.](\d+)/.exec(ua);
    return { platform: "ios", device: `${ios[0]}${v ? `, iOS ${v[1]}.${v[2]}` : ""}` };
  }
  const a = /Android (\d+(?:\.\d+)?)/.exec(ua);
  if (a) return { platform: "android", device: `Android ${a[1]}` };
  return { platform: "ios", device: "" };
}

/** Words that matter in a title, for spotting reports that are already on the board. */
const STOP = new Set("the a an and or but to of in on at for with is it its this that my me i when after before from was were be not can cant dont does doesnt did didnt just get got have has had".split(" "));
export function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}
