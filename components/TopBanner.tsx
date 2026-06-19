"use client";

import Link from "next/link";

export default function TopBanner() {
  return (
    <>
      <style>{`
        @keyframes banner-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(139,92,246,0.2), 0 0 24px rgba(99,102,241,0.1); }
          50% { box-shadow: 0 0 22px rgba(139,92,246,0.45), 0 0 48px rgba(99,102,241,0.25); }
        }
        @keyframes arrow-slide {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(5px); opacity: 0.6; }
        }
        .banner-arrow { animation: arrow-slide 1.4s ease-in-out infinite; }
      `}</style>

      <Link
        href="/services"
        className="group flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
        style={{
          background: "linear-gradient(90deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.26) 50%, rgba(99,102,241,0.18) 100%)",
          borderBottom: "1px solid rgba(139,92,246,0.3)",
          color: "#c4b5fd",
          animation: "banner-pulse 2.8s ease-in-out infinite",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }}
        />
        For Entrepreneurs &amp; Visionaries
        <svg
          className="banner-arrow"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </>
  );
}
