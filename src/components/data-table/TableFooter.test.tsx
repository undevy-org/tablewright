import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TableFooter } from "./TableFooter";

const perPageProps = {
  paginationVariant: "perPage" as const,
  selectedCount: 0,
  totalCount: 42,
  onSelectAll: vi.fn(),
  onClearSelection: vi.fn(),
  bulkActions: [],
  currentPage: 1,
  totalPages: 3,
  pageNumbers: [1, 2, 3],
  onPageChange: vi.fn(),
  rowsPerPage: 15,
  onRowsPerPageChange: vi.fn(),
};

describe("TableFooter", () => {
  it('names the rows-per-page select "Rows per page"', () => {
    render(<TableFooter {...perPageProps} />);

    const trigger = screen.getByRole("combobox", { name: "Rows per page" });
    const labelId = trigger.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toBe("Rows per page");
  });

  it("calls onRowsPerPageChange when a new page size is chosen", () => {
    const onRowsPerPageChange = vi.fn();
    render(<TableFooter {...perPageProps} onRowsPerPageChange={onRowsPerPageChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    fireEvent.click(screen.getByRole("option", { name: "30" }));

    expect(onRowsPerPageChange).toHaveBeenCalledWith(30);
  });
});
