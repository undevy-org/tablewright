import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it } from "vitest";

import { useGridNavigation } from "./use-grid-navigation";

afterEach(cleanup);

function Grid({ enabled = true, rowCount = 2 }: { enabled?: boolean; rowCount?: number }) {
  const grid = useGridNavigation({ enabled, rowCount, columnCount: 2, firstRow: -1 });
  return (
    <>
      <table onKeyDown={grid.onKeyDown}>
        <thead>
          <tr>
            <th data-testid="h0" {...grid.getHeaderCellProps(0, true)}>
              <button type="button">btn</button>
              <input aria-label="hin" />
            </th>
            <th data-testid="h1" {...grid.getHeaderCellProps(1, true)}>
              plain
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, r) => (
            <tr key={r}>
              {[0, 1].map((c) => (
                <td key={c} data-testid={`c-${r}-${c}`} {...grid.getCellProps(r, c)} />
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <span {...grid.getHeaderCellProps(0, false)} data-testid="not-leaf" />
              {createPortal(<button type="button">portal</button>, document.body)}
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}

const key = (el: Element, k: string, init: object = {}) =>
  fireEvent.keyDown(el, { key: k, ...init });

describe("useGridNavigation header cells", () => {
  it("getHeaderCellProps gives grid props for a leaf row", () => {
    const { result } = renderHook(() =>
      useGridNavigation({ enabled: true, rowCount: 3, columnCount: 2, firstRow: -1 }),
    );
    const props = result.current.getHeaderCellProps(1, true);
    expect(props.tabIndex).toBe(-1);
    expect(props["data-grid-row"]).toBe(-1);
    expect(props["data-grid-col"]).toBe(1);
    expect(typeof props.onFocus).toBe("function");
  });

  it("getHeaderCellProps is empty for a non-leaf row", () => {
    const { result } = renderHook(() =>
      useGridNavigation({ enabled: true, rowCount: 3, columnCount: 2, firstRow: -1 }),
    );
    expect(result.current.getHeaderCellProps(0, false)).toEqual({});
  });

  it("getHeaderCellProps is empty when disabled", () => {
    const { result } = renderHook(() =>
      useGridNavigation({ enabled: false, rowCount: 3, columnCount: 2, firstRow: -1 }),
    );
    expect(result.current.getHeaderCellProps(0, true)).toEqual({});
  });

  it("getHeaderCellProps is empty with zero rows", () => {
    const { result } = renderHook(() =>
      useGridNavigation({ enabled: true, rowCount: 0, columnCount: 2, firstRow: -1 }),
    );
    expect(result.current.getHeaderCellProps(0, true)).toEqual({});
  });

  it("focusing a header cell makes it the single tabindex=0", () => {
    render(<Grid />);
    expect(screen.getByTestId("c-0-0").getAttribute("tabindex")).toBe("0");
    act(() => screen.getByTestId("h1").focus());
    expect(screen.getByTestId("h1").getAttribute("tabindex")).toBe("0");
    expect(screen.getByTestId("c-0-0").getAttribute("tabindex")).toBe("-1");
    expect(document.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("Enter on a header cell with a control focuses it and is prevented", () => {
    render(<Grid />);
    const h0 = screen.getByTestId("h0");
    h0.focus();
    expect(key(h0, "Enter")).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "btn" }));
  });

  it("Enter on a header cell without a control is neither handled nor prevented", () => {
    render(<Grid />);
    const h1 = screen.getByTestId("h1");
    h1.focus();
    expect(key(h1, "Enter")).toBe(true);
    expect(document.activeElement).toBe(h1);
  });

  it("Enter with Ctrl on a header cell is not handled", () => {
    render(<Grid />);
    const h0 = screen.getByTestId("h0");
    h0.focus();
    expect(key(h0, "Enter", { ctrlKey: true })).toBe(true);
    expect(document.activeElement).toBe(h0);
  });

  it("Space on a header cell is not handled", () => {
    render(<Grid />);
    const h0 = screen.getByTestId("h0");
    h0.focus();
    expect(key(h0, " ")).toBe(true);
    expect(document.activeElement).toBe(h0);
  });

  it("Escape on a control inside a header focuses the cell and makes it active", () => {
    render(<Grid />);
    const btn = screen.getByRole("button", { name: "btn" });
    btn.focus();
    expect(key(btn, "Escape")).toBe(false);
    const h0 = screen.getByTestId("h0");
    expect(document.activeElement).toBe(h0);
    expect(h0.getAttribute("tabindex")).toBe("0");
    expect(document.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("Escape on the header cell itself is not handled", () => {
    render(<Grid />);
    const h0 = screen.getByTestId("h0");
    h0.focus();
    expect(key(h0, "Escape")).toBe(true);
  });

  it("Escape on a body cell is not handled", () => {
    render(<Grid />);
    expect(key(screen.getByTestId("c-0-0"), "Escape")).toBe(true);
  });

  it.each([{ altKey: true }, { metaKey: true }, { shiftKey: true }, { ctrlKey: true }])(
    "Escape with a modifier %o in a header control is not handled",
    (mod) => {
      render(<Grid />);
      const btn = screen.getByRole("button", { name: "btn" });
      btn.focus();
      expect(key(btn, "Escape", mod)).toBe(true);
      expect(document.activeElement).toBe(btn);
    },
  );

  it.each(["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End", "Enter", "Tab"])(
    "%s inside a header control is not handled",
    (k) => {
      render(<Grid />);
      const input = screen.getByLabelText("hin");
      input.focus();
      expect(key(input, k)).toBe(true);
      expect(document.activeElement).toBe(input);
    },
  );

  it("a keydown from a portal outside the table is not handled", () => {
    render(<Grid />);
    const portal = screen.getByRole("button", { name: "portal" });
    expect(key(portal, "Escape")).toBe(true);
    expect(key(portal, "ArrowDown")).toBe(true);
  });

  it("a non-leaf header row gets no grid attributes", () => {
    render(<Grid />);
    expect(screen.getByTestId("not-leaf").hasAttribute("data-grid-row")).toBe(false);
  });
});
