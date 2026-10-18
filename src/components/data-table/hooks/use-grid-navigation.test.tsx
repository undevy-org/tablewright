import { cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useGridNavigation } from "./use-grid-navigation";

afterEach(cleanup);

function Grid({
  enabled = true,
  rowCount,
  columnCount,
  renderedRows = rowCount,
}: {
  enabled?: boolean;
  rowCount: number;
  columnCount: number;
  renderedRows?: number;
}) {
  const grid = useGridNavigation({ enabled, rowCount, columnCount });
  return (
    <table onKeyDown={grid.onKeyDown}>
      <tbody>
        {Array.from({ length: renderedRows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: columnCount }, (_, c) => (
              <td key={c} data-testid={`c-${r}-${c}`} {...grid.getCellProps(r, c)}>
                {r === 0 && c === 0 ? <button type="button">inner</button> : null}
                {r === 0 && c === 1 ? <input aria-label="inner-input" /> : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>
            <div data-testid="half-row" data-grid-row="0" tabIndex={-1} />
            <div data-testid="half-col" data-grid-col="0" tabIndex={-1} />
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

const cell = (r: number, c: number) => screen.getByTestId(`c-${r}-${c}`);
const tabbable = () => document.querySelectorAll('td[tabindex="0"]');

describe("useGridNavigation", () => {
  it("returns no props and no handler when disabled", () => {
    render(<Grid enabled={false} rowCount={2} columnCount={2} />);
    const el = cell(0, 0);
    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.hasAttribute("data-grid-row")).toBe(false);
    expect(el.hasAttribute("data-grid-col")).toBe(false);
  });

  it("returns empty cell props and no key handler when disabled", () => {
    const { result } = renderHook(() =>
      useGridNavigation({ enabled: false, rowCount: 2, columnCount: 2 }),
    );
    expect(result.current.getCellProps(0, 0)).toEqual({});
    expect(result.current.onKeyDown).toBeUndefined();
  });

  it("ignores key presses whose target is not a grid cell", () => {
    render(<Grid rowCount={3} columnCount={3} />);
    expect(fireEvent.keyDown(screen.getByRole("table"), { key: "ArrowDown" })).toBe(true);
    expect(fireEvent.keyDown(screen.getByTestId("half-row"), { key: "ArrowDown" })).toBe(true);
    expect(fireEvent.keyDown(screen.getByTestId("half-col"), { key: "ArrowDown" })).toBe(true);
  });

  it("does not throw when the target cell is not in the DOM", () => {
    render(<Grid rowCount={3} columnCount={3} renderedRows={1} />);
    cell(0, 0).focus();
    expect(() => fireEvent.keyDown(cell(0, 0), { key: "ArrowDown" })).not.toThrow();
  });

  it("makes only cell 0,0 tabbable initially", () => {
    render(<Grid rowCount={3} columnCount={3} />);
    expect(tabbable()).toHaveLength(1);
    expect(cell(0, 0).getAttribute("tabindex")).toBe("0");
    expect(cell(1, 1).getAttribute("tabindex")).toBe("-1");
    expect(cell(2, 1).getAttribute("data-grid-row")).toBe("2");
    expect(cell(2, 1).getAttribute("data-grid-col")).toBe("1");
  });

  it.each([
    ["ArrowDown", {}, [1, 0]],
    ["ArrowRight", {}, [0, 1]],
    ["End", {}, [0, 2]],
    ["PageDown", {}, [2, 0]],
    ["End", { ctrlKey: true }, [2, 2]],
  ])("%s %j moves focus and the single tabindex=0", (key, init, [r, c]) => {
    render(<Grid rowCount={3} columnCount={3} />);
    cell(0, 0).focus();
    fireEvent.keyDown(cell(0, 0), { key, ...init });
    expect(document.activeElement).toBe(cell(r, c));
    expect(tabbable()).toHaveLength(1);
    expect(cell(r, c).getAttribute("tabindex")).toBe("0");
  });

  it("moves back with ArrowUp, ArrowLeft, Home, PageUp and Ctrl+Home", () => {
    render(<Grid rowCount={3} columnCount={3} />);
    cell(2, 2).focus();
    fireEvent.keyDown(cell(2, 2), { key: "ArrowUp" });
    expect(document.activeElement).toBe(cell(1, 2));
    fireEvent.keyDown(cell(1, 2), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cell(1, 1));
    fireEvent.keyDown(cell(1, 1), { key: "Home" });
    expect(document.activeElement).toBe(cell(1, 0));
    fireEvent.keyDown(cell(1, 0), { key: "PageUp" });
    expect(document.activeElement).toBe(cell(0, 0));
    cell(2, 2).focus();
    fireEvent.keyDown(cell(2, 2), { key: "Home", ctrlKey: true });
    expect(document.activeElement).toBe(cell(0, 0));
  });

  it("prevents default only for handled keys", () => {
    render(<Grid rowCount={3} columnCount={3} />);
    cell(0, 0).focus();
    expect(fireEvent.keyDown(cell(0, 0), { key: "ArrowDown" })).toBe(false);
    cell(0, 0).focus();
    expect(fireEvent.keyDown(cell(0, 0), { key: "a" })).toBe(true);
    expect(fireEvent.keyDown(cell(0, 0), { key: "Enter" })).toBe(true);
  });

  it.each(["altKey", "metaKey", "shiftKey"])("ignores ArrowDown with %s", (mod) => {
    render(<Grid rowCount={3} columnCount={3} />);
    cell(0, 0).focus();
    expect(fireEvent.keyDown(cell(0, 0), { key: "ArrowDown", [mod]: true })).toBe(true);
    expect(document.activeElement).toBe(cell(0, 0));
  });

  it("leaves keys pressed inside a button or input alone", () => {
    render(<Grid rowCount={3} columnCount={3} />);
    const button = screen.getByRole("button", { name: "inner" });
    button.focus();
    expect(fireEvent.keyDown(button, { key: "ArrowDown" })).toBe(true);
    expect(document.activeElement).toBe(button);
    const input = screen.getByLabelText("inner-input");
    input.focus();
    expect(fireEvent.keyDown(input, { key: "ArrowRight" })).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it("makes a focused cell the active one", () => {
    render(<Grid rowCount={3} columnCount={3} />);
    fireEvent.focus(cell(2, 1));
    expect(tabbable()).toHaveLength(1);
    expect(cell(2, 1).getAttribute("tabindex")).toBe("0");
    expect(cell(0, 0).getAttribute("tabindex")).toBe("-1");
  });

  it("clamps the active cell when rows or columns shrink, without a key press", () => {
    const { rerender } = render(<Grid rowCount={4} columnCount={4} />);
    fireEvent.focus(cell(3, 3));
    rerender(<Grid rowCount={2} columnCount={3} />);
    expect(tabbable()).toHaveLength(1);
    expect(cell(1, 2).getAttribute("tabindex")).toBe("0");
  });
});
