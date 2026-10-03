interface DrawerFieldProps {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}

export function DrawerField({ label, value, children }: DrawerFieldProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center text-[13px]">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="min-w-0 overflow-hidden text-[var(--text-primary)]">{children ?? value}</span>
    </div>
  );
}
