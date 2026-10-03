import { AlertTriangle, Check, CircleDashed } from "lucide-react";

import { CopyableText } from "../CopyableText";

interface ConfirmedAmountCellProps {
  value: number;
  currency: string;
  confirmedValue?: number | null;
  copyTitle?: string;
  confirmedCopyTitle?: string;
  mutedCurrency?: boolean;
}

const fmt = (v: number) => v.toLocaleString("en-US");

export function ConfirmedAmountCell({
  value,
  currency,
  confirmedValue,
  copyTitle = "Copy",
  confirmedCopyTitle = "Copy confirmed",
  mutedCurrency,
}: ConfirmedAmountCellProps) {
  const primaryCurrency = mutedCurrency ? (
    <span className="text-[var(--text-secondary)] font-normal">{currency}</span>
  ) : (
    currency
  );
  const secondaryCurrency = mutedCurrency ? (
    <span className="text-[var(--text-secondary)] font-normal">{currency}</span>
  ) : (
    currency
  );

  // Case 1 — no confirmation provided: just the value.
  if (confirmedValue === undefined || confirmedValue === null) {
    return (
      <CopyableText
        value={String(value)}
        title={copyTitle}
        className="w-full"
        textClassName="text-[13px] font-semibold text-[var(--text-primary)]"
      >
        {fmt(value)} {primaryCurrency}
      </CopyableText>
    );
  }

  // Case 2 — value exists but was not confirmed (confirmed=0, value>0).
  if (confirmedValue === 0 && value > 0) {
    return (
      <div>
        <CopyableText
          value={String(value)}
          title={copyTitle}
          className="w-full"
          textClassName="text-[13px] font-semibold text-[var(--text-primary)]"
        >
          {fmt(value)} {primaryCurrency}
        </CopyableText>
        <div
          className="text-[11px] text-[var(--text-secondary)]"
          title="Not confirmed"
          aria-label="Not confirmed"
        >
          <CircleDashed className="inline h-3 w-3" aria-hidden />
        </div>
      </div>
    );
  }

  // Case 3 — match (covers zero-fee 0/0): single line, subtle Check.
  if (confirmedValue === value) {
    return (
      <CopyableText
        value={String(value)}
        title={copyTitle}
        className="w-full"
        textClassName="text-[13px] font-semibold text-[var(--text-primary)]"
      >
        <Check className="inline h-3 w-3 mr-0.5 text-[var(--text-tertiary)]" aria-hidden />
        {fmt(value)} {primaryCurrency}
      </CopyableText>
    );
  }

  // Case 4 — recalculated: confirmed (final) on top as primary,
  // original (previous) below as secondary, struck through.
  return (
    <div>
      <CopyableText
        value={String(confirmedValue)}
        title={confirmedCopyTitle}
        className="w-full"
        textClassName="text-[13px] font-semibold text-[var(--text-primary)]"
      >
        <AlertTriangle
          className="inline h-3 w-3 mr-0.5 text-[var(--tag-orange-text)]"
          aria-hidden
        />
        {fmt(confirmedValue)} {primaryCurrency}
      </CopyableText>
      <CopyableText
        value={String(value)}
        title={copyTitle}
        className="w-full"
        textClassName="text-[12px] font-mono text-[var(--text-secondary)] line-through"
      >
        {fmt(value)} {secondaryCurrency}
      </CopyableText>
    </div>
  );
}
