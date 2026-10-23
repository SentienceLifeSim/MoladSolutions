// Server only: one Claude call that answers and proposes app actions as tool calls.
// The app shows the proposals and applies them only when the owner taps Apply.
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // ANTHROPIC_API_KEY from the Vercel env
export const MODEL = process.env.ASSIST_MODEL || "claude-sonnet-5-5";

export type Turn = { role: "user" | "assistant"; text: string };
export type Action = { name: string; input: Record<string, unknown> };

export async function ask(o: { system: string; tools: Anthropic.Beta.BetaTool[]; history: Turn[]; message: string; state: string }) {
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...o.history.slice(-12).map((t) => ({ role: t.role, content: t.text.slice(0, 4000) }) as Anthropic.Beta.BetaMessageParam),
    { role: "user", content: [{ type: "text", text: `<app_state>\n${o.state.slice(0, 12000)}\n</app_state>` }, { type: "text", text: o.message.slice(0, 4000) }] },
  ];
  // The API wants turns to alternate, starting with the user.
  while (messages.length > 1 && messages[0].role !== "user") messages.shift();
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [{ type: "text", text: o.system, cache_control: { type: "ephemeral" } }],
    tools: o.tools,
    tool_choice: { type: "auto" },
    messages,
  });
  if (res.stop_reason === "refusal") return { reply: "I can't help with that one, love.", actions: [] as Action[] };
  const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
  const actions: Action[] = res.content.flatMap((b) => (b.type === "tool_use" ? [{ name: b.name, input: b.input as Record<string, unknown> }] : []));
  return { reply: text || (actions.length ? "Here's what I'd change:" : ""), actions };
}
