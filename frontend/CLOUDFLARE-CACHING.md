# Free-tier caching: first pass

The OpenNext configuration uses the existing ASSETS binding to serve build-time
pages. Cache interception avoids loading Next.js page rendering for cache hits.
No R2, KV, paid plan, or additional Cloudflare resource is required.

## Coverage and limits

- `/`, `/bird-courses`, `/liberals`, and `/compare` use built page output.
- Homepage indexes/statistics and bird-course ratings are build-time snapshots.
- Liberal studies and comparisons still fetch their public data in the browser.
- Course and professor detail pages still render on demand and fetch live shards.
  They may still exceed the free-tier CPU limit. This pass does not claim to fix
  those requests or eliminate all Worker invocations.
- Runtime revalidation is disabled because the assets cache is read-only.

## Updating data

After publishing a new data export, make a clean production build and redeploy.
Do not restore an old `.next/cache/fetch-cache` when refreshing the snapshots;
Next.js can reuse fetch results from previous builds. The OpenNext deploy command
populates the assets cache automatically. Do not deploy with raw Wrangler alone.

## Verification

1. Run `npm run cf:build`.
2. Run `npx opennextjs-cloudflare preview --port 8787` (populates the local cache).
3. Run `node scripts/check-page-cache.mjs http://localhost:8787`.
4. Check preview logs for unexpected read-only-cache writes and rendering errors.
5. After deployment, repeat the script against `https://profpulse.ca`, then compare
   CPU-limit failures per invocation in Cloudflare over comparable time windows.

The checks verify cached HTML, Next.js navigation payloads, query-string routes,
and live detail pages. Local preview does not enforce production CPU limits.

If failures persist, next investigate the course/professor rendering path and
reduce its server work. A framework migration is not part of this first pass.
