import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  // The dev badge would show up in parity screenshots.
  devIndicators: false,
  // One agent guide only: the repo-root AGENTS.md (it points to node_modules/next/dist/docs).
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
