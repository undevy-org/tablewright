import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TableErrorPanel } from "./TableErrorPanel";

describe("TableErrorPanel", () => {
  it("renders the message inside role alert", () => {
    render(<TableErrorPanel message="Load failed" colSpan={3} />);

    expect(screen.getByRole("alert").textContent).toBe("Load failed");
  });

  it("uses the default Retry label when onRetry is provided", () => {
    render(<TableErrorPanel message="Error" colSpan={1} onRetry={() => undefined} />);

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("calls onRetry from the button and omits the button without onRetry", () => {
    const onRetry = vi.fn();
    render(
      <TableErrorPanel
        message="Error"
        colSpan={1}
        onRetry={onRetry}
        retryLabel="Try again"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    cleanup();
    render(<TableErrorPanel message="Error" colSpan={1} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
