// Ready to Retest (owner 2026-10-23): a tester's "Fixed for me" or "Still happening" on a fixed bug.
// Only answers given since the current fix landed (fixed_at) count, so a reopened bug starts over.
import { rest } from "./db";
import { VERIFY_AT, type Bug, type RetestResult } from "./model";

type Row = { result: RetestResult; created_at: string };
const since = (b: Pick<Bug, "fixed_at">) => (b.fixed_at ? new Date(b.fixed_at).getTime() : 0);
export const current = (b: Pick<Bug, "fixed_at">, at: string) => new Date(at).getTime() >= since(b);

/** Recounts a report's answers and, at VERIFY_AT "Fixed for me", marks it Verified fixed. */
export async function recount(bug: Pick<Bug, "id" | "status" | "fixed_at">): Promise<{ retest_ok: number; retest_still: number; status: Bug["status"] }> {
  const rows = await rest<Row[]>(`tester_bug_retests?select=result,created_at&bug_id=eq.${bug.id}`);
  const live = rows.filter((r) => current(bug, r.created_at));
  const retest_ok = live.filter((r) => r.result === "fixed").length, retest_still = live.filter((r) => r.result === "still").length;
  const status = retest_still === 0 && retest_ok >= VERIFY_AT && bug.status === "live" ? "verified" : bug.status;
  await rest(`tester_bugs?id=eq.${bug.id}`, {
    method: "PATCH",
    body: { retest_ok, retest_still, ...(status !== bug.status ? { status, updated_at: new Date().toISOString() } : {}) },
  });
  return { retest_ok, retest_still, status };
}

/** A to do in Sublime Desk with the tester's full words. Never blocks the tester. */
export async function deskAlert(title: string, detail: string): Promise<void> {
  if (!process.env.DESK_TOKEN) return;
  try {
    await fetch("https://www.sentiencelifesim.com/api/desk", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.DESK_TOKEN}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(4000),
      body: JSON.stringify({ op: "item.create", item: { kind: "todo", list: "work", bucket: "today", title: title.slice(0, 1000), detail: detail.slice(0, 4000) } }),
    });
  } catch { /* the answer is already saved and the report reopened */ }
}
