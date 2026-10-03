import base from "./tailwind.config.js";

/**
 * Tailwind config for the SHIPPED stylesheet.
 *
 * Two differences from the dev config:
 *  - preflight is off. Tailwind's preflight is a global reset; a library must
 *    not rewrite the host page. `src/css/reset.css` replaces it with the same
 *    normalisation scoped to `.tablewright`. Consumers without a reset of their
 *    own can opt back in via `@undevy-org/tablewright/preflight.css`.
 *  - stories and Storybook config are not scanned, so utilities that only the
 *    demo pages use never reach the consumer's stylesheet.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  ...base,
  content: ["./src/**/*.{ts,tsx}", "!./src/stories/**", "!./src/**/*.stories.tsx"],
  corePlugins: { ...(base.corePlugins ?? {}), preflight: false },
};
