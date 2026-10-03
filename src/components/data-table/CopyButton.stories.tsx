import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyButton } from './CopyButton';

const meta: Meta<typeof CopyButton> = {
  title: 'DataTable/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

// CopyButton is opacity-0 by default and only reveals itself on
// hover/group-hover/focus, since it's designed to live inside a `group`
// table cell. Storybook visitors aren't hovering a real row, so this story
// forces it visible with className="opacity-100". Click it — the component
// manages its own "copied" state internally (useState + a 1500ms timeout),
// swapping the icon to a check mark and back on its own.
export const Default: Story = {
  render: () => (
    <div className="flex w-fit items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
      <span className="font-mono text-[12px] text-[var(--text-secondary)]">WS-4F2D8A</span>
      <CopyButton text="WS-4F2D8A" title="Copy workspace ID" className="opacity-100" />
    </div>
  ),
};

// A more realistic placement: next to a row-style label/value pair, the way
// it appears attached to a workspace name or ID column in an actual table.
export const InlineWithLabel: Story = {
  render: () => (
    <div className="w-fit space-y-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <div className="flex items-center">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">Atlas Queue</span>
        <CopyButton text="Atlas Queue" title="Copy workspace name" className="opacity-100" />
      </div>
      <div className="flex items-center">
        <span className="font-mono text-[12px] text-[var(--text-tertiary)]">WS-4F2D8A</span>
        <CopyButton text="WS-4F2D8A" title="Copy workspace ID" className="opacity-100" />
      </div>
    </div>
  ),
};

// Hover-reveal behavior as it actually ships: the button stays invisible
// until the surrounding `group` container is hovered or the button itself
// receives focus (Tab). No opacity override here, so the interaction can be
// tried directly in the canvas.
export const HoverToReveal: Story = {
  render: () => (
    <div className="group flex w-fit items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
      <span className="font-mono text-[12px] text-[var(--text-secondary)]">WS-9C1E77</span>
      <CopyButton text="WS-9C1E77" title="Copy workspace ID" />
    </div>
  ),
};
