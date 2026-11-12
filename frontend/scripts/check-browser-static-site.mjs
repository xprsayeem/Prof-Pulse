import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:8787";
const debugPort = 9333;
const edgeCandidates = [
  process.env.EDGE_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

async function findEdge() {
  for (const candidate of edgeCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next standard installation path.
    }
  }
  throw new Error("Microsoft Edge was not found. Set EDGE_PATH to its executable.");
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return response.json();
    } catch {
      // Edge may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Edge remote debugging did not start.");
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let messageId = 0;
  const pending = new Map();

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;

    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);

    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });

  return {
    async send(method, params = {}) {
      await opened;
      const id = ++messageId;
      const result = new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
      socket.send(JSON.stringify({ id, method, params }));
      return result;
    },
    close() {
      socket.close();
    },
  };
}

async function getPageTarget() {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
  const targets = await response.json();
  const target = targets.find((item) => item.type === "page");
  assert.ok(target?.webSocketDebuggerUrl, "No debuggable Edge page was found");
  return target;
}

const tests = [
  {
    path: "/course/ECN204",
    expected: ["ECN204", "Professors teaching this course"],
    titleIncludes: "ECN204",
  },
  {
    path: "/course/PA8220",
    expected: ["PA8220", "Professors teaching this course"],
    titleIncludes: "PA8220",
  },
  {
    path: "/professor/VGVhY2hlci0yNzc1OA==",
    expected: ["Eric Kam", "Courses taught"],
    titleIncludes: "Eric Kam",
  },
];

const edgePath = await findEdge();
const profileDirectory = await mkdtemp(path.join(tmpdir(), "prof-pulse-edge-"));
const edge = spawn(
  edgePath,
  [
    "--headless",
    "--disable-gpu",
    "--disable-extensions",
    "--disable-sync",
    "--no-first-run",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDirectory}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

let cdp;

try {
  await waitForDebugger();
  const target = await getPageTarget();
  cdp = createCdpClient(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  for (const test of tests) {
    const url = new URL(test.path, base).href;
    await cdp.send("Page.navigate", { url });

    let pageState;
    for (let attempt = 0; attempt < 100; attempt++) {
      const evaluation = await cdp.send("Runtime.evaluate", {
        expression: `({
          text: document.body?.innerText ?? "",
          title: document.title,
          url: location.href,
          readyState: document.readyState
        })`,
        returnByValue: true,
      });
      pageState = evaluation.result.value;

      if (
        pageState.readyState === "complete" &&
        test.expected.every((text) => pageState.text.includes(text)) &&
        pageState.title.includes(test.titleIncludes)
      ) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    assert.equal(pageState.url, url, `${test.path}: URL changed unexpectedly`);
    for (const expected of test.expected) {
      assert.ok(pageState.text.includes(expected), `${test.path}: missing ${expected}`);
    }
    assert.ok(
      pageState.title.includes(test.titleIncludes),
      `${test.path}: title was not updated`
    );
    assert.ok(!pageState.text.includes("data is unavailable"), `${test.path}: data error`);
    assert.ok(!pageState.text.includes("Loading course data"), `${test.path}: still loading`);
    assert.ok(!pageState.text.includes("Loading professor data"), `${test.path}: still loading`);
    console.log(`PASS browser ${test.path} (${pageState.title})`);
  }
} finally {
  try {
    await cdp?.send("Browser.close");
  } catch {
    // The browser may already be closing.
  }
  cdp?.close();

  if (edge.exitCode === null) {
    const exited = once(edge, "exit");
    edge.kill();
    await Promise.race([
      exited,
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await rm(profileDirectory, { recursive: true, force: true });
      break;
    } catch (error) {
      if (error?.code !== "EBUSY" || attempt === 19) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

console.log("Browser static-site checks passed.");
