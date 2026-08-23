import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` exists for the Dockerfile, which copies .next/standalone.
  // Vercel builds with its own output target and does not need it, so skip it
  // there rather than producing a bundle nothing reads.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
