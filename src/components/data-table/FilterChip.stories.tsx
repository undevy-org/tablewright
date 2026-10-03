import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterChip } from './FilterChip';

const meta: Meta<typeof FilterChip> = {
  title: 'DataTable/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

export const Default: Story = {
  render: () => (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <FilterChip label="Status" value="ACTIVE" onRemove={() => {}} active />
    </div>
  ),
};

export const ActiveFilterGroup: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <FilterChip label="Status" value="ACTIVE" onRemove={() => {}} active />
      <FilterChip label="Tier" value="Priority" onRemove={() => {}} active />
      <FilterChip label="Workspace" value="WS-4F2D8A" onRemove={() => {}} active />
    </div>
  ),
};

export const Inactive: Story = {
  render: () => (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <FilterChip label="Owner" value="Atlas Queue" onRemove={() => {}} />
    </div>
  ),
};

export const LabelOnly: Story = {
  render: () => (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <FilterChip label="Starred" onRemove={() => {}} active />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    type FilterState = {
      id: string;
      label: string;
      value?: string;
      active?: boolean;
    };

    const initialFilters: FilterState[] = [
      { id: 'status', label: 'Status', value: 'ACTIVE', active: true },
      { id: 'workspace', label: 'Workspace', value: 'WS-4F2D8A', active: true },
      { id: 'owner', label: 'Owner', value: 'Orbit Ledger', active: false },
    ];

    function InteractiveDemo() {
      const [filters, setFilters] = React.useState<FilterState[]>(initialFilters);

      return (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          {filters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.label}
                  value={filter.value}
                  active={filter.active}
                  onRemove={() =>
                    setFilters((current) => current.filter((f) => f.id !== filter.id))
                  }
                />
              ))}
            </div>
          ) : (
            <span className="text-[13px] text-[var(--text-tertiary)]">
              No filters applied
            </span>
          )}
        </div>
      );
    }

    return <InteractiveDemo />;
  },
};
