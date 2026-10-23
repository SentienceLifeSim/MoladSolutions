import { randomUUID } from "crypto";
import { signedUpload } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";

const TYPES: Record<string, { ext: string; max: number }> = {
  "image/jpeg": { ext: "jpg", max: 15 << 20 }, "image/png": { ext: "png", max: 15 << 20 }, "image/webp": { ext: "webp", max: 15 << 20 },
  "video/mp4": { ext: "mp4", max: 50 << 20 }, "video/quicktime": { ext: "mov", max: 50 << 20 }, "video/webm": { ext: "webm", max: 50 << 20 },
};

/** A one-time upload link for a screenshot or a short screen recording. */
export async function POST(req: Request) {
  const w = await who(req, true);
  if (!w) return denied();
  const { type, size } = (await req.json().catch(() => ({}))) as { type?: string; size?: number };
  const t = type ? TYPES[type] : undefined;
  if (!t) return json({ error: "Screenshots (JPEG, PNG) or screen recordings (MP4, MOV) only." }, 400);
  if (typeof size !== "number" || size <= 0 || size > t.max) {
    return json({ error: type!.startsWith("video") ? "That recording is over 50 MB. Try a shorter clip." : "That image is over 15 MB." }, 400);
  }
  try {
    const path = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${t.ext}`;
    return json(await signedUpload(path));
  } catch {
    return json({ error: "Couldn't start the upload." }, 500);
  }
}
