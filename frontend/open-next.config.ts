import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: no persistent incremental cache override yet. The course /
// professor ISR pages render on demand in the Worker. Add an R2 or KV
// incremental cache (see OpenNext docs) once the Cloudflare account is set up to
// persist ISR output across requests.
export default defineCloudflareConfig({});
