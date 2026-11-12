import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Serve build-time pages from the existing ASSETS binding without rendering
// them again. This read-only cache needs no additional Cloudflare resources.
// Refresh the homepage and bird-course snapshot by rebuilding and deploying.
// Course and professor routes remain dynamic and do not write to this cache.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
