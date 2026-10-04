import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ButtonFooter } from "../ui/button-footer";

export interface FilterPopoverFooterLabels {
  apply: string;
  clear: string;
}

const DEFAULT_LABELS: FilterPopoverFooterLabels = {
  apply: "Apply",
  clear: "Clear",
};

interface FilterPopoverFooterProps {
  onApply: () => void;
  onClear?: () => void;
  labels?: Partial<FilterPopoverFooterLabels>;
  /** @deprecated Use `labels.apply` */
  applyLabel?: string;
  /** @deprecated Use `labels.clear` */
  clearLabel?: string;
  className?: string;
}

export function FilterPopoverFooter({
  onApply,
  onClear,
  labels: labelOverrides,
  applyLabel,
  clearLabel,
  className,
}: FilterPopoverFooterProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const apply = applyLabel ?? labels.apply;
  const clear = clearLabel ?? labels.clear;

  return (
    <ButtonFooter className={cn("px-3 py-2.5", className)}>
      {onClear && (
        <Button type="button" variant="secondary" size="sm" onClick={onClear}>
          {clear}
        </Button>
      )}
      <Button type="button" size="sm" onClick={onApply}>
        {apply}
      </Button>
    </ButtonFooter>
  );
}
