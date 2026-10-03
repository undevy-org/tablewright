import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Bundles the render-check fixture as a single self-contained IIFE, React
 * included, so the page loads over file:// with no server and no module-loading
 * CORS rules in the way.
 *
 * Lives in the repo rather than being generated into a temp directory: Vite
 * writes its own transient config next to the config file, and from a temp
 * directory that transient file cannot resolve `vite` or `@vitejs/plugin-react`.
 *
 * The output directory arrives as TW_RENDER_OUT so the runner can keep its
 * scratch files out of the working tree.
 */

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.TW_RENDER_OUT;

if (!outDir) {
  throw new Error("TW_RENDER_OUT is not set — run this through scripts/render-check/run.mjs.");
}

export default defineConfig({
  plugins: [react()],
  // React's CJS entry branches on process.env.NODE_ENV, and Vite does not
  // substitute it in library mode — without this the page dies on
  // "process is not defined" before a single component mounts.
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir,
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: join(here, "fixture.tsx"),
      formats: ["iife"],
      name: "TablewrightRenderCheck",
      fileName: () => "fixture.js",
    },
  },
});
