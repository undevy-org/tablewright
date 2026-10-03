import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableFooter } from './TableFooter';
import type { BulkAction } from './types';

const meta: Meta<typeof TableFooter> = {
  title: 'DataTable/TableFooter',
  component: TableFooter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableFooter>;

const sampleRows = [
  { name: 'Atlas Queue', id: 'WS-4F2D8A' },
  { name: 'Orbit Ledger', id: 'WS-19C3E0' },
  { name: 'Signal Relay', id: 'WS-7A02B4' },
  { name: 'Northwind Labs', id: 'WS-3E88F1' },
];

function TableShellFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[760px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
              Workspace
            </th>
            <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
              ID
            </th>
          </tr>
        </thead>
        <tbody>
          {sampleRows.map((row) => (
            <tr key={row.id} className="border-b border-[var(--border-subtle)]">
              <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.name}</td>
              <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{row.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  );
}

function NoSelectionDemo() {
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [currentPage, setCurrentPage] = React.useState(3);
  const totalCount = 128;
  const totalPages = 9;
  const pageNumbers = [1, 2, 3, 4, 5];

  return (
    <TableShellFrame>
      <TableFooter
        selectedCount={0}
        totalCount={totalCount}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
        bulkActions={[]}
        paginationVariant="perPage"
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </TableShellFrame>
  );
}

function WithSelectionDemo() {
  const [selectedCount, setSelectedCount] = React.useState(6);
  const totalCount = 128;
  const bulkActions: BulkAction[] = [
    { label: 'Export CSV', onClick: () => undefined },
    { label: 'Remove', onClick: () => undefined, variant: 'danger' },
  ];

  return (
    <TableShellFrame>
      <TableFooter
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={() => setSelectedCount(totalCount)}
        onClearSelection={() => setSelectedCount(0)}
        bulkActions={bulkActions}
      />
    </TableShellFrame>
  );
}

function PagesOnlyDemo() {
  const [currentPage, setCurrentPage] = React.useState(2);
  const totalCount = 54;
  const totalPages = 6;
  const pageNumbers = [1, 2, 3, 4, 5, 6];

  return (
    <TableShellFrame>
      <TableFooter
        selectedCount={0}
        totalCount={totalCount}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
        bulkActions={[]}
        paginationVariant="pages"
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={setCurrentPage}
      />
    </TableShellFrame>
  );
}

export const NoSelection: Story = {
  render: () => <NoSelectionDemo />,
};

export const WithSelection: Story = {
  render: () => <WithSelectionDemo />,
};

export const PagesOnly: Story = {
  render: () => <PagesOnlyDemo />,
};
