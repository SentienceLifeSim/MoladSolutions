// Server only: Claude grades how urgent each open tester report is, so the owner sees
// what to acknowledge first. Testers pick a severity themselves; this is the team's own
// read of it. Grades live in desk_settings (key tester_triage) on the Sentience project,
// keyed by report id, so no new table or column is needed. Only the owner sees them.
import Anthropic from "@anthropic-ai/sdk";
import { MODEL } from "@/lib/assist/claude";
import { rest } from "./db";
import type { Bug } from "./model";

export const URGENCIES = ["urgent", "high", "normal", "low"] as const;
export type Urgency = (typeof URGENCIES)[number];
/** v2 adds duplicates: other open tester reports (ids) and live game player bugs (Voices ids) about the same problem. */
export type Grade = { level: Urgency; why: string; at: string; v?: number; sameTesters?: number[]; samePlayers?: string[] };
const VERSION = 4;
export const URGENCY_LABEL: Record<Urgency, string> = { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" };
export const URGENCY_ORDER: Record<Urgency, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

const KEY = "tester_triage";
const OPEN = new Set(["new", "confirmed", "fixing"]);
const client = new Anthropic();

const SYSTEM = `You triage bug reports from beta testers of Sentience, a life simulation game for iPhone and Android.
Grade each report so the developer knows what to acknowledge first:
- urgent: the game crashes, freezes, will not open, loses saves or progress, takes money or tokens without delivering, blocks core play (aging up, starting a life), or many players would hit it.
- high: a whole feature, career, pack or purchase does not work, or a frequent action gives a clearly wrong result.
- normal: something is wrong but the game stays playable; a single option misbehaves; confusing or odd outcomes.
- low: looks, wording, small layout issues, balance wishes, and improvement ideas.
The tester's own severity is a hint only; judge from what they describe. Give a short plain reason (under 15 words), no dashes.
Also list duplicates: other tester reports and live game player bugs (both listed for you) about the same problem, even when worded differently or seen on a different pet, character or device (for example a dog and a cat both unable to enter pet shows). Leave a list empty only when nothing is about the same problem.`;

const TOOL: Anthropic.Tool = {
  name: "grade_reports",
  description: "Record an urgency grade for every report given.",
  input_schema: {
    type: "object",
    properties: {
      grades: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" }, level: { type: "string", enum: [...URGENCIES] }, why: { type: "string" },
            same_testers: { type: "array", items: { type: "integer" }, description: "Ids of other tester reports about the same problem." },
            same_players: { type: "array", items: { type: "string" }, description: "Ids of live game player bugs about the same problem." },
          },
          required: ["id", "level", "why"],
        },
      },
    },
    required: ["grades"],
  },
};

export async function loadGrades(): Promise<Record<string, Grade>> {
  const rows = await rest<{ value: Record<string, Grade> | null }[]>(`desk_settings?select=value&key=eq.${KEY}`);
  const v = rows[0]?.value;
  return v && typeof v === "object" ? v : {};
}

async function saveGrades(all: Record<string, Grade>): Promise<void> {
  await rest("desk_settings?on_conflict=key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: [{ key: KEY, value: all, updated_at: new Date().toISOString() }],
  });
}

const needsGrade = (b: Pick<Bug, "kind" | "status">) => b.kind !== "clear" && OPEN.has(b.status);

/** Grades every open report that has no grade yet (up to 30 per call). Never throws. */
export async function gradeMissing(bugs: Bug[], known?: Record<string, Grade>): Promise<Record<string, Grade>> {
  let all: Record<string, Grade> = known ?? {};
  try {
    if (!known) all = await loadGrades();
    const todo = bugs.filter((b) => needsGrade(b) && all[b.id]?.v !== VERSION).slice(0, 30);
    if (!todo.length) return all;
    const list = todo.map((b) =>
      [
        `#${b.id} ${b.kind === "idea" ? "(improvement idea) " : ""}${b.title}`,
        `Tester severity: ${b.severity}. Platform: ${b.platform}. Area: ${b.area ?? "not given"}. Me too: ${b.metoo}.`,
        `What happened: ${b.happened.slice(0, 700)}`,
        b.steps ? `Steps: ${b.steps.slice(0, 300)}` : "",
      ].filter(Boolean).join("\n"),
    ).join("\n\n");
    // What a report can be a duplicate of: every open tester report, and the player bug list.
    const others = bugs.filter(needsGrade).map((b) => `#${b.id} ${b.title}`).join("\n");
    const board = await rest<{ value: { bugs?: { voicesId: string | null; title: string; quotes?: { text: string }[] }[] } | null }[]>("desk_settings?select=value&key=eq.bug_board").catch(() => []);
    const playerBugs = (board[0]?.value?.bugs ?? []).filter((p) => p.voicesId);
    const playerList = playerBugs.map((p) => `${p.voicesId}: ${p.title}${p.quotes?.length ? ` (players said: ${p.quotes.map((q) => q.text.slice(0, 200).replace(/\s+/g, " ")).join(" / ")})` : ""}`).join("\n");
    const res = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        tools: [TOOL],
        // This model only allows auto tool choice; the instruction below asks for the one call.
        tool_choice: { type: "auto" },
        messages: [{ role: "user", content: `Reports to grade:\n\n${list}\n\nAll open tester reports:\n${others}\n\nLive game player bugs:\n${playerList || "none"}\n\nCall grade_reports once with a grade for every report to grade.` }],
      },
      { timeout: 25000 },
    );
    const use = res.content.find((c) => c.type === "tool_use");
    const grades = ((use?.type === "tool_use" ? (use.input as { grades?: unknown }).grades : null) ?? []) as { id: number; level: string; why: string; same_testers?: unknown; same_players?: unknown }[];
    const testerIds = new Set(bugs.filter(needsGrade).map((b) => b.id));
    const playerIds = new Set(playerBugs.map((p) => p.voicesId as string));
    const ids = new Set(todo.map((b) => b.id));
    const at = new Date().toISOString();
    let changed = false;
    // Re-read before writing so a grade saved by another request in the meantime is kept.
    const fresh = await loadGrades();
    for (const g of grades) {
      if (!ids.has(g.id) || !URGENCIES.includes(g.level as Urgency)) continue;
      const st = Array.isArray(g.same_testers) ? g.same_testers.map(Number).filter((n) => n !== g.id && testerIds.has(n)) : [];
      const sp = Array.isArray(g.same_players) ? g.same_players.map(String).filter((x) => playerIds.has(x)) : [];
      fresh[g.id] = { level: g.level as Urgency, why: String(g.why ?? "").replace(/\s[-–—]\s/g, ", ").slice(0, 140), at, v: VERSION, sameTesters: [...new Set(st)].slice(0, 10), samePlayers: [...new Set(sp)].slice(0, 10) };
      changed = true;
    }
    if (changed) await saveGrades(fresh);
    return fresh;
  } catch (e) {
    console.error("[testers triage]", String((e as Error)?.message ?? e).slice(0, 200));
    return all;
  }
}
