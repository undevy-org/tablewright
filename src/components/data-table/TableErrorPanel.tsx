import type { ReactNode } from "react";

import { Button } from "../ui/button";

export interface TableErrorPanelProps {
  message: ReactNode;
  colSpan: number;
  onRetry?: () => void;
  /** @default "Retry" */
  retryLabel?: string;
}

export function TableErrorPanel({
  message,
  colSpan,
  onRetry,
  retryLabel = "Retry",
}: TableErrorPanelProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-16 text-center text-[13px] text-[var(--text-secondary)]"
      >
        <div role="alert" className="text-[var(--text-secondary)]">
          {message}
        </div>
        {onRetry ? (
          <div className="mt-4">
            <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </td>
    </tr>
  );
}
