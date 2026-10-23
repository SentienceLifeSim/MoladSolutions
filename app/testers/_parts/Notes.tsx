// Build notes: an ALL CAPS line is a small heading, other lines are bullets; a single paragraph stays a paragraph.
export default function Notes({ body }: { body: string | null }) {
  if (!body) return null;
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return <div className="th-notes"><p>{body}</p></div>;
  const head = (l: string) => !/^[-*•]/.test(l) && l === l.toUpperCase() && /[A-Z]/.test(l);
  return (
    <ul className="th-notes">
      {lines.map((l, i) => head(l)
        ? <li key={i} className="h">{l.charAt(0) + l.slice(1).toLowerCase()}</li>
        : <li key={i}>{l.replace(/^[-*•]\s*/, "")}</li>)}
    </ul>
  );
}
