import type { ReactNode } from "react";

export type ToastVariant = "default" | "success" | "error";

export type ToastInput =
  | string
  | {
      title?: ReactNode;
      description?: ReactNode;
      action?: { label: string; onClick: () => void };
    };

export type ToastItem = {
  id: string;
  variant: ToastVariant;
  title?: ReactNode;
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
};

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();
let nextId = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): readonly ToastItem[] {
  return toasts;
}

export function remove(id: string) {
  if (!toasts.some((toast) => toast.id === id)) {
    return;
  }
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

function normalizeContent(value: ReactNode | undefined): ReactNode | undefined {
  if (value == null || value === "") {
    return undefined;
  }
  return value;
}

function normalizeInput(input: ToastInput): Omit<ToastItem, "id" | "variant"> {
  if (typeof input === "string") {
    return { title: normalizeContent(input) };
  }
  return {
    title: normalizeContent(input.title),
    description: normalizeContent(input.description),
    action: input.action,
  };
}

function pushToast(variant: ToastVariant, input: ToastInput) {
  const id = `toast-${++nextId}`;
  toasts = [...toasts, { id, variant, ...normalizeInput(input) }];
  emit();
}

/**
 * Imperative toast API. Render one `<Toaster/>` at the app root.
 */
function toast(input: ToastInput): void {
  pushToast("default", input);
}

toast.success = (input: ToastInput): void => {
  pushToast("success", input);
};

toast.error = (input: ToastInput): void => {
  pushToast("error", input);
};

export { toast };
