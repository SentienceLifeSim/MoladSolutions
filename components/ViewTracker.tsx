"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Never count the admin stats page
    if (pathname.startsWith("/stats")) return;

    // Skip if this exact page was already counted this session
    const pageKey = `mv_p_${pathname}`;
    if (sessionStorage.getItem(pageKey)) return;
    sessionStorage.setItem(pageKey, "1");

    // First page of this session? Increment the site-wide total too.
    const isNewSession = !sessionStorage.getItem("mv_session");
    if (isNewSession) sessionStorage.setItem("mv_session", "1");

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname, newSession: isNewSession }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
