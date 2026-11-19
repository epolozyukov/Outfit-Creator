import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Type checking runs in `npm run typecheck`/`verify`; the Databricks build
  // installs production deps only, so test type libraries are unavailable.
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
