import { rest, publicShotPrefix } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import { current } from "@/lib/testers/retest";
import { gradeMissing, loadGrades } from "@/lib/testers/triage";
import { after } from "next/server";
import { AREAS, KINDS, KIND_LABEL, PLATFORMS, SEVERITIES, SEVERITY_LABEL, PLATFORM_LABEL, type Bug, type Kind, type Shot } from "@/lib/testers/model";

const LIST = "id,kind,title,happened,steps,expected,platform,device,app_version,severity,area,status,owner_note,duplicate_of,reporter_name,reporter_code,shots,metoo,comments,created_at,updated_at,retest_ok,retest_still,fixed_in,fixed_at";

/** Every report, newest first, marked with what is yours, what you said "me too" to, and your retest answer. */
export async function GET(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  try {
    const code = encodeURIComponent(w.code);
    const [rows, mine, tests] = await Promise.all([
      rest<(Bug & { reporter_code: string })[]>(`tester_bugs?select=${LIST}&order=created_at.desc&limit=1000`),
      rest<{ bug_id: number }[]>(`tester_bug_metoo?select=bug_id&code=eq.${code}`),
      rest<{ bug_id: number; result: "fixed" | "still"; created_at: string }[]>(`tester_bug_retests?select=bug_id,result,created_at&code=eq.${code}`),
    ]);
    const me = new Set(mine.map((m) => m.bug_id));
    const tested = new Map(tests.map((t) => [t.bug_id, t]));
    // The owner also gets Claude's urgency grade on each open report (graded here if new).
    const grades = w.role === "owner" ? await gradeMissing(rows, await loadGrades().catch(() => ({}))) : {};
    const bugs = rows.map(({ reporter_code, ...b }) => {
      const t = tested.get(b.id);
      const g = grades[b.id];
      return {
        ...b, mine: reporter_code === w.code, iMetoo: me.has(b.id), myRetest: t && current(b, t.created_at) ? { result: t.result, at: t.created_at } : null,
        ...(g ? { urgency: g.level, urgencyWhy: g.why } : {}),
      };
    });
    // Retests count toward the month even after a reopen, so send their dates on their own.
    const retestDates = tests.map((t) => t.created_at);
    return json({ bugs, retestDates });
  } catch {
    return json({ error: "Couldn't load the bug board." }, 500);
  }
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind: Kind = KINDS.includes(b.kind as never) ? (b.kind as Kind) : "bug";
  const happened = text(b.happened, 4000);
  let title = text(b.title, 140);
  if (kind === "clear" && title.length < 4) title = "Played and couldn't find a bug";
  if (title.length < 4) return json({ error: kind === "idea" ? "Give your improvement a short title." : "Give the bug a short title." }, 400);
  if (happened.length < 4) return json({ error: kind === "clear" ? "Tell us what you played and tested." : kind === "idea" ? "Tell us your idea." : "Tell us what happened." }, 400);
  const platform = PLATFORMS.includes(b.platform as never) ? (b.platform as string) : "ios";
  const severity = kind === "bug" && SEVERITIES.includes(b.severity as never) ? (b.severity as string) : kind === "bug" ? "minor" : "polish";
  const area = AREAS.includes(b.area as string) ? (b.area as string) : null;
  const prefix = publicShotPrefix();
  const shots: Shot[] = (Array.isArray(b.shots) ? b.shots : [])
    .filter((s: any) => typeof s?.url === "string" && s.url.startsWith(prefix) && typeof s?.type === "string")
    .slice(0, 6).map((s: any) => ({ url: s.url, type: s.type.slice(0, 40) }));
  try {
    // Ten reports an hour per tester is plenty and stops a stuck button from flooding the board.
    const hourAgo = new Date(Date.now() - 36e5).toISOString();
    const recent = await rest<{ id: number }[]>(`tester_bugs?select=id&reporter_code=eq.${encodeURIComponent(w.code)}&created_at=gte.${hourAgo}`);
    if (recent.length >= 10) return json({ error: "That's a lot of reports in an hour. Take a breather and try again soon." }, 429);
    const [row] = await rest<Bug[]>("tester_bugs?select=id", {
      method: "POST", prefer: "return=representation",
      body: {
        kind, title, happened, steps: text(b.steps, 4000) || null, expected: text(b.expected, 2000) || null,
        platform, device: text(b.device, 80) || null, app_version: text(b.app_version, 30) || null,
        severity, area, reporter_code: w.code, reporter_name: w.name, shots,
      },
    });
    await notifyOwner(row.id, { title, happened, platform, severity, area, name: w.name, shots: shots.length, kind });
    // Grade the new report after answering, so it is ready when the owner opens the hub.
    if (kind !== "clear") after(async () => {
      const [full] = await rest<Bug[]>(`tester_bugs?select=${LIST}&id=eq.${row.id}`).catch(() => [] as Bug[]);
      if (full) await gradeMissing([full]);
    });
    return json({ id: row.id });
  } catch {
    return json({ error: "Couldn't save your report. Try again in a moment." }, 500);
  }
}

/** An email to support for every new report, same sender as in-game feedback. Never blocks the tester. */
async function notifyOwner(id: number, r: { title: string; happened: string; platform: string; severity: string; area: string | null; name: string; shots: number; kind: Kind }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(4000),
      body: JSON.stringify({
        from: "Sentience Testers <feedback@moladsolutions.com>",
        to: ["support@sublimelabs.tech"],
        subject: `[Tester bug #${id}] ${r.kind === "bug" ? SEVERITY_LABEL[r.severity as keyof typeof SEVERITY_LABEL] : KIND_LABEL[r.kind]}: ${r.title}`,
        text: [
          `${r.name} sent ${r.kind === "bug" ? "a bug" : r.kind === "idea" ? "an improvement" : "a check-in (couldn't find a bug)"} on ${PLATFORM_LABEL[r.platform as keyof typeof PLATFORM_LABEL]}${r.area ? `, in ${r.area}` : ""}.`,
          "", r.happened, "", `Screenshots: ${r.shots}`, "", `https://sublimelabs.tech/testers?bug=${id}`,
        ].join("\n"),
      }),
    });
  } catch { /* email is a courtesy; the report is already saved */ }
}
