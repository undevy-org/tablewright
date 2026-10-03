import { CopyButton } from "./CopyButton";
import { cn } from "../../lib/utils";

interface CopyableTextProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  textClassName?: string;
  buttonClassName?: string;
  title?: string;
}

export function CopyableText({
  value,
  children,
  className,
  textClassName,
  buttonClassName,
  title = "Copy value",
}: CopyableTextProps) {
  return (
    <span className={cn("group/copy inline-flex min-w-0 items-center gap-1", className)}>
      <span className={cn("min-w-0 truncate", textClassName)}>{children ?? value}</span>
      <CopyButton
        text={value}
        title={title}
        className={cn("group-hover/copy:opacity-100 group-focus-within/copy:opacity-100", buttonClassName)}
      />
    </span>
  );
}
