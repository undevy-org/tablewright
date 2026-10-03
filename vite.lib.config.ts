import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Library build. Deliberately NOT named `vite.config.ts`: Storybook's
 * `@storybook/react-vite` auto-loads a root `vite.config.ts` and would inherit
 * `build.lib`, which breaks `build-storybook`. It is invoked twice, once per
 * format, by scripts/build.mjs:
 *
 *   TW_FORMAT=es  vite build --config vite.lib.config.ts
 *   TW_FORMAT=cjs vite build --config vite.lib.config.ts
 *
 * The two formats need different output shapes, which is why they are separate
 * passes rather than `formats: ["es", "cjs"]`:
 *
 *   ES  — one file per source module under dist/es. A single flattened bundle
 *         defeats tree-shaking here: component modules call `forwardRef(...)`
 *         and `cva(...)` at module scope, which Rollup cannot prove side-effect
 *         free, so importing one helper dragged in most of the library.
 *         Per-module output lets an unused module simply never be imported.
 *   CJS — one flattened file. It is the compatibility path, nothing in the
 *         intended consumers tree-shakes it, and per-module CJS multiplies the
 *         file count for no benefit. Its extension must be `.cjs`, not `.cjs.js`:
 *         this package is `"type": "module"`, so Node reads any `.js` inside it
 *         as ESM and `require()` of a CommonJS file named `.cjs.js` returns an
 *         empty namespace with no error at all.
 *
 * Nothing from `dependencies` or `peerDependencies` is bundled, so a host that
 * also uses React, Radix or TanStack Table keeps a single instance of each.
 */

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const externalPackages = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

// A bare name plus any subpath of it: "zustand" also externalises
// "zustand/vanilla", "react" also externalises "react/jsx-runtime".
const external = externalPackages.map(
  (name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/.*)?$`),
);

const format = process.env.TW_FORMAT === "cjs" ? "cjs" : "es";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: format === "es" ? "dist/es" : "dist",
    // scripts/build.mjs clears dist once, before either pass; letting Vite do it
    // would make the second pass delete the first pass's output.
    emptyOutDir: false,
    target: "es2022",
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: [format],
      fileName: () => (format === "es" ? "index.js" : "tablewright.cjs"),
    },
    rollupOptions: {
      external,
      output:
        format === "es"
          ? {
              preserveModules: true,
              preserveModulesRoot: "src",
              entryFileNames: "[name].js",
              exports: "named",
            }
          : { exports: "named" },
    },
  },
});
