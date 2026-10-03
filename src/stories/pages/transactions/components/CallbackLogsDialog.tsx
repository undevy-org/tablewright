import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { ChevronRight } from "lucide-react";
import type { TransactionViewModel } from "../types";
import { callbackLogsByTxId } from "../data/transactionsSeed";

interface CallbackLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionViewModel | null;
}

export function CallbackLogsDialog({ open, onOpenChange, transaction }: CallbackLogsDialogProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  if (!transaction) return null;

  const logs = callbackLogsByTxId[transaction.txId] ?? [];

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Callback Logs — {transaction.txId}</DialogTitle>
        </DialogHeader>

        {logs.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] py-4 text-center">
            No callback logs for this transaction.
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-[12px] text-[var(--text-secondary)]">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Provider</th>
                  <th className="py-2 pr-3">Provider TX ID</th>
                  <th className="py-2 pr-3">Created At</th>
                  <th className="py-2 pr-3 w-8">Expand</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isExpanded = expandedIds.has(log.id);
                  return (
                    <tr key={log.id} className="border-b border-[var(--border-subtle)]">
                      <td colSpan={5} className="p-0">
                        <div className="flex items-center py-2">
                          <span className="pr-3 text-[var(--text-secondary)]">{log.id}</span>
                          <span className="pr-3 flex-1">{log.provider}</span>
                          <span className="pr-3 flex-1 font-mono text-xs">{log.providerTxId}</span>
                          <span className="pr-3 flex-1 text-[var(--text-secondary)]">
                            {log.createdAt}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleExpand(log.id)}
                            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
                          >
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        </div>
                        {isExpanded && (
                          <pre className="text-xs font-mono bg-[var(--bg-secondary)] p-3 rounded overflow-auto max-h-48 mb-2">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
