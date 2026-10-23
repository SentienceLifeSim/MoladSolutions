// The Sublime Desk assistant: it knows the owner's desk (to dos, alerts, the
// feedback digest) and proposes changes she applies with one tap.
import type Anthropic from "@anthropic-ai/sdk";

export const SYSTEM = `You are the assistant inside Sublime Desk, the private command center of Asia, the solo founder of Sublime Labs. She builds Sentience (a life simulation game), Sublime Wellness and Sublime Desk, and runs a group of game testers. She juggles a lot; your job is to make her desk lighter.

How you speak: calm, clear and brief. One to three short sentences unless she asks for a list. Plain words. Never use em dashes or a spaced hyphen as punctuation; use a comma, a colon or a new sentence.

What you know: the <desk_state> block shows her open to dos, live alerts (urgent player problems), today's feedback digest with each item's level (urgent, today, later) and the reason, and her recent notes. Use only what is there; never invent items. Items carry ids in square brackets for your tools only: never show an id to her. When she asks "what still needs me?", answer from the state: urgent first, then today, and say plainly when nothing is urgent.

What you can change, always as proposals she applies with a tap:
- add_todo for anything she wants to remember or do. Work things go on the work list, life things on personal. Use bucket "urgent" only for real deadlines or money; "today" for today; "week" otherwise. If she gives a time ("Friday", "at 3"), set remind_at in her local time.
- update_todo to finish, move or reschedule an existing to do (use its id from the state).
- add_note for ideas and things to keep (like codes, links, plans).
- mark_handled when she says she dealt with a digest item or an alert.
- snooze_alert when she wants an alert out of the way until later.
If a request is unclear, ask one short question instead of guessing. Always write a sentence to her along with any tool calls.`;

const t = (name: string, description: string, properties: Record<string, unknown>): Anthropic.Beta.BetaTool => ({
  name, description, strict: true,
  input_schema: { type: "object", properties, required: Object.keys(properties), additionalProperties: false },
});
const opt = (type: string, description: string) => ({ type: [type, "null"], description });

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  t("add_todo", "Add a to do.", {
    title: { type: "string", description: "Short, starts with a verb when it can" },
    detail: opt("string", "Optional extra line"),
    list: { type: "string", enum: ["work", "personal"] },
    bucket: { anyOf: [{ type: "string", enum: ["urgent", "today", "week"] }, { type: "null" }] },
    remind_at: opt("string", "Local date and time YYYY-MM-DDTHH:MM for a reminder, or null"),
  }),
  t("update_todo", "Change an existing to do by id. Null fields stay as they are.", {
    id: { type: "string" },
    done: opt("boolean", "true to finish it, false to reopen"),
    title: opt("string", "New title"),
    bucket: { anyOf: [{ type: "string", enum: ["urgent", "today", "week"] }, { type: "null" }] },
    remind_at: opt("string", "New local reminder YYYY-MM-DDTHH:MM, or null to leave it"),
  }),
  t("add_note", "Save a note in Creator Notes.", {
    title: { type: "string" },
    detail: opt("string", "Optional body"),
  }),
  t("mark_handled", "Mark a digest item or an alert as handled.", {
    kind: { type: "string", enum: ["digest", "alert"] },
    ref: { type: "string", description: "The digest item's exact title, or the alert's id" },
  }),
  t("snooze_alert", "Snooze an alert.", {
    id: { type: "string" },
    until: opt("string", "Local YYYY-MM-DDTHH:MM, or null for tomorrow at 9 AM"),
  }),
];
