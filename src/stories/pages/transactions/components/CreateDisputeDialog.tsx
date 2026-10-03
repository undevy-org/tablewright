import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { ButtonFooter } from "../../../../components/ui/button-footer";
import { Button } from "../../../../components/ui/button";
import type { TransactionViewModel } from "../types";
import { DISPUTE_REASONS } from "../types";
import { formatEnumLabel } from "../../../../lib/format-enum";

interface CreateDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionViewModel | null;
  onSubmit: (txId: string, reason: string, userId: string, amount: number) => void;
}

export function CreateDisputeDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
}: CreateDisputeDialogProps) {
  const [reason, setReason] = useState<string>(DISPUTE_REASONS[0]);
  const [userId, setUserId] = useState(transaction?.merchantId ?? "");
  const [amount, setAmount] = useState(transaction?.inAmount ?? 0);

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Dispute</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(transaction.txId, reason, userId, amount);
            onOpenChange(false);
          }}
        >
          <fieldset className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>Reason</span>
            <div className="grid gap-2">
              {DISPUTE_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors has-[:checked]:border-[var(--border-brand)] has-[:checked]:bg-[var(--bg-secondary)]"
                >
                  <input
                    type="radio"
                    name="dispute-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-[var(--text-accent)]"
                  />
                  {formatEnumLabel(r)}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>User ID</span>
            <Input value={userId} onChange={(event) => setUserId(event.target.value)} />
          </label>

          <label className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>Amount</span>
            <Input
              type="number"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>

          <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-6 text-center text-sm text-[var(--text-secondary)]">
            Drop files or click to upload (mock)
          </div>

          <ButtonFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </ButtonFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
