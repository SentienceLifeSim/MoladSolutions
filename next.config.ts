import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A package-lock.json in the home folder made Next pick ~ as the root and scan all of it.
  turbopack: { root: __dirname },
};

export default nextConfig;
