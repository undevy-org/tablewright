import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TableFooter } from "./TableFooter";

describe("TableFooter", () => {
  it('names the rows-per-page select "Rows per page"', () => {
    render(
      <TableFooter
        paginationVariant="perPage"
        selectedCount={0}
        totalCount={42}
        onSelectAll={vi.fn()}
        onClearSelection={vi.fn()}
        bulkActions={[]}
        currentPage={1}
        totalPages={3}
        pageNumbers={[1, 2, 3]}
        onPageChange={vi.fn()}
        rowsPerPage={15}
        onRowsPerPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Rows per page" })).toBeTruthy();
  });
});
