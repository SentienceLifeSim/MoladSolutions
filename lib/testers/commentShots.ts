// Server only: screenshots attached to a comment (owner 2026-10-24, "a resolved screenshot so the
// tester can see"). tester_bug_comments has no column for them, so they live in desk_settings
// (key tester_comment_shots) as { [comment id]: Shot[] }, the way the urgency grades do.
import { rest, publicShotPrefix } from "./db";
import type { Shot } from "./model";

const KEY = "tester_comment_shots";
export const MAX_COMMENT_SHOTS = 4;

export async function loadCommentShots(): Promise<Record<string, Shot[]>> {
  const rows = await rest<{ value: Record<string, Shot[]> | null }[]>(`desk_settings?select=value&key=eq.${KEY}`);
  const v = rows[0]?.value;
  return v && typeof v === "object" ? v : {};
}

/** Only files uploaded to our own screenshot bucket, up to four. */
export function cleanShots(input: unknown): Shot[] {
  if (!Array.isArray(input)) return [];
  const prefix = publicShotPrefix();
  return input
    .filter((s): s is Shot => !!s && typeof s.url === "string" && typeof s.type === "string" && s.url.startsWith(prefix) && /^(image|video)\//.test(s.type))
    .slice(0, MAX_COMMENT_SHOTS)
    .map((s) => ({ url: s.url, type: s.type }));
}

/** Re-reads before writing so shots saved by another request in the meantime are kept. */
export async function saveCommentShots(commentId: number, shots: Shot[]): Promise<void> {
  if (!shots.length) return;
  const all = await loadCommentShots();
  all[commentId] = shots;
  await rest("desk_settings?on_conflict=key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: [{ key: KEY, value: all, updated_at: new Date().toISOString() }],
  });
}
