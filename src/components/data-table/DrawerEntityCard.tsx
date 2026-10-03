import { CopyableText } from "./CopyableText";

interface DrawerEntityCardProps {
  name: string;
  /**
   * Identifier shown next to the name in the card header. Omit when the
   * identifier is already represented as one of the body fields below — the
   * header collapses to a single column so the same value isn't surfaced
   * twice in the same card.
   */
  id?: string;
  children: React.ReactNode;
}

export function DrawerEntityCard({ name, id, children }: DrawerEntityCardProps) {
  const headerLayout = id ? "grid grid-cols-2 gap-x-4 items-center" : "flex";

  return (
    <div className="rounded-lg bg-[var(--bg-hover)] p-3.5">
      <div className={`mb-2.5 border-b border-[var(--border-subtle)] pb-2 ${headerLayout}`}>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{name}</span>
        {id ? (
          <CopyableText
            value={id}
            textClassName="font-mono text-[11px] text-[var(--text-secondary)]"
          />
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-x-4">{children}</div>
    </div>
  );
}
