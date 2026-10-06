import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import manifestJson from '../design-tokens/manifest.json';
import { displayTokenValue, type DesignTokensTheme } from './design-tokens-display';

type TokenModeValue = string | number;

type Token = {
  name: string;
  cssVar: string;
  kind: string;
  group: string;
  value: TokenModeValue;
  modes?: { dark?: TokenModeValue };
  label: string;
  unit?: string;
  pair?: string;
  role?: string;
};

type TypographyStyle = {
  name: string;
  label: string;
  fontToken: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacingEm?: number;
  textTransform?: CSSProperties['textTransform'];
  sample: string;
};

type NumericToken = { name: string; value: number; unit?: string };

type Manifest = {
  collections: readonly { id: string; name: string; tokens: readonly Token[] }[];
  typography: readonly TypographyStyle[];
  effectStyles: readonly { name: string; token: string }[];
  paintStyles: readonly { name: string; token: string }[];
};

const manifest = manifestJson as Manifest;

const collections = Object.fromEntries(
  manifest.collections.map((collection) => [collection.id, collection]),
) as Record<string, { id: string; name: string; tokens: readonly Token[] }>;

const allTokens = manifest.collections.flatMap((collection) => collection.tokens);
const tokenByName = new Map<string, Token>(allTokens.map((token) => [token.name, token]));

const colorTokens = collections.colors.tokens.filter((token) => token.kind === 'color');
const surfaceTokens = colorTokens.filter(
  (token) =>
    token.group === 'surface' && !token.name.includes('glass') && token.name !== 'overlay-scrim',
);
const overlayTokens = colorTokens.filter(
  (token) => token.name.includes('glass') || token.name === 'overlay-scrim',
);
const accentTokens = colorTokens.filter((token) => token.group === 'accent');
const textTokens = colorTokens.filter((token) => token.group === 'text');
const borderTokens = colorTokens.filter((token) => token.group === 'border');

const statusPairs = Array.from(
  new Set(
    colorTokens
      .filter((token) => token.group === 'status' && token.pair)
      .map((token) => token.pair as string),
  ),
)
  .map((pair) => {
    const background = colorTokens.find(
      (token) => token.group === 'status' && token.pair === pair && token.role === 'background',
    );
    const foreground = colorTokens.find(
      (token) => token.group === 'status' && token.pair === pair && token.role === 'foreground',
    );

    return background && foreground ? { name: pair, background, foreground } : null;
  })
  .filter((pair): pair is { name: string; background: Token; foreground: Token } => pair !== null);

const radiusTokens = collections.radii.tokens;
const spacingTokens = collections.spacing.tokens as readonly NumericToken[];
const sizeTokens = collections.sizes.tokens as readonly NumericToken[];

const typographySamples = manifest.typography.map((style) => {
  const fontToken = collections.fonts.tokens.find((token) => token.name === style.fontToken);

  return {
    ...style,
    style: {
      fontFamily: fontToken ? cssVar(fontToken.cssVar) : undefined,
      fontSize: `${style.fontSize}px`,
      lineHeight: `${style.lineHeight}px`,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacingEm !== undefined ? `${style.letterSpacingEm}em` : undefined,
      textTransform: style.textTransform,
    } satisfies CSSProperties,
  };
});

function cssVar(cssVarName: string) {
  return `var(${cssVarName})`;
}

const DesignTokensThemeContext = createContext<DesignTokensTheme>('light');

function storybookThemeFromGlobals(globals: Record<string, unknown> | undefined): DesignTokensTheme {
  return globals?.theme === 'dark' ? 'dark' : 'light';
}

function useDesignTokensTheme() {
  return useContext(DesignTokensThemeContext);
}

function TokenSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function TokenRow({ name, value, preview }: { name: string; value: string; preview: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
      {preview}
      <div>
        <p className="text-[12px] font-semibold text-[var(--text-primary)]">{name}</p>
        <p className="text-[11px] text-[var(--text-secondary)]">{value}</p>
      </div>
    </div>
  );
}

function TokenPreviewCard({
  name,
  value,
  preview,
}: {
  name: string;
  value: string;
  preview: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
      <p className="text-[11px] text-[var(--text-secondary)]">{name}</p>
      {preview}
      <p className="mt-2 text-[11px] text-[var(--text-secondary)]">{value}</p>
    </div>
  );
}

function TokenNumberList({ title, tokens }: { title: string; tokens: readonly NumericToken[] }) {
  const theme = useDesignTokensTheme();

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <p className="mb-3 text-[12px] font-semibold text-[var(--text-primary)]">{title}</p>
      <div className="space-y-2">
        {tokens.map((token) => (
          <div key={token.name} className="flex items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--text-secondary)]">{token.name}</p>
            <p className="text-[12px] font-semibold text-[var(--text-primary)]">
              {displayTokenValue(token, theme)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaletteSection() {
  const theme = useDesignTokensTheme();

  return (
    <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5 [box-shadow:var(--shadow-card)]">
      <TokenSectionHeader
        title="Surface, text, and border palette"
        description="Semantic roles used by the component styles and the design token collections."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-3">
          {surfaceTokens.map((token) => (
            <TokenRow
              key={token.name}
              name={token.name}
              value={displayTokenValue(token, theme)}
              preview={
                <span
                  className="h-10 w-10 shrink-0 rounded-lg border border-[var(--border-subtle)]"
                  style={{ background: cssVar(token.cssVar) }}
                />
              }
            />
          ))}
        </div>

        <div className="space-y-3">
          {textTokens.map((token) => (
            <TokenPreviewCard
              key={token.name}
              name={token.name}
              value={displayTokenValue(token, theme)}
              preview={
                <p className="mt-1 text-[14px] font-medium" style={{ color: cssVar(token.cssVar) }}>
                  Fast operational status overview
                </p>
              }
            />
          ))}
        </div>

        <div className="space-y-3">
          {borderTokens.map((token) => (
            <TokenPreviewCard
              key={token.name}
              name={token.name}
              value={displayTokenValue(token, theme)}
              preview={
                <div
                  className="mt-2 h-10 rounded-lg border bg-[var(--bg-surface-sunken)]"
                  style={{ borderColor: cssVar(token.cssVar) }}
                />
              }
            />
          ))}

          {accentTokens.map((token) => (
            <TokenPreviewCard
              key={token.name}
              name={token.name}
              value={displayTokenValue(token, theme)}
              preview={
                token.name === 'accent-primary' ? (
                  <div
                    className="mt-2 flex h-10 items-center justify-center rounded-lg border border-[var(--border-subtle)]"
                    style={{ backgroundColor: cssVar(token.cssVar), color: cssVar('--text-on-accent') }}
                  >
                    Primary action
                  </div>
                ) : (
                  <div
                    className="mt-2 flex h-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--accent-primary)]"
                    style={{ color: cssVar(token.cssVar) }}
                  >
                    On-accent text
                  </div>
                )
              }
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function StatusAndOverlaySection() {
  const theme = useDesignTokensTheme();

  return (
    <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5 [box-shadow:var(--shadow-card)]">
      <TokenSectionHeader
        title="Status palette and overlays"
        description="Foreground and background pairs for badges, critical actions, glass surfaces, and overlay states."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {statusPairs.map((pair) => (
          <div
            key={pair.name}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold capitalize text-[var(--text-primary)]">
                {pair.name}
              </span>
              <span
                className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: cssVar(pair.background.cssVar),
                  color: cssVar(pair.foreground.cssVar),
                }}
              >
                {pair.name}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div
                className="h-8 rounded-lg border border-[var(--border-subtle)]"
                style={{ backgroundColor: cssVar(pair.background.cssVar) }}
              />
              <div
                className="flex h-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[12px] font-semibold"
                style={{ color: cssVar(pair.foreground.cssVar) }}
              >
                Aa
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {overlayTokens.map((token) => (
          <TokenPreviewCard
            key={token.name}
            name={token.name}
            value={displayTokenValue(token, theme)}
            preview={
              <div
                className="mt-2 h-12 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                style={{ background: cssVar(token.cssVar) }}
              />
            }
          />
        ))}
      </div>
    </article>
  );
}

function TypographyAndScalesSection() {
  const theme = useDesignTokensTheme();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5 [box-shadow:var(--shadow-card)]">
        <TokenSectionHeader
          title="Typography"
          description="Text styles map cleanly onto CSS custom properties for font family, size, and weight."
        />

        <div className="space-y-3">
          {typographySamples.map((sample) => (
            <div
              key={sample.name}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
            >
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-primary)]">{sample.label}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {sample.fontSize}px / {sample.lineHeight}px / {sample.fontWeight}
                </p>
              </div>
              <p className="mt-3 text-[13px] text-[var(--text-primary)]" style={sample.style}>
                {sample.sample}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5 [box-shadow:var(--shadow-card)]">
        <TokenSectionHeader
          title="Radii and layout scales"
          description="Corner radii plus the numeric spacing and size tokens that drive component layout."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {radiusTokens.map((token) => (
            <div
              key={token.name}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
            >
              <div
                className="h-16 w-full border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                style={{ borderRadius: cssVar(token.cssVar) }}
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-[12px] font-semibold text-[var(--text-primary)]">{token.name}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {displayTokenValue(token, theme)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TokenNumberList title="Spacing" tokens={spacingTokens} />
          <TokenNumberList title="Sizes" tokens={sizeTokens} />
        </div>
      </article>
    </div>
  );
}

function EffectsAndPaintSection() {
  const theme = useDesignTokensTheme();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5 [box-shadow:var(--shadow-card)]">
        <TokenSectionHeader
          title="Effects"
          description="Shadow tokens used as named effect styles instead of raw variables."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {manifest.effectStyles.map((style) => {
            const token = tokenByName.get(style.token);
            if (!token) return null;

            return (
              <TokenPreviewCard
                key={style.name}
                name={style.name}
                value={displayTokenValue(token, theme)}
                preview={
                  <div
                    className="mt-2 h-16 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    style={{ boxShadow: cssVar(token.cssVar) }}
                  />
                }
              />
            );
          })}
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5 [box-shadow:var(--shadow-card)]">
        <TokenSectionHeader
          title="Paint styles"
          description="Gradients stay as named paint styles for reference frames and hero surfaces."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {manifest.paintStyles.map((style) => {
            const token = tokenByName.get(style.token);
            if (!token) return null;

            return (
              <TokenPreviewCard
                key={style.name}
                name={style.name}
                value={displayTokenValue(token, theme)}
                preview={
                  <div
                    className="mt-2 h-16 rounded-xl border border-[var(--border-subtle)]"
                    style={{ background: cssVar(token.cssVar) }}
                  />
                }
              />
            );
          })}
        </div>
      </article>
    </div>
  );
}

function DesignTokensPage() {
  return (
    <div className="space-y-6">
      <PaletteSection />
      <StatusAndOverlaySection />
      <TypographyAndScalesSection />
      <EffectsAndPaintSection />
    </div>
  );
}

const meta: Meta<typeof DesignTokensPage> = {
  title: 'Design Tokens',
  component: DesignTokensPage,
  tags: ['!autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, { globals }) => (
      <DesignTokensThemeContext.Provider value={storybookThemeFromGlobals(globals)}>
        <Story />
      </DesignTokensThemeContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DesignTokensPage>;

export const Tokens: Story = {};
