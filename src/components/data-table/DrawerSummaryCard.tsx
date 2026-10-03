interface DrawerSummaryCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}

export function DrawerSummaryCard({ label, value, sub }: DrawerSummaryCardProps) {
  return (
    <div className="bg-[var(--bg-hover)] rounded-lg p-3">
      <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
      <div className="text-lg font-semibold text-[var(--text-primary)]">{value}</div>
      {sub !== undefined && (
        <div className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</div>
      )}
    </div>
  );
}
