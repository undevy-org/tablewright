import type { Meta, StoryObj } from '@storybook/react-vite';
import { ViewChip } from './ViewChip';

const views = [
  { key: 'all', label: 'All Merchants' },
  { key: 'active', label: 'Active' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'expiring-soon', label: 'Block Expiring Soon' },
  { key: 'recently-created', label: 'Recently Created' },
] as const;

const meta: Meta<typeof ViewChip> = {
  title: 'DataTable/ViewChip',
  component: ViewChip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ViewChip>;

export const Active: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      {views.map((view) => (
        <ViewChip key={view.key} label={view.label} active={view.key === 'active'} />
      ))}
    </div>
  ),
};

export const Inactive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      {views.map((view) => (
        <ViewChip key={view.key} label={view.label} />
      ))}
    </div>
  ),
};
