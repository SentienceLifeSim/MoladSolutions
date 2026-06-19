"use client";

import Link from "next/link";

export default function TopBanner() {
  return (
    <Link
      href="/services"
      className="group flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-widest transition-all duration-300"
      style={{
        background: "linear-gradient(90deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.22) 50%, rgba(99,102,241,0.18) 100%)",
        borderBottom: "1px solid rgba(139,92,246,0.25)",
        color: "#c4b5fd",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }}
      />
      For Entrepreneurs & Visionaries
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
