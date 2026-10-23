// Keeps the hub's Builds page in step with the App Store (owner 2026-10-23): when a new version of
// Sentience goes live, its release notes become a build post, and every "Fixed, next build" report
// becomes "Fixed and live". Apple's public lookup needs no key.
import { createPrivateKey, sign } from "crypto";
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

// ── TestFlight (owner 2026-10-23): the newest build that carries real "What to Test" notes ──
function ascToken(): string | null {
  const kid = process.env.ASC_KEY_ID, iss = process.env.ASC_ISSUER_ID, pem = process.env.ASC_PRIVATE_KEY;
  if (!kid || !iss || !pem) return null;
  const b64 = (x: string | Buffer) => Buffer.from(x).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const data = `${b64(JSON.stringify({ alg: "ES256", kid, typ: "JWT" }))}.${b64(JSON.stringify({ iss, iat: now, exp: now + 900, aud: "appstoreconnect-v1" }))}`;
  const sig = sign("sha256", Buffer.from(data), { key: createPrivateKey(pem.replace(/\\n/g, "\n")), dsaEncoding: "ieee-p1363" });
  return `${data}.${b64(sig)}`;
}

export type TfResult = { checked: number; version: string | null; posted: boolean; reason?: string };

export async function syncTestFlight(dry = false): Promise<TfResult> {
  const jwt = ascToken();
  if (!jwt) return { checked: 0, version: null, posted: false, reason: "no key" };
  const r = await fetch(`https://api.appstoreconnect.apple.com/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=10&include=preReleaseVersion,betaBuildLocalizations&fields[builds]=version,uploadedDate,processingState,expired,preReleaseVersion,betaBuildLocalizations&fields[preReleaseVersions]=version&fields[betaBuildLocalizations]=whatsNew,locale`, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" });
  if (!r.ok) throw new Error(`testflight ${r.status}`);
  const j = await r.json();
  const inc = new Map<string, any>((j.included ?? []).map((x: any) => [x.type + x.id, x]));
  const builds = (j.data ?? []).map((b: any) => {
    const pv = inc.get("preReleaseVersions" + b.relationships?.preReleaseVersion?.data?.id);
    const notes = (b.relationships?.betaBuildLocalizations?.data ?? []).map((d: any) => inc.get("betaBuildLocalizations" + d.id)?.attributes?.whatsNew ?? "").sort((a: string, c: string) => c.length - a.length)[0] ?? "";
    return { version: `${pv?.attributes?.version ?? "?"} (${b.attributes?.version ?? "?"})`, at: b.attributes?.uploadedDate as string, valid: b.attributes?.processingState === "VALID" && !b.attributes?.expired, notes: String(notes).trim() };
  });
  // "Testing" or a blank box tells testers nothing; the newest build with real notes wins.
  const pick = builds.find((b: any) => b.valid && b.notes.length >= 40);
  if (!pick) return { checked: builds.length, version: null, posted: false, reason: "no build with notes" };
  const lines = pick.notes.split("\n").map((l: string) => l.trim());
  const first = lines.find(Boolean) ?? "";
  const titled = first.length <= 80 && !/^[-*•]/.test(first);
  const title = undash(titled ? first : `TestFlight build ${pick.version}`);
  const body = undash((titled ? lines.slice(lines.indexOf(first) + 1) : lines).join("\n").trim()) || null;
  const version = `TestFlight ${pick.version}`;
  const existing = await rest<{ title: string; version: string | null }[]>("tester_posts?select=title,version&kind=eq.build&order=created_at.desc&limit=30");
  if (existing.some((p) => p.version === version)) return { checked: builds.length, version, posted: false, reason: "already posted" };
  // The same notes as a release already on the page (TestFlight then App Store) are posted once.
  if (existing.some((p) => p.title.trim().toLowerCase() === title.trim().toLowerCase())) return { checked: builds.length, version, posted: false, reason: "same notes as a posted release" };
  if (!dry) await rest("tester_posts", { method: "POST", body: { kind: "build", title, body, version, created_at: pick.at ?? new Date().toISOString() } });
  return { checked: builds.length, version, posted: true };
}
