// Shared by the API and the page: the words and choices a bug can have.
export const STATUSES = ["new", "confirmed", "fixing", "fixed", "live", "cant", "wont", "dup"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = {
  new: "New", confirmed: "Confirmed", fixing: "Being fixed", fixed: "Fixed, next build",
  live: "Fixed and live", cant: "Can't reproduce", wont: "Won't fix", dup: "Duplicate",
};
export const SEVERITIES = ["blocker", "major", "minor", "polish"] as const;
export type Severity = (typeof SEVERITIES)[number];
export const SEVERITY_LABEL: Record<Severity, string> = { blocker: "Game breaking", major: "Major", minor: "Minor", polish: "Cosmetic" };
export const SEVERITY_HINT: Record<Severity, string> = {
  blocker: "Crash, lost save, can't keep playing", major: "A feature is broken", minor: "Wrong but playable", polish: "Looks off, typo, layout",
};
export const PLATFORMS = ["ios", "android"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABEL: Record<Platform, string> = { ios: "iPhone or iPad", android: "Android" };
export const AREAS = [
  "Careers", "Relationships and family", "Money and assets", "School", "Health", "Packs and expansions",
  "Store and purchases", "Saves and sync", "Phone and friends", "Popups and life events", "Other",
];
export type Shot = { url: string; type: string };
export type Bug = {
  id: number; title: string; happened: string; steps: string | null; expected: string | null;
  platform: Platform; device: string | null; app_version: string | null; severity: Severity; area: string | null;
  status: Status; owner_note: string | null; duplicate_of: number | null; reporter_name: string | null;
  shots: Shot[]; metoo: number; comments: number; created_at: string; updated_at: string;
  mine?: boolean; iMetoo?: boolean;
};
export type Comment = { id: number; name: string | null; owner: boolean; body: string; created_at: string; mine?: boolean };
export type Post = { id: number; kind: "focus" | "build"; title: string; body: string | null; version: string | null; created_at: string };

// Owner rule (2026-10-23): at least this many new reports per calendar month (UTC), Me too doesn't count.
export const MONTHLY_MIN = 2;
export const monthStart = (d = new Date()) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
export const monthName = (d = new Date()) => d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
export const monthEnd = (d = new Date()) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
export type RosterRow = { name: string; month: number; last: number | null };
// The hub opened in October 2026; months before it are never counted against anyone.
export const HUB_OPENED = Date.UTC(2026, 9, 1);
