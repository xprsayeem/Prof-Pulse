import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a static site. Course and professor data loads from public S3
  // shards in the browser, so normal traffic never needs a Worker invocation.
  output: "export",
};

export default nextConfig;
