import { ask, type Turn } from "@/lib/assist/claude";
import { underLimit } from "@/lib/assist/limit";
import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import { MONTHLY_MIN, STATUS_LABEL, monthStart, type Bug, type Post, type Status } from "@/lib/testers/model";
import { TEAM_SYSTEM, TEAM_TOOLS, TESTER_SYSTEM, TESTER_TOOLS } from "@/lib/assist/testers";

/** The board as the assistant sees it, read here on the server so it is always the real one. */
async function board(me: { role: string; code: string; name: string }): Promise<string> {
  const [bugs, posts] = await Promise.all([
    rest<(Bug & { reporter_code: string })[]>("tester_bugs?select=id,kind,title,status,severity,platform,area,metoo,reporter_name,reporter_code,duplicate_of,created_at,happened&order=created_at.desc&limit=200"),
    rest<Post[]>("tester_posts?select=kind,title,version,created_at&order=created_at.desc&limit=10"),
  ]);
  const owner = me.role === "owner";
  const line = (b: Bug & { reporter_code: string }) =>
    `#${b.id} ${b.kind === "idea" ? "(suggestion) " : b.kind === "clear" ? "(couldn't find a bug) " : ""}${b.title} [${STATUS_LABEL[b.status as Status]}, ${b.severity}, ${b.platform}${b.area ? `, ${b.area}` : ""}, ${b.metoo} me too${b.duplicate_of ? `, same as #${b.duplicate_of}` : ""}${b.reporter_code === me.code ? ", theirs" : ""}${owner ? `, by ${b.reporter_name ?? "a tester"}, ${b.created_at.slice(0, 10)}: ${b.happened.slice(0, 160).replace(/\s+/g, " ")}` : ""}]`;
  const start = monthStart();
  const mine = bugs.filter((b) => b.reporter_code === me.code && new Date(b.created_at) >= start).length;
  const parts = [
    `Today: ${new Date().toISOString().slice(0, 10)}`,
    `Reports (${bugs.length}):\n${bugs.map(line).join("\n") || "none yet"}`,
    `Recent posts: ${posts.map((p) => `${p.kind === "build" ? "Build" : "What to test"}: ${p.title}${p.version ? ` v${p.version}` : ""}`).join("; ") || "none"}`,
  ];
  if (!owner) parts.push(`This tester (${me.name}) has ${mine} of ${MONTHLY_MIN} reports this month.`);
  else {
    const codes = await rest<{ code: string; name: string | null }[]>("tester_codes?select=code,name&active=is.true");
    const counts = codes.map((c) => `${c.name ?? c.code.slice(-4)} ${bugs.filter((b) => b.reporter_code === c.code && new Date(b.created_at) >= start).length}`);
    parts.push(`Reports this month per tester (minimum ${MONTHLY_MIN}): ${counts.join(", ")}`);
  }
  return parts.join("\n\n");
}

export async function POST(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  const owner = w.role === "owner";
  if (!(await underLimit(owner ? "testers_team" : `testers_${w.code}`, owner ? 200 : 40))) {
    return json({ error: "That's the limit for today. Try again tomorrow." }, 429);
  }
  const b = (await req.json().catch(() => ({}))) as { message?: unknown; history?: unknown };
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!message) return json({ error: "Say something first." }, 400);
  const history = (Array.isArray(b.history) ? b.history : []).filter(
    (t): t is Turn => (t?.role === "user" || t?.role === "assistant") && typeof t?.text === "string" && t.text.trim().length > 0,
  );
  try {
    const state = await board(w);
    return json(await ask({ system: owner ? TEAM_SYSTEM : TESTER_SYSTEM, tools: owner ? TEAM_TOOLS : TESTER_TOOLS, history, message, state, stateTag: "board" }));
  } catch (e) {
    console.error("assist testers", (e as Error).message);
    return json({ error: "The helper couldn't think just now. Try again in a moment." }, 502);
  }
}
