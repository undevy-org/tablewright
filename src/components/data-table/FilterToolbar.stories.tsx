import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, Filter, Plus, RefreshCw, FileDown } from 'lucide-react';

import * as FilterToolbar from './FilterToolbar';
import { FilterChip } from './FilterChip';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

// FilterToolbar is exported as a namespace (`export * as FilterToolbar from
// "./FilterToolbar"`), not a single default component — Root, SearchForm,
// Filters, Utility, Actions, ActiveFilters, ColumnVisibilityMenu, and
// DensityControl are the real named exports. Root anchors the `component`
// field since it's the outermost piece of the composition.
const meta: Meta<typeof FilterToolbar.Root> = {
  title: 'DataTable/FilterToolbar',
  component: FilterToolbar.Root,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterToolbar.Root>;

const columnDefs = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'status', label: 'Status' },
  { id: 'tier', label: 'Tier' },
  { id: 'updatedAt', label: 'Updated' },
];

// Search, column visibility, density, and refresh all carry real internal
// state (SearchForm/ColumnVisibilityMenu/DensityControl are controlled
// components) — a static render would leave them inert in the canvas.
function FilterToolbarDemo() {
  const [searchValue, setSearchValue] = React.useState('Atlas');
  const [density, setDensity] = React.useState<'normal' | 'dense'>('normal');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({
    workspace: true,
    status: true,
    tier: true,
    updatedAt: true,
  });

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;
  const columns: FilterToolbar.ColumnToggleItem[] = columnDefs.map((column) => ({
    ...column,
    checked: columnVisibility[column.id],
    // Guard against hiding the last visible column.
    disabled: visibleColumnCount === 1 && columnVisibility[column.id],
  }));

  return (
    <div className="w-full max-w-[900px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4">
      <FilterToolbar.Root>
        <FilterToolbar.SearchForm
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by workspace ID"
            className="min-w-0 flex-1"
          />
          <Button type="submit" className="shrink-0">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </FilterToolbar.SearchForm>

        <FilterToolbar.Filters>
          <Button type="button" variant="secondary" className="shrink-0">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </FilterToolbar.Filters>

        <FilterToolbar.ActiveFilters>
          <FilterChip label="Status" value="ACTIVE" onRemove={() => {}} active />
          <FilterChip label="Tier" value="Priority" onRemove={() => {}} active />
          <Button
            type="button"
            variant="ghost"
            className="px-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Filter
          </Button>
        </FilterToolbar.ActiveFilters>

        <FilterToolbar.Utility>
          <FilterToolbar.ColumnVisibilityMenu
            columns={columns}
            onColumnToggle={(columnId) => {
              if (columnVisibility[columnId] && visibleColumnCount === 1) return;
              setColumnVisibility((current) => ({
                ...current,
                [columnId]: !current[columnId],
              }));
            }}
          />
          <FilterToolbar.DensityControl density={density} onDensityChange={setDensity} />
        </FilterToolbar.Utility>

        <FilterToolbar.Actions>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0"
            onClick={() => {
              setIsRefreshing(true);
              window.setTimeout(() => setIsRefreshing(false), 600);
            }}
          >
            <RefreshCw className={`h-4 w-4${isRefreshing ? ' animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" variant="secondary" className="shrink-0">
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
          <Button type="button" className="shrink-0">
            <Plus className="h-4 w-4" />
            Add Workspace
          </Button>
        </FilterToolbar.Actions>
      </FilterToolbar.Root>
    </div>
  );
}

export const FullToolbar: Story = {
  render: () => <FilterToolbarDemo />,
};

// Isolates the two menu-style controls (column visibility + density) that
// live in the Utility slot, for cases where the full search/filter/actions
// composition above is more than needed.
function UtilityControlsDemo() {
  const [density, setDensity] = React.useState<'normal' | 'dense'>('normal');
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({
    workspace: true,
    status: true,
    tier: true,
    updatedAt: true,
  });

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;
  const columns: FilterToolbar.ColumnToggleItem[] = columnDefs.map((column) => ({
    ...column,
    checked: columnVisibility[column.id],
    disabled: visibleColumnCount === 1 && columnVisibility[column.id],
  }));

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <FilterToolbar.Utility>
        <FilterToolbar.ColumnVisibilityMenu
          columns={columns}
          onColumnToggle={(columnId) => {
            if (columnVisibility[columnId] && visibleColumnCount === 1) return;
            setColumnVisibility((current) => ({
              ...current,
              [columnId]: !current[columnId],
            }));
          }}
        />
        <FilterToolbar.DensityControl density={density} onDensityChange={setDensity} />
      </FilterToolbar.Utility>
    </div>
  );
}

export const UtilityControls: Story = {
  render: () => <UtilityControlsDemo />,
};
