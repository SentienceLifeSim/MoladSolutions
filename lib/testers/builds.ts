// Keeps the hub's Builds page in step with the App Store (owner 2026-10-23): when a new version of
// Sentience goes live, its release notes become a build post, and every "Fixed, next build" report
// becomes "Fixed and live". Apple's public lookup needs no key.
import { rest } from "./db";

const APP_ID = "6759975000";
const undash = (t: string) => t.replace(/\s[—–-]\s/g, ": ").replace(/[—–]/g, ", ");

export type SyncResult = { version: string | null; posted: boolean; fixedToLive: number };

export async function syncAppStore(dry = false): Promise<SyncResult> {
  const r = await fetch(`https://itunes.apple.com/lookup?id=${APP_ID}&country=us`, { cache: "no-store" });
  if (!r.ok) throw new Error(`app store lookup ${r.status}`);
  const app = (await r.json()).results?.[0];
  const version: string | undefined = app?.version;
  if (!version) return { version: null, posted: false, fixedToLive: 0 };
  const have = await rest<{ id: number }[]>(`tester_posts?select=id&kind=eq.build&version=eq.${encodeURIComponent(version)}`);
  if (have.length) return { version, posted: false, fixedToLive: 0 };

  const lines = String(app.releaseNotes ?? "").split("\n").map((l: string) => l.trim());
  const first = lines.find(Boolean) ?? "";
  // A short first line reads as the update's name; otherwise the notes start right away.
  const titled = first.length > 0 && first.length <= 80 && !/^[-*•]/.test(first);
  const title = undash(titled ? first : `Version ${version}`);
  const body = undash((titled ? lines.slice(lines.indexOf(first) + 1) : lines).join("\n").trim()) || null;
  if (dry) return { version, posted: true, fixedToLive: (await rest<{ id: number }[]>("tester_bugs?select=id&status=eq.fixed")).length };

  await rest("tester_posts", {
    method: "POST",
    body: { kind: "build", title, body, version, created_at: app.currentVersionReleaseDate ?? new Date().toISOString() },
  });
  const moved = await rest<{ id: number }[]>("tester_bugs?status=eq.fixed&select=id", {
    method: "PATCH", prefer: "return=representation", body: { status: "live", updated_at: new Date().toISOString() },
  });
  return { version, posted: true, fixedToLive: moved.length };
}
