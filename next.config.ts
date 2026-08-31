import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pins the workspace root to this project. Without it, Next.js's root inference
    // can walk up into a parent directory that has other unrelated lockfiles/projects.
    root: path.join(__dirname),
  },
};

export default nextConfig;
