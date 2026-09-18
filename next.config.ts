import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingExcludes: {
    "*": [
      ".env",
      ".env.*",
      ".env.local",
      ".env.production.local",
      "**/.env",
      "**/.env.*",
    ],
  },
};

export default nextConfig;
