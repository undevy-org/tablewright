#!/usr/bin/env node
/**
 * Runs the build steps in order, then rewrites the declaration specifiers and
 * asserts that every path package.json advertises actually exists.
 *
 * Local binaries are invoked directly, so the step does not depend on which
 * package manager launches it.
 *
 * Order matters: the JS build empties dist/, so it must run first.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = (name) => {
  const path = join(root, "node_modules", ".bin", name);
  if (!existsSync(path)) {
    console.error(`FAIL: ${name} not found in node_modules/.bin — install dependencies first.`);
    process.exit(1);
  }
  return path;
};

// Vite no longer empties dist itself — two format passes write into the same
// tree, and the second would delete the first.
rmSync(join(root, "dist"), { recursive: true, force: true });

const steps = [
  ["js:es ", bin("vite"), ["build", "--config", "vite.lib.config.ts"], { TW_FORMAT: "es" }],
  ["js:cjs", bin("vite"), ["build", "--config", "vite.lib.config.ts"], { TW_FORMAT: "cjs" }],
  ["css   ", process.execPath, [join(root, "scripts", "build-css.mjs")], {}],
  ["types ", bin("tsc"), ["-p", "tsconfig.build.json"], {}],
];

for (const [label, command, args, env] of steps) {
  console.log(`\n▸ build:${label}`);
  execFileSync(command, args, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });
}

/* ── declaration specifiers ───────────────────────────────────────────────
 * tsc emits relative specifiers exactly as the source writes them, i.e. without
 * extensions. That is fine for a consumer on moduleResolution "bundler", and
 * silently catastrophic for one on node16/nodenext: because this package is
 * `"type": "module"`, those declarations are read as ESM, where extensions are
 * mandatory. With skipLibCheck on — the near-universal default — TypeScript
 * reports nothing and types every export as `any`. Rewriting the specifiers here
 * costs one pass and removes a failure mode that produces no error message.
 */
console.log("\n▸ fix:dts");
const typesDir = join(root, "dist", "types");

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*)(["'])(\.{1,2}\/[^"']*)\2/g;
let rewritten = 0;

for (const file of walk(typesDir).filter((f) => f.endsWith(".d.ts"))) {
  const before = readFileSync(file, "utf8");
  const after = before.replace(SPECIFIER, (match, lead, quote, spec) => {
    if (/\.(js|cjs|mjs|json|css)$/.test(spec)) return match;
    const target = resolve(dirname(file), spec);
    if (existsSync(`${target}.d.ts`)) return `${lead}${quote}${spec}.js${quote}`;
    if (existsSync(join(target, "index.d.ts"))) return `${lead}${quote}${spec}/index.js${quote}`;
    // Nothing to point at — leave it alone and let the assertion below shout.
    return match;
  });
  if (after !== before) {
    writeFileSync(file, after);
    rewritten += 1;
  }
}

const dangling = [];
for (const file of walk(typesDir).filter((f) => f.endsWith(".d.ts"))) {
  for (const [, , , spec] of readFileSync(file, "utf8").matchAll(SPECIFIER)) {
    if (!spec.endsWith(".js")) {
      dangling.push(`${relative(root, file)} → ${spec}`);
      continue;
    }
    const target = resolve(dirname(file), spec.replace(/\.js$/, ".d.ts"));
    if (!existsSync(target)) dangling.push(`${relative(root, file)} → ${spec}`);
  }
}
if (dangling.length > 0) {
  console.error(
    `\nFAIL: ${dangling.length} declaration specifier(s) are extensionless or point at nothing:\n  ` +
      dangling.slice(0, 10).join("\n  "),
  );
  process.exit(1);
}
console.log(`  ${rewritten} file(s) rewritten, every specifier resolves`);

/* ── what the manifest promises must exist ────────────────────────────────
 * The types step is the one with history: the base tsconfig sets noEmit, and a
 * declaration build that inherits it exits 0 having written nothing. An empty or
 * partial dist that no error reports is exactly what ships badly, so assert the
 * artifacts rather than trusting three exit codes.
 */
console.log("\n▸ check:artifacts");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const promised = new Set(
  [
    pkg.main,
    pkg.module,
    pkg.types,
    ...Object.values(pkg.exports ?? {}).flatMap((value) =>
      typeof value === "string" ? [value] : Object.values(value),
    ),
  ].filter((path) => typeof path === "string" && path.startsWith("./dist/")),
);

const missing = [];
for (const path of promised) {
  const absolute = join(root, path);
  if (!existsSync(absolute)) missing.push(`${path} — missing`);
  else if (statSync(absolute).size < 256) missing.push(`${path} — suspiciously small`);
}
if (missing.length > 0) {
  console.error(`\nFAIL: package.json points at ${missing.length} bad path(s):\n  ` + missing.join("\n  "));
  process.exit(1);
}
console.log(`  ${promised.size} advertised path(s) present`);

console.log("\n▸ done");
