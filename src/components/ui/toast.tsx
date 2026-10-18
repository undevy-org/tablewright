import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { AlertCircle, Check, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { STYLE_SCOPE } from "../../lib/style-scope";
import { usePortalContainer } from "../../context/portal-container-context";
import {
  getSnapshot,
  remove,
  subscribe,
  type ToastItem,
} from "../../lib/toast-store";

export { toast } from "../../lib/toast-store";

function ToastRoot({ item }: { item: ToastItem }) {
  const variant = item.variant;
  const isError = variant === "error";

  return (
    <ToastPrimitive.Root
      open
      type={isError ? "foreground" : "background"}
      data-variant={variant}
      onOpenChange={(open) => {
        if (!open) {
          remove(item.id);
        }
      }}
      className={cn(
        STYLE_SCOPE,
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border bg-[var(--bg-surface)] p-4 [box-shadow:var(--shadow-menu)] transition-[transform,opacity] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
        isError ? "border-[var(--border-danger)]" : "border-[var(--border-subtle)]",
      )}
    >
      {variant === "success" ? (
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--text-primary)]" />
      ) : null}
      {variant === "error" ? (
        <AlertCircle
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-[var(--text-primary)]"
        />
      ) : null}
      <div className="grid flex-1 gap-1">
        {item.title != null ? (
          <ToastPrimitive.Title className="text-[13px] font-medium text-[var(--text-primary)]">
            {item.title}
          </ToastPrimitive.Title>
        ) : null}
        {item.description != null ? (
          <ToastPrimitive.Description className="text-[12px] text-[var(--text-secondary)]">
            {item.description}
          </ToastPrimitive.Description>
        ) : null}
      </div>
      {item.action ? (
        <ToastPrimitive.Action
          altText={item.action.label}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-transparent px-3 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[color-mix(in_srgb,var(--bg-surface)_90%,var(--text-primary))]"
          onClick={() => {
            item.action!.onClick();
          }}
        >
          {item.action.label}
        </ToastPrimitive.Action>
      ) : null}
      <ToastPrimitive.Close
        aria-label="Close"
        className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <X aria-hidden className="size-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function Toaster() {
  const mounted = useIsClient();
  const container = usePortalContainer();
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (!mounted) {
    return null;
  }

  const portalContainer = container ?? document.body;

  return createPortal(
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {items.map((item) => (
        <ToastRoot key={item.id} item={item} />
      ))}
      <ToastPrimitive.Viewport
        label="Notifications"
        className={cn(
          STYLE_SCOPE,
          "fixed bottom-0 right-0 z-50 flex max-h-screen w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 p-4 outline-none",
        )}
      />
    </ToastPrimitive.Provider>,
    portalContainer,
  );
}

Toaster.displayName = "Toaster";

export { Toaster };
