import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterPopoverFooter } from './FilterPopoverFooter';
import { Checkbox } from '../ui/checkbox';

const workspaceOptions = ['Atlas Queue', 'Orbit Ledger', 'Signal Relay', 'Northwind Labs'];

const meta: Meta<typeof FilterPopoverFooter> = {
  title: 'DataTable/FilterPopoverFooter',
  component: FilterPopoverFooter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterPopoverFooter>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-xs overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="px-3 pt-3">
        <p className="mb-2 text-[12px] font-medium text-[var(--text-muted-strong)]">
          Filter by workspace
        </p>
        <div className="space-y-2">
          {workspaceOptions.map((option, index) => (
            <label
              key={option}
              className="flex items-center gap-2 text-[13px] text-[var(--text-primary)]"
            >
              <Checkbox defaultChecked={index < 2} aria-label={option} />
              {option}
            </label>
          ))}
        </div>
      </div>
      <FilterPopoverFooter
        onApply={() => console.log('Apply filters')}
        onClear={() => console.log('Clear filters')}
      />
    </div>
  ),
};

export const ApplyOnly: Story = {
  render: () => (
    <div className="w-full max-w-xs overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="px-3 pt-3">
        <p className="mb-2 text-[12px] font-medium text-[var(--text-muted-strong)]">
          Filter by workspace
        </p>
        <div className="space-y-2">
          {workspaceOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-[13px] text-[var(--text-primary)]"
            >
              <Checkbox aria-label={option} />
              {option}
            </label>
          ))}
        </div>
      </div>
      <FilterPopoverFooter onApply={() => console.log('Apply filters')} />
    </div>
  ),
};
