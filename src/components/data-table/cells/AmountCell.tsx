import { AlertTriangle } from "lucide-react";

import { CopyableText } from "../CopyableText";

interface AmountCellProps {
  inAmount: number;
  inCurrency: string;
  outAmount: number;
  outCurrency: string;
  inAmountConfirmed?: number;
  outAmountConfirmed?: number;
  mutedCurrency?: boolean;
}

const fmtIn = (v: number) => v.toLocaleString("en-US");
const fmtOut = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AmountCell({
  inAmount,
  inCurrency,
  outAmount,
  outCurrency,
  inAmountConfirmed,
  outAmountConfirmed,
  mutedCurrency,
}: AmountCellProps) {
  const inMismatch =
    inAmountConfirmed !== undefined && inAmountConfirmed > 0 && inAmountConfirmed !== inAmount;
  const outMismatch =
    outAmountConfirmed !== undefined && outAmountConfirmed > 0 && outAmountConfirmed !== outAmount;

  const inCurrencyEl = mutedCurrency ? (
    <span className="text-[var(--text-secondary)] font-normal">{inCurrency}</span>
  ) : (
    inCurrency
  );
  const outCurrencyEl = mutedCurrency ? (
    <span className="text-[var(--text-secondary)] font-normal">{outCurrency}</span>
  ) : (
    outCurrency
  );

  return (
    <div>
      {/* IN: confirmed first when recalculated, original below as struck-through helper */}
      {inMismatch && inAmountConfirmed !== undefined ? (
        <>
          <CopyableText
            value={String(inAmountConfirmed)}
            title="Copy in amount confirmed"
            className="w-full"
            textClassName="text-[13px] font-semibold text-[var(--text-primary)]"
          >
            <AlertTriangle
              className="inline h-3 w-3 mr-0.5 text-[var(--tag-orange-text)]"
              aria-hidden
            />
            {fmtIn(inAmountConfirmed)} {inCurrencyEl}
          </CopyableText>
          <CopyableText
            value={String(inAmount)}
            title="Copy in amount"
            className="w-full"
            textClassName="text-[12px] font-mono text-[var(--text-secondary)] line-through"
          >
            {fmtIn(inAmount)} {inCurrencyEl}
          </CopyableText>
        </>
      ) : (
        <CopyableText
          value={String(inAmount)}
          title="Copy in amount"
          className="w-full"
          textClassName="text-[13px] font-semibold text-[var(--text-primary)]"
        >
          {fmtIn(inAmount)} {inCurrencyEl}
        </CopyableText>
      )}

      {/* OUT: same hierarchy; whole pair stays mono+arrow as it is secondary to IN */}
      {outMismatch && outAmountConfirmed !== undefined ? (
        <>
          <CopyableText
            value={String(outAmountConfirmed)}
            title="Copy out amount confirmed"
            className="w-full"
            textClassName="text-[12px] font-mono text-[var(--text-primary)]"
          >
            <AlertTriangle
              className="inline h-3 w-3 mr-0.5 text-[var(--tag-orange-text)]"
              aria-hidden
            />
            &rarr; {fmtOut(outAmountConfirmed)} {outCurrencyEl}
          </CopyableText>
          <CopyableText
            value={String(outAmount)}
            title="Copy out amount"
            className="w-full"
            textClassName="text-[12px] font-mono text-[var(--text-secondary)] line-through"
          >
            &rarr; {fmtOut(outAmount)} {outCurrencyEl}
          </CopyableText>
        </>
      ) : (
        <CopyableText
          value={String(outAmount)}
          title="Copy out amount"
          className="w-full"
          textClassName="text-[12px] font-mono text-[var(--text-secondary)]"
        >
          &rarr; {fmtOut(outAmount)} {outCurrencyEl}
        </CopyableText>
      )}
    </div>
  );
}
