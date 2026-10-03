import type { Meta, StoryObj } from '@storybook/react-vite';
import { SortableHeader } from './SortableHeader';

const meta: Meta<typeof SortableHeader> = {
  title: 'DataTable/SortableHeader',
  component: SortableHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SortableHeader>;

// SortableHeader is meant to sit inside a real <th>. sorted={false} renders
// the ArrowUpDown icon, but it's opacity-0 by default and only reveals
// itself on hover/focus of the button (group/header), since it's designed
// to stay quiet until a visitor is actually scanning that column. Hover the
// label in the canvas to see it fade in.
export const Unsorted: Story = {
  render: () => (
    <div className="w-fit rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <SortableHeader label="Workspace" sorted={false} onClick={() => undefined} />
    </div>
  ),
};

export const Ascending: Story = {
  render: () => (
    <div className="w-fit rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <SortableHeader label="Amount" sorted="asc" onClick={() => undefined} />
    </div>
  ),
};

export const Descending: Story = {
  render: () => (
    <div className="w-fit rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <SortableHeader label="Updated" sorted="desc" onClick={() => undefined} />
    </div>
  ),
};

// Stacked but not dual-sort: passing secondaryLabel (with no primarySorted)
// derives mode="stacked", which renders the two-line primary/secondary
// label pair, but the whole header is still a single clickable target with
// one sort icon driven by the top-level `sorted` prop.
export const Stacked: Story = {
  render: () => (
    <div className="w-fit rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <SortableHeader
        primaryLabel="Workspace"
        secondaryLabel="Name / ID"
        sorted={false}
        onClick={() => undefined}
      />
    </div>
  ),
};

// Dual sort: once primarySorted is defined alongside a stacked layout, the
// component switches to its dual-sort branch — primary and secondary labels
// become two independent buttons, each with its own icon and click handler,
// stacked vertically instead of sharing one clickable row.
export const StackedDualSort: Story = {
  render: () => (
    <div className="w-fit rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <SortableHeader
        primaryLabel="Workspace"
        secondaryLabel="Name / ID"
        primarySorted="asc"
        onPrimaryClick={() => undefined}
        secondarySorted={false}
        onSecondaryClick={() => undefined}
      />
    </div>
  ),
};
