import * as React from "react";
import { renderToString } from "react-dom/server";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PortalContainerContext } from "../../context/portal-container-context";
import { STYLE_SCOPE } from "../../lib/style-scope";
import { getSnapshot, remove } from "../../lib/toast-store";
import { Toaster, toast } from "./toast";

const capturedToastTypes: string[] = [];

vi.mock("@radix-ui/react-toast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@radix-ui/react-toast")>();
  const OriginalRoot = actual.Root;
  const Root = React.forwardRef<
    React.ElementRef<typeof OriginalRoot>,
    React.ComponentPropsWithoutRef<typeof OriginalRoot>
  >((props, ref) => {
    if (props.type) {
      capturedToastTypes.push(props.type);
    }
    React.useEffect(() => {
      props.onOpenChange?.(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- test mock: fire open once on mount
    }, [props.onOpenChange]);
    return <OriginalRoot {...props} ref={ref} />;
  });
  Root.displayName = OriginalRoot.displayName;
  return { ...actual, Root };
});

function clearStore() {
  for (const item of [...getSnapshot()]) {
    remove(item.id);
  }
}

describe("Toaster", () => {
  beforeEach(() => {
    clearStore();
    capturedToastTypes.length = 0;
  });

  afterEach(() => {
    clearStore();
    vi.useRealTimers();
  });

  it("shows a toast fired before the Toaster mounts after mount", async () => {
    toast({ title: "Early bird" });
    render(<Toaster />);
    expect(await screen.findByText("Early bird")).not.toBeNull();
  });

  it("renders title, description, and action; action click runs once and dismisses", async () => {
    const onClick = vi.fn();
    render(<Toaster />);
    toast({
      title: "Row deleted",
      description: "Removed from the list.",
      action: { label: "Undo", onClick },
    });

    expect(await screen.findByText("Row deleted")).not.toBeNull();
    expect(screen.getByText("Removed from the list.")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByText("Row deleted")).toBeNull();
    });
  });

  it("removes the toast when Close is activated", async () => {
    render(<Toaster />);
    toast("Dismiss me");
    expect(await screen.findByText("Dismiss me")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByText("Dismiss me")).toBeNull();
    });
  });

  it("auto-dismisses after 5000 ms", () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast("Timed");
    });
    expect(screen.getByText("Timed")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(screen.queryByText("Timed")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("Timed")).toBeNull();
  });

  it("announces error toasts assertively and default toasts politely", async () => {
    render(<Toaster />);
    toast.error("Sync failed");
    await screen.findByText("Sync failed");
    const assertive = document.querySelector('[role="status"][aria-live="assertive"]');
    expect(assertive).not.toBeNull();

    clearStore();
    toast("Polite default");
    await screen.findByText("Polite default");
    const polite = document.querySelector('[role="status"][aria-live="polite"]');
    expect(polite).not.toBeNull();
  });

  it("announces success toasts politely and shows a check icon", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Merchant saved");
    });
    await screen.findByText("Merchant saved");
    expect(document.querySelector('[role="status"][aria-live="polite"]')).not.toBeNull();
    expect(
      screen.getByText("Merchant saved").closest("li")?.querySelector(".lucide-check"),
    ).not.toBeNull();
  });

  it("shows an alert icon on error toasts", async () => {
    render(<Toaster />);
    act(() => {
      toast.error("Broken");
    });
    await screen.findByText("Broken");
    expect(
      screen.getByText("Broken").closest("li")?.querySelector(".lucide-circle-alert"),
    ).not.toBeNull();
  });

  it("omits empty titles and descriptions", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast({ title: "", description: "Only body" });
    });
    await screen.findByText("Only body");
    expect(container.querySelector('[class*="text-[13px]"]')).toBeNull();
  });

  it("sets displayName on Toaster", () => {
    expect(Toaster.displayName).toBe("Toaster");
  });

  it("renders nothing during server render", () => {
    expect(renderToString(<Toaster />)).toBe("");
  });

  it("uses background toast type for non-error variants", async () => {
    render(<Toaster />);
    act(() => {
      toast("Background");
    });
    await screen.findByText("Background");
    expect(capturedToastTypes).toContain("background");
  });

  it("omits description elements for title-only toasts", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast("Just text");
    });
    await screen.findByText("Just text");
    expect(container.querySelector('[class*="text-[12px]"]')).toBeNull();
  });

  it("does not render a description slot for null descriptions", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast({ title: "Title", description: null } as {
        title: string;
        description?: null;
      });
    });
    await screen.findByText("Title");
    expect(container.querySelector('[class*="text-[12px]"]')).toBeNull();
  });

  it("does not render a title slot for null titles", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast({ title: null, description: "only" } as {
        title?: null;
        description: string;
      });
    });
    await screen.findByText("only");
    expect(container.querySelector('[class*="text-[13px]"]')).toBeNull();
  });

  it("does not show variant icons on default toasts", async () => {
    render(<Toaster />);
    act(() => {
      toast("Plain");
    });
    await screen.findByText("Plain");
    const root = screen.getByText("Plain").closest("li");
    expect(root?.querySelector(".lucide-check")).toBeNull();
    expect(root?.querySelector(".lucide-circle-alert")).toBeNull();
  });

  it("keeps the toast open when Radix reports an open state", async () => {
    render(<Toaster />);
    act(() => {
      toast("Still here");
    });
    expect(await screen.findByText("Still here")).not.toBeNull();
  });

  it("skips blank descriptions", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast({ title: "Hi", description: "" });
    });
    await screen.findByText("Hi");
    expect(container.querySelector('[class*="text-[12px]"]')).toBeNull();
  });

  it("renders description-only and title-only content", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast({ description: "Body only" });
    });
    await screen.findByText("Body only");
    expect(screen.getByText("Body only").className).toContain("text-[12px]");
    expect(container.querySelector('[class*="text-[13px]"]')).toBeNull();

    clearStore();
    act(() => {
      toast({ title: "Title only" });
    });
    await screen.findByText("Title only");
    expect(container.querySelector('[class*="text-[12px]"]')).toBeNull();
    expect(screen.queryByText("Body only")).toBeNull();
  });

  it("scopes viewport and roots, labels the viewport, and portals into PortalContainerContext", async () => {
    const portalHost = document.createElement("div");
    document.body.appendChild(portalHost);

    render(
      <PortalContainerContext.Provider value={portalHost}>
        <Toaster />
      </PortalContainerContext.Provider>,
    );
    toast("Portalled");
    await screen.findByText("Portalled");

    const labelled = screen.getByRole("region", { name: "Notifications" });
    expect(portalHost.contains(labelled)).toBe(true);
    const viewport = labelled.querySelector("ol");
    expect(viewport?.className).toContain(STYLE_SCOPE);

    const toastRoot = screen.getByText("Portalled").closest("li");
    expect(toastRoot?.className).toContain(STYLE_SCOPE);
    expect(toastRoot?.getAttribute("data-variant")).toBe("default");

    portalHost.remove();
  });

  it("exposes data-variant on the toast root", async () => {
    render(<Toaster />);
    toast.success("Saved");
    await screen.findByText("Saved");
    expect(screen.getByText("Saved").closest("li")?.getAttribute("data-variant")).toBe(
      "success",
    );

    clearStore();
    toast.error("Broken");
    await screen.findByText("Broken");
    expect(screen.getByText("Broken").closest("li")?.getAttribute("data-variant")).toBe("error");
  });

  it("stacks several toasts in firing order", async () => {
    render(<Toaster />);
    toast("One");
    toast("Two");
    toast("Three");

    const titles = await screen.findAllByText(/^(One|Two|Three)$/);
    expect(titles.map((node) => node.textContent)).toEqual(["One", "Two", "Three"]);
  });
});
