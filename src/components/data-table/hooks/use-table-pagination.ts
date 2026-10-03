import { useCallback, useMemo, useState } from "react";

export function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible = 5,
) {
  const pages: number[] = [];
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return pages;
}

export function useTablePagination(totalItems: number, itemsPerPage = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const pageNumbers = useMemo(
    () => getVisiblePageNumbers(safePage, totalPages),
    [safePage, totalPages],
  );

  const paginate = useCallback(
    <T>(items: T[]): T[] => {
      const start = (safePage - 1) * itemsPerPage;
      return items.slice(start, start + itemsPerPage);
    },
    [safePage, itemsPerPage],
  );

  const resetPage = useCallback(() => setPage(1), []);

  return { page, setPage, safePage, totalPages, pageNumbers, paginate, resetPage };
}
