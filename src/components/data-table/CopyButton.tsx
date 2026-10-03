import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "../../lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  iconClassName?: string;
  title?: string;
}

export function CopyButton({
  text,
  className,
  iconClassName,
  title = "Copy value",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    void navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      className={cn(
        "ml-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[var(--text-tertiary)] opacity-0 transition-all hover:text-[var(--text-primary)] focus-visible:opacity-100 group-hover:opacity-100",
        className,
      )}
      onClick={handleCopy}
      title={title}
      aria-label={copied ? "Copied" : title}
    >
      {copied ? (
        <Check className={cn("h-3 w-3 text-[var(--tag-green-text)]", iconClassName)} />
      ) : (
        <Copy className={cn("h-3 w-3", iconClassName)} />
      )}
    </button>
  );
}
