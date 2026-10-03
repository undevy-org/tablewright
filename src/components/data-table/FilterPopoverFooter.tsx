import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ButtonFooter } from "../ui/button-footer";

interface FilterPopoverFooterProps {
  onApply: () => void;
  onClear?: () => void;
  applyLabel?: string;
  clearLabel?: string;
  className?: string;
}

export function FilterPopoverFooter({
  onApply,
  onClear,
  applyLabel = "Apply",
  clearLabel = "Clear",
  className,
}: FilterPopoverFooterProps) {
  return (
    <ButtonFooter className={cn("px-3 py-2.5", className)}>
      {onClear && (
        <Button type="button" variant="secondary" size="sm" onClick={onClear}>
          {clearLabel}
        </Button>
      )}
      <Button type="button" size="sm" onClick={onApply}>
        {applyLabel}
      </Button>
    </ButtonFooter>
  );
}
