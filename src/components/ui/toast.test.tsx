import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PortalContainerContext } from "../../context/portal-container-context";
import { STYLE_SCOPE } from "../../lib/style-scope";
import { getSnapshot, remove } from "../../lib/toast-store";
import { Toaster, toast } from "./toast";

function clearStore() {
  for (const item of [...getSnapshot()]) {
    remove(item.id);
  }
}

describe("Toaster", () => {
  beforeEach(() => {
    clearStore();
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
