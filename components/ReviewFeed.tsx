"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  author: string;
  title: string;
  body: string;
  rating: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#a78bfa" : "rgba(255,255,255,0.15)"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex-shrink-0 w-72 rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(167,139,250,0.15)",
      }}
    >
      <StarRating rating={review.rating} />
      <div className="text-white font-semibold text-sm leading-snug line-clamp-2">
        {review.title}
      </div>
      <div className="text-white/45 text-xs leading-relaxed line-clamp-4">
        {review.body}
      </div>
      <div className="text-white/25 text-xs mt-auto pt-2 border-t border-white/5">
        {review.author}
      </div>
    </div>
  );
}

export default function ReviewFeed() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(
      "https://itunes.apple.com/rss/customerreviews/id=6759975000/sortBy=mostRecent/json"
    )
      .then((r) => r.json())
      .then((data) => {
        const entries = data?.feed?.entry ?? [];
        // First entry is app metadata, skip it
        const reviewEntries = entries.slice(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed: Review[] = reviewEntries.map((e: any) => ({
          id: e["id"]?.label ?? Math.random().toString(),
          author: e["author"]?.name?.label ?? "Anonymous",
          title: e["title"]?.label ?? "",
          body: e["content"]?.label ?? "",
          rating: parseInt(e["im:rating"]?.label ?? "5", 10),
        }));
        setReviews(parsed);
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless loop
  const allReviews = [...reviews, ...reviews];

  if (reviews.length === 0) return null;

  return (
    <section className="relative py-24 px-0 overflow-hidden">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #030014, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #030014, transparent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 px-6"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          What Players Are Saying
        </h2>
        <p className="text-white/40 text-lg">Real reviews from the App Store</p>
      </motion.div>

      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 px-4"
          style={{
            animation: `scroll-reviews ${reviews.length * 4}s linear infinite`,
            width: "max-content",
          }}
        >
          {allReviews.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-reviews {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
