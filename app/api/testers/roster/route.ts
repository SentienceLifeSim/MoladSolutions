import { rest } from "@/lib/testers/db";
import { who, json, denied } from "@/lib/testers/session";
import { HUB_OPENED, monthStart, type RosterRow } from "@/lib/testers/model";

/** Owner only: every active tester with how many reports they sent this month and last month. Never the codes. */
export async function GET(req: Request) {
  const w = await who(req);
  if (!w) return denied();
  if (w.role !== "owner") return json({ error: "Only the team can see this." }, 403);
  try {
    const now = monthStart(), prev = monthStart(new Date(now.getTime() - 864e5));
    const [codes, bugs] = await Promise.all([
      rest<{ code: string; name: string | null; hub_name: string | null }[]>("tester_codes?select=code,name,hub_name&active=is.true"),
      rest<{ reporter_code: string; created_at: string }[]>(`tester_bugs?select=reporter_code,created_at&created_at=gte.${prev.toISOString()}`),
    ]);
    const rows: RosterRow[] = codes.map((c) => {
      const mine = bugs.filter((b) => b.reporter_code === c.code);
      return {
        name: c.hub_name?.trim() || c.name?.trim() || `Tester ${c.code.slice(-4)}`,
        month: mine.filter((b) => new Date(b.created_at) >= now).length,
        last: prev.getTime() >= HUB_OPENED ? mine.filter((b) => new Date(b.created_at) < now).length : null,
      };
    });
    rows.sort((a, b) => a.month - b.month || a.name.localeCompare(b.name));
    return json({ roster: rows });
  } catch {
    return json({ error: "Couldn't load the tester list." }, 500);
  }
}
