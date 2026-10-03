import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColumnDef } from '@tanstack/react-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Landmark, Shield, Split } from 'lucide-react';

import { DataTableShell } from './DataTableShell';
import { CopyableText } from './CopyableText';
import { RowControlCell, RowControlHeader } from './RowControlCell';
import { SortableHeader } from './SortableHeader';
import { RowActionsMenu } from './RowActionsMenu';
import { TableFooter } from './TableFooter';
import { DrawerSection } from './DrawerSection';
import { DrawerField } from './DrawerField';
import { useColumnResize } from './hooks/use-column-resize';
import { useTableSort } from './hooks/use-table-sort';
import { Badge } from '../ui/badge';
import type { ColumnMetaDef, RowActionSection } from './types';

type WorkspaceRow = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  tier: 'Standard' | 'Priority';
  updatedAt: string;
};

const workspaceRows: WorkspaceRow[] = [
  { id: 'WS-4F2D8A', name: 'Atlas Queue', status: 'ACTIVE', tier: 'Standard', updatedAt: '12.02.2026 13:31:00' },
  { id: 'WS-9C1E77', name: 'Orbit Ledger', status: 'PAUSED', tier: 'Standard', updatedAt: '06.03.2026 16:14:08' },
  { id: 'WS-7A5B31', name: 'Signal Relay', status: 'ACTIVE', tier: 'Priority', updatedAt: '13.02.2026 13:30:27' },
  { id: 'WS-1D8F42', name: 'Northwind Labs', status: 'PAUSED', tier: 'Standard', updatedAt: '12.02.2026 13:31:00' },
];

const columnMeta: Record<string, ColumnMetaDef> = {
  rowControl: { minW: 80, sticky: 'left', stickyOffset: 0, variant: 'control' },
  workspace: { minW: 280 },
  status: { minW: 136 },
  tier: { minW: 180 },
  updatedAt: { minW: 156 },
  actions: { minW: 72, sticky: 'right', stickyOffset: 0 },
};

const groupedActions: RowActionSection[] = [
  {
    label: 'Automation',
    actions: [{ label: 'Create Flow', icon: Split, onClick: () => undefined }],
  },
  {
    label: 'Access & Review',
    actions: [
      { label: 'Permissions', icon: Shield, onClick: () => undefined },
      { label: 'Routing Rules', icon: Landmark, onClick: () => undefined },
    ],
  },
];

function formatUpdatedAt(value: string) {
  const [date, time] = value.split(' ');
  return { date: date ?? value, time: time ?? '' };
}

// DataTableShell takes a real TanStack `Table<TData>` instance rather than
// flat props, so this demo owns real column-resize, sort, and selection
// state and builds the table with `useReactTable` — the same shape a real
// consumer of the shell would wire up.
function DataTableShellDemo({
  rows,
  dense,
  emptyMessage,
  initialDrawerRowId,
}: {
  rows: WorkspaceRow[];
  dense: boolean;
  emptyMessage: string;
  initialDrawerRowId?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    initialDrawerRowId ?? null,
  );
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const { widths, onPointerDown } = useColumnResize(columnMeta);
  const { sortState, toggleSort, applySorting } = useTableSort();

  const sortedRows = useMemo(
    () =>
      applySorting(rows, (row, columnId) => {
        switch (columnId) {
          case 'status':
            return row.status;
          case 'tier':
            return row.tier;
          case 'updatedAt':
            return row.updatedAt;
          case 'workspaceName':
            return row.name;
          case 'workspaceId':
            return row.id;
          default:
            return row.name;
        }
      }),
    [applySorting, rows],
  );

  const allSelected = sortedRows.length > 0 && sortedRows.every((row) => selectedIds.has(row.id));
  const someSelected = sortedRows.some((row) => selectedIds.has(row.id));
  const headerCheckState: boolean | 'indeterminate' = allSelected
    ? true
    : someSelected
      ? 'indeterminate'
      : false;

  const columns = useMemo<ColumnDef<WorkspaceRow>[]>(
    () => [
      {
        id: 'rowControl',
        enableResizing: false,
        header: () => (
          <RowControlHeader
            checked={headerCheckState}
            onToggle={() => {
              setSelectedIds(allSelected ? new Set() : new Set(sortedRows.map((row) => row.id)));
            }}
          />
        ),
        cell: ({ row }) => (
          <RowControlCell
            rowNumber={row.index + 1}
            selected={selectedIds.has(row.original.id)}
            onSelectToggle={() => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(row.original.id)) next.delete(row.original.id);
                else next.add(row.original.id);
                return next;
              });
            }}
          />
        ),
      },
      {
        id: 'workspace',
        accessorFn: (row) => `${row.name} ${row.id}`,
        header: () => (
          <SortableHeader
            primaryLabel="Workspace"
            secondaryLabel="Name / ID"
            primarySorted={sortState.workspaceName ?? false}
            onPrimaryClick={() => toggleSort('workspaceName')}
            secondarySorted={sortState.workspaceId ?? false}
            onSecondaryClick={() => toggleSort('workspaceId')}
          />
        ),
        cell: ({ row }) => (
          <div className="min-w-0 space-y-1">
            <CopyableText
              value={row.original.name}
              title="Copy workspace name"
              className="w-full"
              textClassName="font-semibold text-[var(--text-primary)]"
            />
            <CopyableText
              value={row.original.id}
              title="Copy workspace ID"
              className="w-full"
              textClassName="font-mono text-[11px] text-[var(--text-secondary)]"
            />
          </div>
        ),
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: () => (
          <SortableHeader
            label="Status"
            sorted={sortState.status ?? false}
            onClick={() => toggleSort('status')}
          />
        ),
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === 'ACTIVE' ? 'success' : 'danger'}
            className="min-w-[108px] justify-center"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'tier',
        accessorFn: (row) => row.tier,
        header: () => (
          <SortableHeader
            label="Tier"
            sorted={sortState.tier ?? false}
            onClick={() => toggleSort('tier')}
          />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.tier === 'Standard' ? 'info' : 'warning'}>
            {row.original.tier}
          </Badge>
        ),
      },
      {
        id: 'updatedAt',
        accessorFn: (row) => row.updatedAt,
        header: () => (
          <SortableHeader
            label="Updated"
            sorted={sortState.updatedAt ?? false}
            onClick={() => toggleSort('updatedAt')}
          />
        ),
        cell: ({ row }) => {
          const { date, time } = formatUpdatedAt(row.original.updatedAt);
          return (
            <div className="space-y-1 font-mono">
              <div className="text-[13px] font-medium text-[var(--text-primary)]">{date}</div>
              <div className="text-[12px] text-[var(--text-secondary)]">{time}</div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        enableResizing: false,
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
            Actions
          </span>
        ),
        cell: () => (
          <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
            <RowActionsMenu sections={groupedActions} triggerClassName="opacity-100" />
          </div>
        ),
      },
    ],
    [sortState, toggleSort, headerCheckState, allSelected, sortedRows, selectedIds],
  );

  const table = useReactTable({
    data: sortedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedWorkspace = rows.find((row) => row.id === selectedWorkspaceId) ?? null;

  return (
    <div className="flex h-[480px] flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <DataTableShell
        table={table}
        dense={dense}
        emptyMessage={emptyMessage}
        columnMeta={columnMeta}
        columnWidths={widths}
        onColumnResizeStart={onPointerDown}
        onRowClick={(workspace) =>
          setSelectedWorkspaceId((current) => (current === workspace.id ? null : workspace.id))
        }
        getRowIsActive={(workspace) => workspace.id === selectedWorkspaceId}
        footer={
          <TableFooter
            selectedCount={selectedIds.size}
            totalCount={sortedRows.length}
            onSelectAll={() => setSelectedIds(new Set(sortedRows.map((row) => row.id)))}
            onClearSelection={() => setSelectedIds(new Set())}
            bulkActions={selectedIds.size > 0 ? [{ label: 'Export CSV', onClick: () => undefined }] : []}
            paginationVariant="perPage"
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            currentPage={1}
            totalPages={1}
            pageNumbers={[1]}
            onPageChange={() => undefined}
          />
        }
        drawer={{
          open: Boolean(selectedWorkspace),
          onClose: () => setSelectedWorkspaceId(null),
          title: selectedWorkspace ? selectedWorkspace.name : '',
          subtitle: selectedWorkspace ? selectedWorkspace.id : undefined,
          headerExtra: selectedWorkspace ? (
            <Badge variant={selectedWorkspace.status === 'ACTIVE' ? 'success' : 'danger'}>
              {selectedWorkspace.status}
            </Badge>
          ) : undefined,
          content: selectedWorkspace ? (
            <div className="space-y-6">
              <DrawerSection title="Overview">
                <DrawerField label="Name" value={selectedWorkspace.name} />
                <DrawerField label="ID" value={selectedWorkspace.id} />
                <DrawerField label="Status" value={selectedWorkspace.status} />
                <DrawerField label="Tier" value={selectedWorkspace.tier} />
              </DrawerSection>
              <DrawerSection title="Available Actions" className="mb-0">
                <div className="space-y-3">
                  {groupedActions.map((section) => (
                    <div
                      key={section.label}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3"
                    >
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                        {section.label}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {section.actions.map((action) => (
                          <div
                            key={action.label}
                            className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-[12px] text-[var(--text-primary)]"
                          >
                            <action.icon className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]" />
                            <span>{action.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DrawerSection>
            </div>
          ) : null,
        }}
      />
    </div>
  );
}

const meta: Meta<typeof DataTableShell> = {
  title: 'DataTable/DataTableShell',
  component: DataTableShell,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableShell>;

export const Default: Story = {
  render: () => (
    <DataTableShellDemo
      rows={workspaceRows}
      dense={false}
      emptyMessage="No workspaces match the current search and filters."
    />
  ),
};

export const Dense: Story = {
  render: () => (
    <DataTableShellDemo
      rows={workspaceRows}
      dense
      emptyMessage="No workspaces match the current search and filters."
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTableShellDemo
      rows={[]}
      dense={false}
      emptyMessage="No workspaces match the current search and filters."
    />
  ),
};

export const WithDrawerOpen: Story = {
  render: () => (
    <DataTableShellDemo
      rows={workspaceRows}
      dense={false}
      emptyMessage="No workspaces match the current search and filters."
      initialDrawerRowId={workspaceRows[0].id}
    />
  ),
};
