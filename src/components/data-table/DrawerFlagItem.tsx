interface DrawerFlagGridProps {
  children: React.ReactNode;
}

export function DrawerFlagGrid({ children }: DrawerFlagGridProps) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>;
}

interface DrawerFlagItemProps {
  label: string;
  value: boolean;
}

export function DrawerFlagItem({ label, value }: DrawerFlagItemProps) {
  return (
    <div>
      <div className="mb-0.5 text-[11px] text-[var(--text-secondary)]">{label}</div>
      <div
        className={
          value
            ? "text-[13px] font-semibold text-[var(--tag-green-text)]"
            : "text-[13px] font-semibold text-[var(--text-primary)]"
        }
      >
        {value ? "Yes" : "No"}
      </div>
    </div>
  );
}
