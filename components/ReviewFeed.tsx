import ReviewScroller, { type Review } from "./ReviewScroller";

async function getReviews(): Promise<Review[]> {
  try {
    const resp = await fetch(
      "https://itunes.apple.com/rss/customerreviews/id=6759975000/sortBy=mostRecent/json",
      { next: { revalidate: 3600 } }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    const entries: unknown[] = data?.feed?.entry ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return entries.slice(1).map((e: any) => ({
      id: e["id"]?.label ?? Math.random().toString(),
      author: e["author"]?.name?.label ?? "Anonymous",
      title: e["title"]?.label ?? "",
      body: e["content"]?.label ?? "",
      rating: parseInt(e["im:rating"]?.label ?? "5", 10),
    }));
  } catch {
    return [];
  }
}

export default async function ReviewFeed() {
  const reviews = await getReviews();
  if (reviews.length === 0) return null;
  return <ReviewScroller reviews={reviews} />;
}
