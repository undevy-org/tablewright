import { ReportSummaryCard } from "../../../../components/dashboard/ReportSummaryCard";

import type { LiveReportSectionSummary, LiveTabSummary } from "../types";

interface LiveSummaryShellProps {
  summary: LiveTabSummary;
}

export function LiveSummaryShell({ summary }: LiveSummaryShellProps) {
  return (
    <ReportSummaryCard
      title={summary.label}
      count={summary.count}
      endpoint={summary.endpoint}
      topActions={summary.topActions}
      filterNames={summary.filterNames}
      columns={summary.columns}
      sampleRows={summary.sampleRows}
      emptyStateMessage={summary.emptyStateMessage}
      notes={summary.notes}
    />
  );
}

interface LiveReportsShellProps {
  sections: LiveReportSectionSummary[];
}

export function LiveReportsShell({ sections }: LiveReportsShellProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <ReportSummaryCard
          key={section.key}
          title={section.title}
          endpoint={section.endpoint}
          topActions={section.topActions}
          filterNames={section.filterNames}
          columns={section.columns}
          sampleRows={section.sampleRows}
          notes={section.notes}
        />
      ))}
    </div>
  );
}
