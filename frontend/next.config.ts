import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to the frontend app (used by `next build`).
  turbopack: {
    root: path.join(__dirname),
  },

  // Proxy API and upload requests to the backend
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:4000/api/v1/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:4000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;