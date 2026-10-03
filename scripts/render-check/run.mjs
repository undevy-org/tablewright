#!/usr/bin/env node
/**
 * Renders the built package in a real browser, against a hostile host
 * stylesheet, and asserts computed styles.
 *
 * This gate exists because of a defect that shipped with every other check
 * green: the scoped reset was written at specificity 0, a consumer's own
 * `button, input { border: none }` beat it, and every control in the kit lost
 * its border. No static check could see it — the CSS was valid, the classes were
 * present, the selectors were scoped. Only the cascade, resolved by a browser
 * against a real host stylesheet, tells you which rule won.
 *
 * Nothing here is mocked: it loads dist/es, dist/tokens.css and
 * dist/tablewright.css — the artifacts a consumer installs — and deliberately
 * does NOT load src/styles.css, so Tailwind's preflight is absent exactly as it
 * is for a consumer.
 *
 * Not wired into `pnpm build`: it needs a Chrome on the machine, and a build
 * that fails because a browser is missing would be worse than useless. Run it
 * after any change to src/css/, to the scope wiring, or to the CSS build.
 *
 *   pnpm check:render
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const dist = join(root, "dist");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));
if (!chrome) {
  console.error(
    "FAIL: no Chrome found. This check resolves the CSS cascade in a real browser and\n" +
      "cannot be approximated. Install Chrome or set CHROME_PATH.\n" +
      "Looked in:\n  " +
      CHROME_CANDIDATES.join("\n  "),
  );
  process.exit(1);
}

for (const artifact of ["es/index.js", "tokens.css", "tablewright.css"]) {
  if (!existsSync(join(dist, artifact))) {
    console.error(`FAIL: dist/${artifact} is missing — run \`pnpm build\` first.`);
    process.exit(1);
  }
}

const work = mkdtempSync(join(tmpdir(), "tablewright-render-"));

try {
  // The fixture is bundled as an IIFE with React inlined, so the page is a
  // single self-contained file that loads over file:// without a server and
  // without module-loading CORS rules getting in the way.
  console.log("▸ bundling fixture");
  execFileSync(
    join(root, "node_modules", ".bin", "vite"),
    ["build", "--config", join(here, "vite.fixture.config.mjs")],
    { cwd: root, stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, TW_RENDER_OUT: work } },
  );

  const page = `<!doctype html>
<html><head><meta charset="utf-8"><title>tablewright render check</title>
<style>${readFileSync(join(here, "host-reset.css"), "utf8")}</style>
<style>${readFileSync(join(dist, "tokens.css"), "utf8")}</style>
<style>${readFileSync(join(dist, "tablewright.css"), "utf8")}</style>
</head><body>
<div id="root"></div>
<pre id="result">PENDING</pre>
<script>${readFileSync(join(work, "fixture.js"), "utf8")}</script>
</body></html>`;
  const pagePath = join(work, "page.html");
  writeFileSync(pagePath, page);

  console.log("▸ rendering");
  const dom = execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--virtual-time-budget=6000",
      "--dump-dom",
      `file://${pagePath}`,
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
  );

  // Radix's Dialog marks sibling nodes aria-hidden while it is open, so the tag
  // carries attributes by the time the DOM is dumped — match them, or the runner
  // reports "the fixture did not run" for a fixture that ran perfectly.
  const match = dom.match(/<pre id="result"[^>]*>([\s\S]*?)<\/pre>/);
  if (!match) {
    console.error("FAIL: the page produced no #result element — the fixture did not run.");
    process.exit(1);
  }
  if (match[1].trim() === "PENDING") {
    console.error(
      "FAIL: assertions never ran. The fixture threw, or the virtual-time budget expired first.",
    );
    process.exit(1);
  }

  const { checks, missing } = JSON.parse(
    match[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
  );

  for (const check of checks) {
    console.log(`  ${check.ok ? "ok  " : "FAIL"}  ${check.name}: ${check.got}${check.ok ? "" : ` (want ${check.want})`}`);
  }

  const failed = checks.filter((check) => !check.ok);
  if (missing.length > 0) {
    console.error(`\nFAIL: ${missing.length} probe(s) never rendered: ${missing.join(", ")}`);
  }
  if (failed.length > 0) {
    console.error(`\nFAIL: ${failed.length} of ${checks.length} computed-style assertions failed.`);
  }
  if (missing.length > 0 || failed.length > 0) process.exit(1);

  if (checks.length < 20) {
    console.error(
      `\nFAIL: only ${checks.length} assertions ran — the fixture is not exercising what it claims.`,
    );
    process.exit(1);
  }
  console.log(`\n▸ ${checks.length} assertions passed`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
