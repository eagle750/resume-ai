import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow Chrome extension to call API endpoints
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // Restrict to your extension ID in production:
            // value: "chrome-extension://YOUR_EXTENSION_ID"
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
