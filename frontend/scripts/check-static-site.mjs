import assert from "node:assert/strict";

// Run against `wrangler dev` after `npm run build`, or against production:
// node scripts/check-static-site.mjs http://localhost:8787
const base = process.argv[2] ?? "http://localhost:8787";
const pages = [
  ["/", "Find the courses worth taking."],
  ["/bird-courses", "Bird courses"],
  ["/liberals", "Liberal studies"],
  ["/compare?mode=courses&items=ECN204", "Side-by-side comparison"],
  ["/course/ECN204", "Loading course data"],
  ["/course/PA8220", "Loading course data"],
  ["/professor/VGVhY2hlci0yNzc1OA==", "Loading professor data"],
];

for (const [path, expected] of pages) {
  const response = await fetch(new URL(path, base), {
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();

  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/, path);
  assert.ok(body.includes(expected), `${path}: missing page content`);
  assert.ok(!body.includes('id="__next_error__"'), `${path}: Next.js error page`);
  assert.ok(!body.includes("Error 1027"), `${path}: Worker request limit`);
  assert.ok(!body.includes("Error 1102"), `${path}: Worker CPU limit`);
  console.log(`PASS static ${path}`);
}

console.log("Static-site smoke checks passed.");
