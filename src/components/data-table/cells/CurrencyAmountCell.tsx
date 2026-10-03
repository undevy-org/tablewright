import { CopyableText } from "../CopyableText";

interface CurrencyAmountCellProps {
  value: number;
  currency: string;
  copyTitle?: string;
  mutedCurrency?: boolean;
}

export function CurrencyAmountCell({
  value,
  currency,
  copyTitle = "Copy",
  mutedCurrency,
}: CurrencyAmountCellProps) {
  return (
    <CopyableText
      value={String(value)}
      title={copyTitle}
      className="w-full"
      textClassName="text-[13px] font-semibold text-[var(--text-primary)]"
    >
      {value.toLocaleString("en-US")}{" "}
      {mutedCurrency ? (
        <span className="text-[var(--text-secondary)] font-normal">{currency}</span>
      ) : (
        currency
      )}
    </CopyableText>
  );
}
