import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { ButtonFooter } from "../../../../components/ui/button-footer";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import type { TransactionViewModel, TxStatus } from "../types";
import { TX_STATUSES } from "../types";
import { statusBadgeVariants, formatStatusLabel } from "../adapters";

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionViewModel | null;
  onSubmit: (txId: string, newStatus: TxStatus, newAmount: number) => void;
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<TxStatus>(transaction?.status ?? "TX_ACTIVE");
  const [amount, setAmount] = useState(transaction?.inAmount ?? 0);

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Transaction {transaction.txId}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(transaction.txId, status, amount);
            onOpenChange(false);
          }}
        >
          <div className="grid gap-1 text-[12px] text-[var(--text-secondary)]">
            <span>Current State</span>
            <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <span>
                {transaction.inAmount} {transaction.inCurrency}
              </span>
              <Badge variant={statusBadgeVariants[transaction.status]}>
                {formatStatusLabel(transaction.status)}
              </Badge>
            </div>
          </div>

          <label className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>Amount</span>
            <Input
              type="number"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>

          <label className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>Status</span>
            <Select value={status} onValueChange={(value) => setStatus(value as TxStatus)}>
              <SelectTrigger aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TX_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <ButtonFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </ButtonFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
