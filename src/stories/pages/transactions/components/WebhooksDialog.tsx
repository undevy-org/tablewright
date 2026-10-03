import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Badge } from "../../../../components/ui/badge";
import type { TransactionViewModel } from "../types";
import { webhooksByTxId } from "../data/transactionsSeed";

interface WebhooksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionViewModel | null;
}

export function WebhooksDialog({ open, onOpenChange, transaction }: WebhooksDialogProps) {
  if (!transaction) return null;

  const webhooks = webhooksByTxId[transaction.txId] ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Webhooks — {transaction.txId}</DialogTitle>
        </DialogHeader>

        {webhooks.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] py-4 text-center">
            No webhooks for this transaction.
          </p>
        ) : (
          <div className="space-y-3">
            {webhooks.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm"
              >
                <Badge variant={entry.status === "delivered" ? "success" : "danger"}>
                  {entry.status}
                </Badge>
                <span className="flex-1 truncate font-mono text-xs">{entry.url}</span>
                <span className="text-[var(--text-secondary)]">{entry.responseCode}</span>
                <span className="text-[var(--text-secondary)] text-xs whitespace-nowrap">
                  {entry.createdAt}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
