import assert from "node:assert/strict";

// Run against an OpenNext preview, not `next dev`:
// node scripts/check-page-cache.mjs http://localhost:8787
const base = process.argv[2] ?? "http://localhost:8787";
const pages = [
  ["/", "Find the courses worth taking."],
  ["/bird-courses", "Bird courses"],
  ["/liberals", "Liberal studies"],
  ["/compare?mode=courses&items=ECN204", "Side-by-side comparison"],
];

for (const [path, expected] of pages) {
  for (const rsc of [false, true, false]) {
    const response = await fetch(new URL(path, base), {
      headers: rsc ? { RSC: "1" } : {},
      signal: AbortSignal.timeout(30000),
    });
    const body = await response.text();
    const label = `${path} (${rsc ? "RSC" : "HTML"})`;
    assert.equal(response.status, 200, label);
    assert.equal(response.headers.get("x-opennext-cache"), "HIT", label);
    assert.match(response.headers.get("content-type") ?? "", rsc ? /text\/x-component/ : /text\/html/, label);
    assert.ok(body.includes(expected), `${label}: missing page content`);
    assert.match(response.headers.get("vary") ?? "", /RSC/i, label);
    console.log(`PASS cached ${label}`);
  }
}

// Dynamic pages must still load live data after enabling the read-only cache.
for (const [path, expected] of [
  ["/course/ECN204", "ECN204"],
  ["/course/BMS251", "BMS251"],
  // PA8220 has no trends shard. S3 masks the missing key as 403, and the page
  // must still render its course and professor data without an error payload.
  ["/course/PA8220", "Professors teaching this course"],
  ["/professor/VGVhY2hlci0yNzc1OA==", "Eric Kam"],
]) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(60000) });
  const body = await response.text();
  assert.equal(response.status, 200, path);
  assert.ok(body.includes(expected), `${path}: missing entity content`);
  assert.ok(!body.includes('id="__next_error__"'), `${path}: error page`);
  assert.ok(!/\\?"digest\\?":/.test(body), `${path}: embedded server error`);
  console.log(`PASS dynamic ${path}`);
}

console.log("Page-cache smoke checks passed. Production CPU limits still require production monitoring.");
