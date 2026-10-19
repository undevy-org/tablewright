import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGridNavigation } from "./use-grid-navigation";

afterEach(cleanup);

interface GridProps {
  enabled?: boolean;
  rowCount?: number;
  onActivateRow?: (row: number) => void;
  overlayOpen?: boolean;
  isOverlayElement?: (element: Element) => boolean;
  /** Keep data-grid-* on the cells even when the hook is disabled. */
  stickyAttrs?: boolean;
  /** Do not attach the hook's table ref. */
  noRef?: boolean;
}

function Grid({ enabled = true, rowCount = 3, stickyAttrs, noRef, ...rest }: GridProps) {
  const grid = useGridNavigation({ enabled, rowCount, columnCount: 2, firstRow: -1, ...rest });
  return (
    <>
      <button type="button" data-testid="outside">
        outside
      </button>
      <table {...{ onKeyDown: grid.onKeyDown, ref: noRef ? undefined : grid.tableRef }}>
        <caption>
          <button type="button">caption-btn</button>
        </caption>
        <thead>
          <tr>
            <th data-testid="h0" {...grid.getHeaderCellProps(0, true)}>
              <button type="button">head-btn</button>
            </th>
            <th data-testid="h1" {...grid.getHeaderCellProps(1, true)} />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, r) => (
            <tr key={r}>
              {[0, 1].map((c) => (
                <td key={c} data-testid={`c-${r}-${c}`} {...(stickyAttrs && !enabled ? { "data-grid-row": r, "data-grid-col": c } : grid.getCellProps(r, c))}>
                  {c === 1 ? <button type="button">btn-{r}</button> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {createPortal(
        <div data-testid="portal" data-grid-row="1" data-grid-col="0" tabIndex={-1}>
          <button type="button">portal-btn</button>
        </div>,
        document.body,
      )}
      <aside data-testid="overlay">
        <button type="button">overlay-btn</button>
      </aside>
    </>
  );
}

const cell = (r: number, c: number) => screen.getByTestId(`c-${r}-${c}`);
const tabbable = () => document.querySelectorAll('td[tabindex="0"]');
const press = (el: Element, key: string, init: object = {}) =>
  fireEvent.keyDown(el, { key, cancelable: true, ...init });
const isOverlay = (el: Element) => el.closest('[data-testid="overlay"]') !== null;

describe("useGridNavigation row activation", () => {
  it("Enter on a body cell calls onActivateRow once with the row and is prevented", () => {
    const onActivateRow = vi.fn();
    render(<Grid onActivateRow={onActivateRow} />);
    const notPrevented = press(cell(2, 0), "Enter");
    expect(notPrevented).toBe(false);
    expect(onActivateRow).toHaveBeenCalledTimes(1);
    expect(onActivateRow).toHaveBeenCalledWith(2);
  });

  it("without onActivateRow Enter on a body cell is not prevented", () => {
    render(<Grid />);
    expect(press(cell(1, 0), "Enter")).toBe(true);
  });

  it("ignores Ctrl+Enter, Space and keys pressed on a control inside a body cell", () => {
    const onActivateRow = vi.fn();
    render(<Grid onActivateRow={onActivateRow} />);
    const button = screen.getByText("btn-1");
    expect(press(cell(1, 0), "Enter", { ctrlKey: true })).toBe(true);
    expect(press(cell(1, 0), " ")).toBe(true);
    for (const k of ["Enter", " ", "ArrowDown", "ArrowLeft", "Home", "Tab"]) {
      expect(press(button, k)).toBe(true);
    }
    expect(onActivateRow).not.toHaveBeenCalled();
  });

  it("Enter on a header cell still moves into its control, not onActivateRow", () => {
    const onActivateRow = vi.fn();
    render(<Grid onActivateRow={onActivateRow} />);
    const head = screen.getByTestId("h0");
    head.focus();
    press(head, "Enter");
    expect(document.activeElement).toBe(screen.getByText("head-btn"));
    expect(onActivateRow).not.toHaveBeenCalled();
  });

  it("Escape on a control inside a body cell focuses the cell and makes it the tab stop", () => {
    render(<Grid />);
    const button = screen.getByText("btn-2");
    button.focus();
    expect(press(button, "Escape")).toBe(false);
    expect(document.activeElement).toBe(cell(2, 1));
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(cell(2, 1));
  });

  it("does not handle Escape on the cell, with Ctrl, or outside a cell", () => {
    render(<Grid />);
    expect(press(cell(1, 0), "Escape")).toBe(true);
    expect(press(screen.getByText("btn-1"), "Escape", { ctrlKey: true })).toBe(true);
    expect(press(screen.getByTestId("outside"), "Escape")).toBe(true);
    expect(tabbable()[0]).toBe(cell(0, 0));
  });

  it("leaves arrows, Enter, Space and Tab inside a body control alone", () => {
    render(<Grid onActivateRow={vi.fn()} />);
    const button = screen.getByText("btn-1");
    for (const k of ["ArrowUp", "ArrowRight", "End", "PageDown", "Enter", " ", "Tab"]) {
      expect(press(button, k)).toBe(true);
    }
  });

  it("does not handle a keydown from a portal outside the table", () => {
    const onActivateRow = vi.fn();
    render(<Grid onActivateRow={onActivateRow} />);
    const portalBtn = screen.getByText("portal-btn");
    expect(press(portalBtn, "Escape")).toBe(true);
    expect(press(screen.getByTestId("portal"), "Enter")).toBe(true);
    expect(onActivateRow).not.toHaveBeenCalled();
  });

  it("Escape on a control inside the table but outside any cell is not handled", () => {
    render(<Grid />);
    expect(press(screen.getByText("caption-btn"), "Escape")).toBe(true);
  });
});

describe("useGridNavigation focus return after an overlay", () => {
  const rerenderWith = (r: ReturnType<typeof render>, props: GridProps) =>
    r.rerender(<Grid isOverlayElement={isOverlay} {...props} />);

  it("returns focus to the active cell when focus fell to body", () => {
    const r = render(<Grid isOverlayElement={isOverlay} overlayOpen={false} />);
    cell(1, 1).focus();
    rerenderWith(r, { overlayOpen: true });
    act(() => (document.activeElement as HTMLElement).blur());
    rerenderWith(r, { overlayOpen: false });
    expect(document.activeElement).toBe(cell(1, 1));
    expect(tabbable()).toHaveLength(1);
  });

  it("returns focus when it is on an overlay element", () => {
    const r = render(<Grid isOverlayElement={isOverlay} />);
    cell(2, 0).focus();
    rerenderWith(r, { overlayOpen: true });
    screen.getByText("overlay-btn").focus();
    rerenderWith(r, { overlayOpen: false });
    expect(document.activeElement).toBe(cell(2, 0));
  });

  it("does not return focus when the focused element is an overlay element but isOverlayElement is absent", () => {
    const r = render(<Grid />);
    cell(2, 0).focus();
    r.rerender(<Grid overlayOpen />);
    screen.getByText("overlay-btn").focus();
    r.rerender(<Grid overlayOpen={false} />);
    expect(document.activeElement).toBe(screen.getByText("overlay-btn"));
  });

  it("leaves focus on some other element", () => {
    const r = render(<Grid isOverlayElement={isOverlay} />);
    cell(1, 0).focus();
    rerenderWith(r, { overlayOpen: true });
    screen.getByTestId("outside").focus();
    rerenderWith(r, { overlayOpen: false });
    expect(document.activeElement).toBe(screen.getByTestId("outside"));
  });

  it("does nothing when focus was not in the table at open", () => {
    const r = render(<Grid isOverlayElement={isOverlay} />);
    screen.getByTestId("outside").focus();
    rerenderWith(r, { overlayOpen: true });
    act(() => (document.activeElement as HTMLElement).blur());
    rerenderWith(r, { overlayOpen: false });
    expect(document.activeElement).toBe(document.body);
  });

  it("does nothing when the overlay was open on the first render", () => {
    const r = render(<Grid isOverlayElement={isOverlay} overlayOpen />);
    cell(1, 0).focus();
    act(() => (document.activeElement as HTMLElement).blur());
    rerenderWith(r, { overlayOpen: false });
    expect(document.activeElement).toBe(document.body);
  });

  it("does nothing while disabled", () => {
    const r = render(<Grid enabled={false} isOverlayElement={isOverlay} />);
    screen.getByText("btn-1").focus();
    rerenderWith(r, { enabled: false, overlayOpen: true });
    act(() => (document.activeElement as HTMLElement).blur());
    rerenderWith(r, { enabled: false, overlayOpen: false });
    expect(document.activeElement).toBe(document.body);
  });

  it("clamps the active position when its row no longer exists", () => {
    const r = render(<Grid isOverlayElement={isOverlay} rowCount={3} />);
    cell(2, 1).focus();
    rerenderWith(r, { overlayOpen: true, rowCount: 3 });
    act(() => (document.activeElement as HTMLElement).blur());
    rerenderWith(r, { overlayOpen: false, rowCount: 2 });
    expect(document.activeElement).toBe(cell(1, 1));
  });

  it("still returns focus after an unrelated rerun of the effect while the overlay is open", () => {
    const r = render(<Grid isOverlayElement={isOverlay} />);
    cell(1, 1).focus();
    rerenderWith(r, { overlayOpen: true });
    act(() => (document.activeElement as HTMLElement).blur());
    r.rerender(<Grid isOverlayElement={(el) => isOverlay(el)} overlayOpen />);
    r.rerender(<Grid isOverlayElement={isOverlay} overlayOpen={false} />);
    expect(document.activeElement).toBe(cell(1, 1));
  });

  it("does nothing while disabled even if grid attributes remain on the cells", () => {
    const r = render(<Grid enabled={false} stickyAttrs isOverlayElement={isOverlay} />);
    cell(1, 1).focus();
    rerenderWith(r, { enabled: false, stickyAttrs: true, overlayOpen: true });
    act(() => (document.activeElement as HTMLElement).blur());
    rerenderWith(r, { enabled: false, stickyAttrs: true, overlayOpen: false });
    expect(document.activeElement).toBe(document.body);
  });

  it("does not throw when the table ref is not attached", () => {
    const r = render(<Grid noRef isOverlayElement={isOverlay} />);
    expect(() => rerenderWith(r, { noRef: true, overlayOpen: true })).not.toThrow();
  });
});
