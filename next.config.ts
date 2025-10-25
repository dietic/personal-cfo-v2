import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
    // Ensure pdfjs-dist is externalized for server-side use
    serverComponentsExternalPackages: ["pdfjs-dist"],
  },
  // Note: lucide-react v0.4xx+ has excellent tree-shaking built-in
  // Removing modularizeImports as kebabCase helper isn't available
  // and the package handles optimization natively

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure pdfjs-dist works in server environment
      config.externals = config.externals || [];
      config.externals.push("canvas");
    }
    return config;
  },
};

export default nextConfig;
