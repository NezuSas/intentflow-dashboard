import type { NextConfig } from "next";

// The public demo (NEXT_PUBLIC_DEMO=1) is a static export served from GitHub Pages under /intentflow-dashboard;
// a regular build keeps the default server output for Vercel.
const demo = process.env.NEXT_PUBLIC_DEMO === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (demo ? "/intentflow-dashboard" : "");

const nextConfig: NextConfig = demo
  ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
