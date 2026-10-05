import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const TOKENS_PATH = join(dirname(fileURLToPath(import.meta.url)), "tokens.css");

const TEXT_TOKENS = [
  "--text-primary",
  "--text-secondary",
  "--text-tertiary",
  "--text-utility",
  "--text-muted-strong",
] as const;

const SURFACE_TOKENS = [
  "--bg-body",
  "--bg-surface",
  "--bg-surface-muted",
  "--bg-surface-sunken",
  "--bg-hover",
  "--bg-secondary",
  "--bg-tertiary",
] as const;

const MIN_CONTRAST = 4.5;

function parseBlock(css: string, pattern: RegExp): string {
  const match = css.match(pattern);
  if (!match?.[1]) {
    throw new Error(`Could not parse CSS block: ${pattern}`);
  }
  return match[1];
}

function parseCustomProperties(block: string): Map<string, string> {
  const props = new Map<string, string>();
  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("--")) {
      continue;
    }
    const colon = trimmed.indexOf(":");
    if (colon === -1) {
      continue;
    }
    const name = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).replace(/;$/, "").trim();
    props.set(name, value);
  }
  return props;
}

function parseHexChannels(hex: string): [number, number, number] {
  const normalized = hex.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(normalized)) {
    throw new Error(`Expected #rrggbb hex, got ${hex}`);
  }
  return [
    Number.parseInt(normalized.slice(1, 3), 16) / 255,
    Number.parseInt(normalized.slice(3, 5), 16) / 255,
    Number.parseInt(normalized.slice(5, 7), 16) / 255,
  ];
}

function channelToLinear(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHexChannels(hex).map(channelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function loadThemeTokens(css: string, theme: "light" | "dark"): Map<string, string> {
  const pattern =
    theme === "light"
      ? /:root,\s*\[data-theme="light"\]\s*\{([\s\S]*?)\}\s*(?=\[data-theme="dark"\])/
      : /\[data-theme="dark"\]\s*\{([\s\S]*?)\}\s*$/;
  return parseCustomProperties(parseBlock(css, pattern));
}

function assertTokenContrast(
  theme: "light" | "dark",
  tokens: Map<string, string>,
  textToken: string,
  surfaceToken: string,
) {
  const textColor = tokens.get(textToken);
  const surfaceColor = tokens.get(surfaceToken);
  if (!textColor || !surfaceColor) {
    throw new Error(`Missing token in ${theme}: ${textToken} or ${surfaceToken}`);
  }
  const ratio = contrastRatio(textColor, surfaceColor);
  expect(
    ratio,
    `${theme}: ${textToken} (${textColor}) on ${surfaceToken} (${surfaceColor}) = ${ratio.toFixed(2)}:1 (need ≥ ${MIN_CONTRAST}:1)`,
  ).toBeGreaterThanOrEqual(MIN_CONTRAST);
}

describe("tokens.css text on surface contrast", () => {
  const css = readFileSync(TOKENS_PATH, "utf8");

  it("meets WCAG AA (4.5:1) for light theme token pairs", () => {
    const tokens = loadThemeTokens(css, "light");
    for (const textToken of TEXT_TOKENS) {
      for (const surfaceToken of SURFACE_TOKENS) {
        assertTokenContrast("light", tokens, textToken, surfaceToken);
      }
    }
  });

  it("meets WCAG AA (4.5:1) for dark theme token pairs", () => {
    const tokens = loadThemeTokens(css, "dark");
    for (const textToken of TEXT_TOKENS) {
      for (const surfaceToken of SURFACE_TOKENS) {
        assertTokenContrast("dark", tokens, textToken, surfaceToken);
      }
    }
  });
});
