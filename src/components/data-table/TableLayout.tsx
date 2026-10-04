import { cn } from "../../lib/utils";
import { SCROLL_REGION_TAB_INDEX } from "../../lib/scroll-region-tab-index";
import { useScrollActivity } from "../../hooks/use-scroll-activity";

interface TableLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function TableLayout({ children, className }: TableLayoutProps) {
  return (
    <div className={cn("relative flex flex-1 flex-col overflow-hidden", className)}>
      {children}
    </div>
  );
}

function ScrollArea({ children, className }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useScrollActivity<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      tabIndex={SCROLL_REGION_TAB_INDEX}
      className={cn("scrollbar-auto-hide flex-1 overflow-auto", className)}
    >
      {children}
    </div>
  );
}

TableLayout.ScrollArea = ScrollArea;
