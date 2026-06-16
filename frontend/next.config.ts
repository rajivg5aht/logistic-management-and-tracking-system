import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to the frontend app (used by `next build`).
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
