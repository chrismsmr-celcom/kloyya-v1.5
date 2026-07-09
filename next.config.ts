import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The dev overlay badge sits bottom-left, directly on top of the sidebar's
   * context panel. This demo is likely to be presented from `npm run dev`.
   */
  devIndicators: false,
};

export default nextConfig;
