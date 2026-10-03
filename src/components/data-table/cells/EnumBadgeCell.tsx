import { Badge } from "../../ui/badge";
import { formatEnumLabel } from "../../../lib/format-enum";
import type { BadgeVariant } from "../types";

interface EnumBadgeCellProps {
  value: string;
  variantMap: Record<string, BadgeVariant>;
  label?: string;
  className?: string;
}

export function EnumBadgeCell({ value, variantMap, label, className }: EnumBadgeCellProps) {
  return (
    <Badge variant={variantMap[value]} className={className}>
      {label ?? formatEnumLabel(value)}
    </Badge>
  );
}
