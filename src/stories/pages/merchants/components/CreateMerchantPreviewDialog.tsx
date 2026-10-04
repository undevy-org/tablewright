import { useState } from "react";

import { Button } from "../../../../components/ui/button";
import { ButtonFooter } from "../../../../components/ui/button-footer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

import type { CreateMerchantPreviewFormState, LiveCreateMerchantOptions } from "../types";

interface CreateMerchantPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: LiveCreateMerchantOptions;
  onSubmit: (value: CreateMerchantPreviewFormState) => void;
}

export function CreateMerchantPreviewDialog({
  open,
  onOpenChange,
  options,
  onSubmit,
}: CreateMerchantPreviewDialogProps) {
  const initialForm: CreateMerchantPreviewFormState = {
    name: "",
    trafficType: options.trafficTypes[0],
    balanceType: options.balanceTypes[0],
  };

  const [form, setForm] = useState<CreateMerchantPreviewFormState>(initialForm);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setForm(initialForm);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Merchant</DialogTitle>
          <DialogDescription>Create a new merchant account.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(form);
            handleOpenChange(false);
          }}
        >
          <label className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>Name (optional)</span>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Merchant display name"
            />
          </label>

          <label className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>Traffic Type</span>
            <Select
              value={form.trafficType}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  trafficType: value as CreateMerchantPreviewFormState["trafficType"],
                }))
              }
            >
              <SelectTrigger aria-label="Traffic Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.trafficTypes.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>Balance Type</span>
            <Select
              value={form.balanceType}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  balanceType: value as CreateMerchantPreviewFormState["balanceType"],
                }))
              }
            >
              <SelectTrigger aria-label="Balance Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.balanceTypes.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <ButtonFooter>
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </ButtonFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
