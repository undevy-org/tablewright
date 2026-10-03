import { CopyableText } from "../CopyableText";

interface MonoIdCellProps {
  value: string;
  copyTitle?: string;
  /** Show value as `start…end`. Default: true. */
  truncate?: boolean;
  /** Visible characters from the start. Default: 6. */
  truncateHead?: number;
  /** Visible characters from the end. Default: 6. */
  truncateTail?: number;
  /**
   * Minimum length at which truncation kicks in.
   * Default: head + tail + 2 (truncation must save at least one character).
   * Shorter strings render in full.
   */
  truncateThreshold?: number;
}

export function truncateMiddle(
  value: string,
  head: number,
  tail: number,
  threshold: number,
): string {
  if (value.length < threshold) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function MonoIdCell({
  value,
  copyTitle = "Copy",
  truncate = true,
  truncateHead = 6,
  truncateTail = 6,
  truncateThreshold,
}: MonoIdCellProps) {
  const threshold = truncateThreshold ?? truncateHead + truncateTail + 2;
  const display = truncate ? truncateMiddle(value, truncateHead, truncateTail, threshold) : value;

  return (
    <CopyableText
      value={value}
      title={copyTitle}
      className="w-full"
      textClassName="font-mono text-[11px]"
    >
      <span title={value}>{display}</span>
    </CopyableText>
  );
}
