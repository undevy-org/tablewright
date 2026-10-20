import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { Profiler, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFocusRecovery } from "./use-focus-recovery";
import type { RefObject } from "react";
import { useGridNavigation } from "./use-grid-navigation";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

interface HarnessProps {
  cols: string[];
  rows?: number;
  grid?: boolean;
  /** Remounts the header control of a column when its number changes. */
  keys?: Record<string, number>;
  extra?: ReactNode;
  /** What the hook is told about the grid, when it differs from the DOM. */
  gridArg?: boolean;
  caption?: boolean;
}

/** Columns whose id starts with "plain" have a header cell without a control. */
function Harness({ cols, rows = 3, grid = false, keys = {}, extra, gridArg = grid, caption }: HarnessProps) {
  const nav = useGridNavigation({
    enabled: grid,
    rowCount: rows,
    columnCount: cols.length,
    firstRow: -1,
  });
  useFocusRecovery(nav.tableRef, gridArg);
  return (
    <>
      {extra}
      <table {...{ ref: nav.tableRef }}>
        {caption && (
          <caption>
            <button>caption</button>
          </caption>
        )}
        <thead>
          <tr>
            {cols.map((col, index) => (
              <th key={col} {...nav.getHeaderCellProps(index, true)}>
                {col.startsWith("plain") ? col : <button key={keys[col] ?? 0}>{col}</button>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {cols.map((col, index) => (
                <td key={col} {...nav.getCellProps(row, index)}>
                  <button>{`${col}-${row}`}</button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const header = (name: string) => screen.getByRole("button", { name });
const headerCell = (col: number) =>
  document.querySelector<HTMLElement>(`th[data-grid-row="-1"][data-grid-col="${col}"]`)!;
const bodyCell = (row: number, col: number) =>
  document.querySelector<HTMLElement>(`td[data-grid-row="${row}"][data-grid-col="${col}"]`)!;

/** Lets the MutationObserver callback run. */
const flush = () => act(async () => undefined);

describe("useFocusRecovery without a grid", () => {
  it("moves focus to the control of the header cell now at that index", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    header("b").focus();
    view.rerender(<Harness cols={["a", "c"]} />);
    await flush();
    expect(document.activeElement).toBe(header("c"));
  });

  it("falls back to the previous cell's control when the removed column was the last", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    header("c").focus();
    view.rerender(<Harness cols={["a", "b"]} />);
    await flush();
    expect(document.activeElement).toBe(header("b"));
  });

  it("takes the nearest cell that has a control, ties to the lower index", async () => {
    const view = render(<Harness cols={["a", "b", "c", "d", "e"]} />);
    header("c").focus();
    view.rerender(<Harness cols={["a", "plain1", "plain2", "plain3", "e"]} />);
    await flush();
    expect(document.activeElement).toBe(header("a"));
  });

  it("does nothing when no header cell has a control", async () => {
    const view = render(<Harness cols={["a", "b"]} />);
    header("a").focus();
    view.rerender(<Harness cols={["plain1", "plain2"]} />);
    await flush();
    expect(document.activeElement).toBe(document.body);
  });

  it("focuses the new node when the control is remounted in place", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    const old = header("b");
    old.focus();
    view.rerender(<Harness cols={["a", "b", "c"]} keys={{ b: 1 }} />);
    await flush();
    expect(old.isConnected).toBe(false);
    expect(document.activeElement).toBe(header("b"));
    expect(document.activeElement).not.toBe(old);
  });

  it("does nothing for a vanished control in a body cell", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    screen.getByRole("button", { name: "b-1" }).focus();
    view.rerender(<Harness cols={["a", "c"]} />);
    await flush();
    expect(document.activeElement).toBe(document.body);
  });
});

describe("useFocusRecovery in an active grid", () => {
  it("focuses the header grid cell of that column and leaves it the single tab stop", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} grid />);
    header("b").focus();
    view.rerender(<Harness cols={["a", "c"]} grid />);
    await flush();
    expect(document.activeElement).toBe(headerCell(1));
    expect(headerCell(1).getAttribute("tabindex")).toBe("0");
    expect(document.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("clamps a column beyond the last to the last header grid cell", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} grid />);
    header("c").focus();
    view.rerender(<Harness cols={["a", "b"]} grid />);
    await flush();
    expect(document.activeElement).toBe(headerCell(1));
  });

  it("focuses the nearest body cell when the focused body cell itself vanishes", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} grid />);
    bodyCell(2, 2).focus();
    view.rerender(<Harness cols={["a", "b"]} rows={2} grid />);
    await flush();
    expect(document.activeElement).toBe(bodyCell(1, 1));
    expect(bodyCell(1, 1).getAttribute("tabindex")).toBe("0");
    expect(document.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("focuses the same row's cell for a vanished control inside a body cell", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} grid />);
    screen.getByRole("button", { name: "b-1" }).focus();
    view.rerender(<Harness cols={["a", "c"]} grid />);
    await flush();
    expect(document.activeElement).toBe(bodyCell(1, 1));
  });

  it("never picks a header cell for a body origin", async () => {
    const view = render(<Harness cols={["a", "b"]} grid />);
    bodyCell(0, 0).focus();
    view.rerender(<Harness cols={["a", "b"]} rows={1} grid />);
    await flush();
    expect((document.activeElement as HTMLElement).getAttribute("data-grid-row")).toBe("0");
  });

  it("uses the header-control rule when there are no rows and so no grid cells", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} rows={0} grid />);
    header("b").focus();
    view.rerender(<Harness cols={["a", "c"]} rows={0} grid />);
    await flush();
    expect(document.activeElement).toBe(header("c"));
    expect(document.querySelector("[data-grid-row]")).toBeNull();
  });
});

describe("useFocusRecovery and the grid flag", () => {
  it("follows a flag that changes after mount", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    view.rerender(<Harness cols={["a", "b", "c"]} grid />);
    header("b").focus();
    view.rerender(<Harness cols={["a", "c"]} grid />);
    await flush();
    expect(document.activeElement).toBe(headerCell(1));
  });

  it("uses the header-control rule when told the grid is inactive, even if grid cells exist", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} grid />);
    header("b").focus();
    view.rerender(<Harness cols={["a", "c"]} grid gridArg={false} />);
    await flush();
    expect(document.activeElement).toBe(header("c"));
  });
});

describe("useFocusRecovery tracking", () => {
  it("ignores focus on an element inside the table but outside any cell", async () => {
    const errors: ErrorEvent[] = [];
    const onError = (event: ErrorEvent) => errors.push(event);
    window.addEventListener("error", onError);
    const view = render(<Harness cols={["a", "b", "c"]} caption />);
    header("b").focus();
    screen.getByRole("button", { name: "caption" }).focus();
    view.rerender(<Harness cols={["a", "b", "c"]} />);
    await flush();
    window.removeEventListener("error", onError);
    expect(errors).toHaveLength(0);
    expect(document.activeElement).toBe(document.body);
  });

  it("keeps a single observer across focus events", () => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe");
    render(<Harness cols={["a", "b", "c"]} />);
    header("a").focus();
    header("b").focus();
    header("c").focus();
    expect(observe).toHaveBeenCalledTimes(1);
  });

  it("stops listening to the table after unmount", () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    const button = header("b");
    const table = document.querySelector("table")!;
    view.unmount();
    const observe = vi.spyOn(MutationObserver.prototype, "observe");
    table.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    button.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(observe).not.toHaveBeenCalled();
  });

  it("rebinds when it is handed a different table ref", async () => {
    const make = () => {
      const table = document.createElement("table");
      table.innerHTML = "<thead><tr><th><button>x</button></th><th><button>y</button></th></tr></thead>";
      document.body.append(table);
      return table;
    };
    const first = make();
    const second = make();
    const refA = { current: first } as RefObject<HTMLTableElement | null>;
    const refB = { current: second } as RefObject<HTMLTableElement | null>;
    const view = renderHook(({ tableRef }) => useFocusRecovery(tableRef, false), {
      initialProps: { tableRef: refA },
    });
    view.rerender({ tableRef: refB });
    const [x, y] = Array.from(second.querySelectorAll("button"));
    y.focus();
    y.remove();
    await flush();
    expect(document.activeElement).toBe(x);
    first.remove();
    second.remove();
  });
});

describe("useFocusRecovery restraint", () => {
  const Portal = () =>
    createPortal(<button>menu item</button>, document.body);

  it("moves nothing when focus sits on an element outside the table", async () => {
    const view = render(
      <Harness cols={["a", "b", "c"]} extra={<input aria-label="outside" />} />,
    );
    header("b").focus();
    screen.getByLabelText("outside").focus();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    view.rerender(<Harness cols={["a", "c"]} extra={<input aria-label="outside" />} />);
    await flush();
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByLabelText("outside"));
  });

  it("moves nothing when focus is on an element of an open portal menu", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} extra={<Portal />} />);
    header("b").focus();
    screen.getByRole("button", { name: "menu item" }).focus();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    view.rerender(<Harness cols={["a", "c"]} extra={<Portal />} />);
    await flush();
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "menu item" }));
  });

  it("forgets a vanished element for good (no later retry)", async () => {
    const view = render(
      <Harness cols={["a", "b", "c"]} extra={<input aria-label="outside" />} />,
    );
    header("b").focus();
    screen.getByLabelText("outside").focus();
    view.rerender(<Harness cols={["a", "c"]} extra={<input aria-label="outside" />} />);
    await flush();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    screen.getByLabelText("outside").blur();
    view.rerender(<Harness cols={["a"]} extra={<input aria-label="outside" />} />);
    await flush();
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  it("never calls focus while the tracked element stays connected", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    header("b").focus();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    view.rerender(<Harness cols={["a", "b", "c"]} rows={5} />);
    view.rerender(<Harness cols={["a", "b", "c"]} rows={2} />);
    await flush();
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(header("b"));
  });

  it("does not track a focus event from a portal outside the table", async () => {
    const view = render(<Harness cols={["a", "b"]} extra={<Portal />} />);
    screen.getByRole("button", { name: "menu item" }).focus();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    view.rerender(<Harness cols={["a", "b"]} />);
    await flush();
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  it("recovers the next removal from the new position", async () => {
    const view = render(<Harness cols={["a", "b", "c", "d"]} />);
    header("d").focus();
    view.rerender(<Harness cols={["a", "b", "c"]} />);
    await flush();
    expect(document.activeElement).toBe(header("c"));
    view.rerender(<Harness cols={["a", "b"]} />);
    await flush();
    expect(document.activeElement).toBe(header("b"));
  });

  it("does nothing after unmount", async () => {
    const view = render(<Harness cols={["a", "b", "c"]} />);
    const old = header("b");
    old.focus();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect");
    view.unmount();
    expect(disconnect).toHaveBeenCalled();
    document.body.append(old);
    old.remove();
    await flush();
    expect(focus).not.toHaveBeenCalled();
  });
});

describe("useFocusRecovery cost", () => {
  it("registers no timers at rest, on focus events or after a recovery", async () => {
    vi.useFakeTimers();
    const view = render(<Harness cols={["a", "b", "c"]} />);
    expect(vi.getTimerCount()).toBe(0);
    header("b").focus();
    expect(vi.getTimerCount()).toBe(0);
    view.rerender(<Harness cols={["a", "c"]} />);
    await flush();
    expect(document.activeElement).toBe(header("c"));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not re-render the host on focus events", () => {
    let commits = 0;
    render(
      <Profiler id="h" onRender={() => (commits += 1)}>
        <Harness cols={["a", "b", "c"]} />
      </Profiler>,
    );
    const before = commits;
    header("a").focus();
    header("b").focus();
    fireEvent.focusIn(header("c"));
    expect(commits).toBe(before);
  });

  it("renders to a string without touching a browser global", () => {
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document")!;
    const observerDescriptor = Object.getOwnPropertyDescriptor(globalThis, "MutationObserver")!;
    const thrower = () => {
      throw new Error("browser global used during render");
    };
    try {
      Object.defineProperty(globalThis, "document", { get: thrower, configurable: true });
      Object.defineProperty(globalThis, "MutationObserver", { get: thrower, configurable: true });
      expect(() => renderToString(<Harness cols={["a", "b"]} grid />)).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, "document", documentDescriptor);
      Object.defineProperty(globalThis, "MutationObserver", observerDescriptor);
    }
  });
});
