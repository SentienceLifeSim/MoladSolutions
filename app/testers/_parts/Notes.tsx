// Build notes: one change per line becomes a bullet; a plain paragraph stays a paragraph.
export default function Notes({ body }: { body: string | null }) {
  if (!body) return null;
  const lines = body.split("\n").map((l) => l.replace(/^\s*[-*•]\s*/, "").trim()).filter(Boolean);
  if (lines.length < 2) return <div className="th-notes"><p>{body}</p></div>;
  return <ul className="th-notes">{lines.map((l, i) => <li key={i}>{l}</li>)}</ul>;
}
