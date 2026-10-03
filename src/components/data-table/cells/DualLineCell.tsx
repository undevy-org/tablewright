import { CopyableText } from "../CopyableText";
import { truncateMiddle } from "./MonoIdCell";

interface DualLineCellProps {
  primary: string;
  secondary: string;
  primaryCopyTitle?: string;
  secondaryCopyTitle?: string;
  primaryVariant?: "default" | "mono";
  primaryLabel?: string;
  secondaryLabel?: string;
  /**
   * Controls visual weight of the secondary line.
   *
   * Rule of thumb:
   * - `true` — when both lines represent **independent, equally-important
   *   entities or operational values** (e.g. Merchant + Merchant TX ID,
   *   Merchant Fee % + Provider Fee %, Requisite + Holder). Secondary line
   *   uses `--text-primary` so neither side is downplayed.
   * - `false` (default) — when the secondary line is genuinely **helper /
   *   metadata / previous-value** (e.g. base rate type, "confirmed" amount).
   *   Secondary line uses `--text-secondary`.
   *
   * Do not pick this flag based on visual position alone — pick it based on
   * the semantic role of the secondary value.
   */
  equalWeight?: boolean;
  /**
   * Render the primary line as `start…end` when its length warrants it.
   * Only applies to `primaryVariant="mono"`. Pass `true` for default head=6,
   * tail=6 or supply explicit head/tail counts.
   */
  primaryTruncateMiddle?: boolean | { head?: number; tail?: number };
  /**
   * Render the secondary line as `start…end` when long. The secondary line is
   * always mono, so this works regardless of the primary variant.
   */
  secondaryTruncateMiddle?: boolean | { head?: number; tail?: number };
}

function applyMiddleTruncate(
  value: string,
  config: boolean | { head?: number; tail?: number } | undefined,
): string {
  if (!config) return value;
  const head = typeof config === "object" ? (config.head ?? 6) : 6;
  const tail = typeof config === "object" ? (config.tail ?? 6) : 6;
  return truncateMiddle(value, head, tail, head + tail + 2);
}

export function DualLineCell({
  primary,
  secondary,
  primaryCopyTitle = "Copy",
  secondaryCopyTitle = "Copy",
  primaryVariant = "default",
  primaryLabel,
  secondaryLabel,
  equalWeight = false,
  primaryTruncateMiddle,
  secondaryTruncateMiddle,
}: DualLineCellProps) {
  const primaryTextClass =
    primaryVariant === "mono"
      ? "font-mono text-[11px]"
      : "font-semibold text-[var(--text-primary)]";

  const secondaryColour = equalWeight
    ? "text-[var(--text-primary)]"
    : "text-[var(--text-secondary)]";

  const primaryDisplay =
    primaryVariant === "mono" ? applyMiddleTruncate(primary, primaryTruncateMiddle) : primary;
  const secondaryDisplay = applyMiddleTruncate(secondary, secondaryTruncateMiddle);

  const primaryContent = primaryLabel ? (
    <>
      <span className="mr-1 text-[10px] text-[var(--text-secondary)]">{primaryLabel}</span>
      <span title={primary}>{primaryDisplay}</span>
    </>
  ) : (
    <span title={primary}>{primaryDisplay}</span>
  );

  const secondaryContent = secondaryLabel ? (
    <>
      <span className="mr-1 text-[10px] text-[var(--text-secondary)]">{secondaryLabel}</span>
      <span title={secondary}>{secondaryDisplay}</span>
    </>
  ) : (
    <span title={secondary}>{secondaryDisplay}</span>
  );

  return (
    <div className="min-w-0 space-y-1">
      <CopyableText
        value={primary}
        title={primaryCopyTitle}
        className="w-full"
        textClassName={primaryTextClass}
      >
        {primaryContent}
      </CopyableText>
      <CopyableText
        value={secondary}
        title={secondaryCopyTitle}
        className="w-full"
        textClassName={`font-mono text-[11px] ${secondaryColour}`}
      >
        {secondaryContent}
      </CopyableText>
    </div>
  );
}
