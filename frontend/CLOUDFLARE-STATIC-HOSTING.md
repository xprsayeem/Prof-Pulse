# Free-tier static hosting

Prof Pulse is exported as a static Next.js site and served through Cloudflare
Workers Static Assets. Static asset requests are free and unlimited. No Worker
script runs for normal page traffic.

## Data flow

- The homepage and bird-course page receive their indexes during the build.
- Compare and liberal-studies views fetch public data from S3 in the browser.
- Course and professor pages are static shells that fetch only their required S3
  shards in the browser.
- `_redirects` proxies the existing `/course/:code` and `/professor/:id` URLs to
  those shells without changing the browser URL.

## Updating the site or data

Run `npm run deploy`. This builds the static export in `out/` and deploys it with
Wrangler. Rebuild after publishing new data so homepage and bird-course snapshots
are refreshed.

## Verification

1. Run `npm run build`.
2. Run `npm run start` to serve `out/` through the local Cloudflare runtime.
3. Run `node scripts/check-static-site.mjs http://localhost:8787`.
4. Deploy and repeat the check against `https://profpulse.ca`.

The production check should return static asset responses without consuming the
Workers request or CPU quotas.
