import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    localPatterns: [
      {
        pathname: '/logo.png',
        search: '?v=*',
      },
    ],
  },
};

export default nextConfig;
