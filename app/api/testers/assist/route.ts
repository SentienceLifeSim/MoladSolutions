import { ask, type Turn } from "@/lib/assist/claude";
import { underLimit } from "@/lib/assist/limit";
import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import { MONTHLY_MIN, STATUS_LABEL, monthStart, type Bug, type Post, type Status } from "@/lib/testers/model";
import { TEAM_SYSTEM, TEAM_TOOLS, TESTER_SYSTEM, TESTER_TOOLS } from "@/lib/assist/testers";

/** The board as the assistant sees it, read here on the server so it is always the real one. */
async function board(me: { role: string; code: string; name: string }): Promise<string> {
  const start = monthStart();
  const [bugs, posts, tests] = await Promise.all([
    rest<(Bug & { reporter_code: string })[]>("tester_bugs?select=id,kind,title,status,severity,platform,area,metoo,reporter_name,reporter_code,duplicate_of,created_at,happened&order=created_at.desc&limit=200"),
    rest<Post[]>("tester_posts?select=kind,title,version,created_at&order=created_at.desc&limit=10"),
    rest<{ code: string }[]>(`tester_bug_retests?select=code&created_at=gte.${start.toISOString()}`),
  ]);
  // Reports and retests both count toward the month.
  const monthFor = (code: string) => bugs.filter((b) => b.reporter_code === code && new Date(b.created_at) >= start).length + tests.filter((t) => t.code === code).length;
  const owner = me.role === "owner";
  const line = (b: Bug & { reporter_code: string }) =>
    `#${b.id} ${b.kind === "idea" ? "(improvement) " : b.kind === "clear" ? "(couldn't find a bug) " : ""}${b.title} [${STATUS_LABEL[b.status as Status]}, ${b.severity}, ${b.platform}${b.area ? `, ${b.area}` : ""}, ${b.metoo} me too${b.duplicate_of ? `, same as #${b.duplicate_of}` : ""}${b.reporter_code === me.code ? ", theirs" : ""}${owner ? `, by ${b.reporter_name ?? "a tester"}, ${b.created_at.slice(0, 10)}: ${b.happened.slice(0, 160).replace(/\s+/g, " ")}` : ""}]`;
  const mine = monthFor(me.code);
  const parts = [
    `Today: ${new Date().toISOString().slice(0, 10)}`,
    `Reports (${bugs.length}):\n${bugs.map(line).join("\n") || "none yet"}`,
    `Recent posts: ${posts.map((p) => `${p.kind === "build" ? "Build" : "What to test"}: ${p.title}${p.version ? ` v${p.version}` : ""}`).join("; ") || "none"}`,
  ];
  if (!owner) parts.push(`This tester (${me.name}) has ${mine} of ${MONTHLY_MIN} reports and retests this month.`);
  else {
    const codes = await rest<{ code: string; name: string | null; hub_name: string | null }[]>("tester_codes?select=code,name,hub_name&active=is.true");
    const counts = codes.map((c) => `${c.hub_name ?? c.name ?? c.code.slice(-4)} ${monthFor(c.code)}`);
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
    const out = await ask({ system: owner ? TEAM_SYSTEM : TESTER_SYSTEM, tools: owner ? TEAM_TOOLS : TESTER_TOOLS, history, message, state, stateTag: "board" });
    // The model sometimes proposes without a sentence of its own; testers always get one that fits.
    if (!owner && (!out.reply || out.reply === "Here's what I'd change:")) {
      const a = out.actions[0];
      out.reply = a?.name === "me_too" ? "This looks like it's already on the board, so a Me too is the best way to help."
        : a?.name === "draft_report" && a.input.kind === "idea" ? "Thank you for the idea! Bugs come first, and improvements will be prioritized once all bugs are squashed. I've filled it in as an improvement for you."
        : a?.name === "draft_report" ? "I filled in a report for you. Add a screenshot if you can, then send it." : out.reply;
    }
    return json(out);
  } catch (e) {
    console.error("assist testers", (e as Error).message);
    return json({ error: "The helper couldn't think just now. Try again in a moment." }, 502);
  }
}
