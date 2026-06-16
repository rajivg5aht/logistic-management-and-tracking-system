import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to the frontend app (used by `next build`).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
