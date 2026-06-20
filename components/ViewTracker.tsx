"use client";

import { useEffect } from "react";

export default function ViewTracker() {
  useEffect(() => {
    // Count once per browser session to avoid inflating on refresh
    if (sessionStorage.getItem("mv_tracked")) return;
    sessionStorage.setItem("mv_tracked", "1");
    fetch("/api/track", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
