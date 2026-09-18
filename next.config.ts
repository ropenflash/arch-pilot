import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  outputFileTracingExcludes: {
    "*": [".env", ".env.*", ".env.local", ".env.production.local"],
  },
};

export default nextConfig;
