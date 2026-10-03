import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableLayout } from './TableLayout';

const rows = [
  { id: 'WS-4F2D8A', name: 'Atlas Queue', status: 'Active', owner: 'M. Reyes' },
  { id: 'WS-19C3E0', name: 'Orbit Ledger', status: 'Active', owner: 'D. Novak' },
  { id: 'WS-7A6B41', name: 'Signal Relay', status: 'Paused', owner: 'J. Ahn' },
  { id: 'WS-2E9F15', name: 'Northwind Labs', status: 'Active', owner: 'S. Farrow' },
  { id: 'WS-D34C08', name: 'Atlas Queue — EU', status: 'Archived', owner: 'M. Reyes' },
  { id: 'WS-88B2A3', name: 'Orbit Ledger — Staging', status: 'Active', owner: 'D. Novak' },
  { id: 'WS-C41E77', name: 'Signal Relay — Backup', status: 'Paused', owner: 'J. Ahn' },
  { id: 'WS-5F0A92', name: 'Northwind Labs — QA', status: 'Active', owner: 'S. Farrow' },
  { id: 'WS-A1D6C9', name: 'Atlas Queue — APAC', status: 'Active', owner: 'M. Reyes' },
  { id: 'WS-3B7E44', name: 'Orbit Ledger — Archive', status: 'Archived', owner: 'D. Novak' },
];

const meta: Meta<typeof TableLayout> = {
  title: 'DataTable/TableLayout',
  component: TableLayout,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableLayout>;

export const Default: Story = {
  render: () => (
    <TableLayout className="h-[320px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <TableLayout.ScrollArea>
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
            <tr>
              <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
                Workspace
              </th>
              <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
                Status
              </th>
              <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
                Owner
              </th>
              <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
                ID
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.name}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.status}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.owner}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-tertiary)]">{row.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableLayout.ScrollArea>
    </TableLayout>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <TableLayout className="h-[320px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <TableLayout.ScrollArea>
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
            <tr>
              <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
                Workspace
              </th>
              <th className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.name}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableLayout.ScrollArea>

      <div className="flex shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-[12px] text-[var(--text-secondary)]">
        <span>{rows.length} rows</span>
        <span>Page 1 of 1</span>
      </div>
    </TableLayout>
  ),
};
