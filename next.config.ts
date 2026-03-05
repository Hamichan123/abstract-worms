import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/logo.png", permanent: false },
    ];
  },
};

export default nextConfig;
