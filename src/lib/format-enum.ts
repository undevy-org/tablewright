export function formatEnumLabel(value: string): string {
  return value
    .replace(/^(BALANCE_|TRAFFIC_|TX_)/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\B\w+/g, (w) => w.toLowerCase());
}
