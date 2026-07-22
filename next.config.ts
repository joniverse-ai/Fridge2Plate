import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.foodsafetykorea.go.kr",
      },
      {
        protocol: "http",
        hostname: "www.foodsafetykorea.go.kr",
      },
    ],
  },
};

export default nextConfig;
