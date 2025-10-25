import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
  },
  // Note: lucide-react v0.4xx+ has excellent tree-shaking built-in
  // Removing modularizeImports as kebabCase helper isn't available
  // and the package handles optimization natively
};

export default nextConfig;
