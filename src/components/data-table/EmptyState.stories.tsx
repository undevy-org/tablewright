import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

const columns = ['Workspace', 'Owner', 'Region', 'Status', 'Updated'];

const meta: Meta<typeof EmptyState> = {
  title: 'DataTable/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  render: () => (
    <div className="w-[720px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead className="bg-[var(--bg-surface)]">
          <tr>
            {columns.map((label) => (
              <th
                key={label}
                className="border-b border-[var(--border-subtle)] px-4 py-3 text-left text-[12px] font-medium text-[var(--text-secondary)]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <EmptyState
            message="No workspaces match the current search and filters."
            colSpan={columns.length}
          />
        </tbody>
      </table>
    </div>
  ),
};
