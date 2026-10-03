import { Badge } from "../ui/badge";

export interface ReportSummaryCardProps {
  title: string;
  count?: number;
  endpoint: string;
  topActions: string[];
  filterNames: string[];
  columns: string[];
  sampleRows: { title: string; values: string[] }[];
  emptyStateMessage?: string;
  notes?: string[];
}

export function ReportSummaryCard({
  title,
  count,
  endpoint,
  topActions,
  filterNames,
  columns,
  sampleRows,
  emptyStateMessage,
  notes,
}: ReportSummaryCardProps) {
  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
          {typeof count === "number" ? <Badge variant="neutral">{count}</Badge> : null}
        </div>
        <code className="rounded-md bg-[var(--bg-secondary)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-secondary)]">
          {endpoint}
        </code>
      </div>

      <div className="grid gap-4 px-6 py-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Top Actions
            </div>
            <div className="flex flex-wrap gap-2">
              {topActions.length > 0 ? (
                topActions.map((action) => (
                  <Badge key={action} variant="neutral" className="rounded-full px-3 py-1">
                    {action}
                  </Badge>
                ))
              ) : (
                <span className="text-[12px] text-[var(--text-tertiary)]">No visible top actions</span>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Filters
            </div>
            <div className="flex flex-wrap gap-2">
              {filterNames.length > 0 ? (
                filterNames.map((filterName) => (
                  <Badge key={filterName} variant="info" className="rounded-full px-3 py-1">
                    {filterName}
                  </Badge>
                ))
              ) : (
                <span className="text-[12px] text-[var(--text-tertiary)]">No visible filters</span>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Columns
            </div>
            <div className="flex flex-wrap gap-2">
              {columns.map((column) => (
                <Badge key={column} variant="warning" className="rounded-full px-3 py-1">
                  {column}
                </Badge>
              ))}
            </div>
          </div>

          {notes && notes.length > 0 ? (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                Notes
              </div>
              <div className="space-y-2 text-[12px] text-[var(--text-secondary)]">
                {notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-hover)] p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            Sample Rows
          </div>

          {sampleRows.length > 0 ? (
            <div className="space-y-3">
              {sampleRows.map((row) => (
                <div
                  key={`${title}-${row.title}`}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3"
                >
                  <div className="mb-2 text-[13px] font-medium text-[var(--text-primary)]">
                    {row.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.values.map((value) => (
                      <span
                        key={`${row.title}-${value}`}
                        className="rounded-md bg-[var(--bg-secondary)] px-2 py-1 text-[11px] text-[var(--text-secondary)]"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-8 text-center text-[12px] text-[var(--text-secondary)]">
              {emptyStateMessage ?? "No sample rows captured."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
