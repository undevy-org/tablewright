import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyableText } from './CopyableText';

const meta: Meta<typeof CopyableText> = {
  title: 'DataTable/CopyableText',
  component: CopyableText,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CopyableText>;

// CopyableText wraps its own "group/copy" span internally, so the paired
// CopyButton already reveals on hover/focus of the whole component — no
// external `group` wrapper needed, unlike the bare CopyButton story. Storybook
// visitors aren't hovering a real row though, so buttonClassName="opacity-100"
// keeps both buttons visible here for readability, the same call the sibling
// CopyButton story makes for its Default export.
export const Default: Story = {
  render: () => (
    <div className="w-[280px] space-y-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <CopyableText
        value="Atlas Queue"
        title="Copy workspace name"
        textClassName="font-semibold text-[var(--text-primary)]"
        buttonClassName="opacity-100"
      />
      <CopyableText
        value="WS-4F2D8A"
        title="Copy workspace ID"
        textClassName="font-mono text-[11px] text-[var(--text-secondary)]"
        buttonClassName="opacity-100"
      />
    </div>
  ),
};

// `children ?? value` lets a caller render richer or formatted content while
// the button underneath still copies the plain, unformatted value.
export const WithCustomChildren: Story = {
  render: () => (
    <div className="w-[280px] space-y-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <CopyableText
        value="WS-4F2D8A"
        title="Copy workspace ID"
        textClassName="font-mono text-[11px] text-[var(--text-secondary)]"
        buttonClassName="opacity-100"
      >
        <span>
          WS-<span className="font-semibold text-[var(--text-primary)]">4F2D8A</span>
        </span>
      </CopyableText>
      <CopyableText
        value="WS-9C1E77"
        title="Copy workspace ID"
        textClassName="text-[11px]"
        buttonClassName="opacity-100"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tag-green-text)]" />
          <span className="font-mono text-[var(--text-secondary)]">WS-9C1E77</span>
        </span>
      </CopyableText>
    </div>
  ),
};
