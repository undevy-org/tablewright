import { cn } from "../../lib/utils";

interface DrawerSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  card?: boolean;
}

export function DrawerSection({ title, children, className, card = false }: DrawerSectionProps) {
  if (card) {
    return (
      <div
        className={cn(
          "rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4",
          className,
        )}
      >
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {title}
        </p>
        {children}
      </div>
    );
  }

  return (
    <section className={className ?? "mb-8"}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)]">
        {title}
      </h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
