import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RowControlCell, RowControlHeader } from './RowControlCell';

function DemoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      {children}
    </div>
  );
}

function RowControlCellDemo({
  label,
  rowNumber,
  workspace,
  initialSelected = false,
  forceControlsVisible = false,
}: {
  label: string;
  rowNumber: number;
  workspace: string;
  initialSelected?: boolean;
  forceControlsVisible?: boolean;
}) {
  const [selected, setSelected] = React.useState(initialSelected);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <DemoFrame>
      <p className="text-[12px] font-semibold text-[var(--text-primary)]">{label}</p>
      {/* Real usage lives inside a <tr className="group"> in DataTableShell — the
          hover-reveal affordances (drag handle, expand button, select checkbox)
          are gated on that ancestor's `group` class via `group-hover:*`. */}
      <div className="group flex h-11 w-[var(--size-row-control)] items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-1">
        <RowControlCell
          rowNumber={rowNumber}
          selected={selected}
          onSelectToggle={() => setSelected((value) => !value)}
          onExpandToggle={() => setExpanded((value) => !value)}
          forceControlsVisible={forceControlsVisible}
        />
      </div>
      <span className="text-[11px] text-[var(--text-muted-strong)]">
        {workspace} · {selected ? 'selected' : 'not selected'} · expanded:{' '}
        {expanded ? 'yes' : 'no'}
      </span>
    </DemoFrame>
  );
}

const meta: Meta<typeof RowControlCell> = {
  title: 'DataTable/RowControlCell',
  component: RowControlCell,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RowControlCell>;

export const Default: Story = {
  render: () => <RowControlCellDemo label="Default" rowNumber={12} workspace="Atlas Queue" />,
};

export const Selected: Story = {
  render: () => (
    <RowControlCellDemo
      label="Selected"
      rowNumber={7}
      workspace="Orbit Ledger"
      initialSelected
    />
  ),
};

export const ForceVisible: Story = {
  render: () => (
    <RowControlCellDemo
      label="Force visible (hover affordances shown without a live hover)"
      rowNumber={4}
      workspace="Signal Relay"
      forceControlsVisible
    />
  ),
};

// ─── RowControlHeader ───────────────────────────────────────────────────
// RowControlHeader is exported from this same file (src/index.ts re-exports
// both from ./components/data-table/RowControlCell) and is the select-all
// checkbox that sits in the column header above a stack of RowControlCells.
// It diverges from the meta's `component` on purpose — CSF3 allows a story's
// own `render` to cover a closely related export instead of re-declaring a
// second meta block.

function RowControlHeaderDemo({
  label,
  initialChecked,
}: {
  label: string;
  initialChecked: boolean | 'indeterminate';
}) {
  const [checked, setChecked] = React.useState<boolean | 'indeterminate'>(initialChecked);

  return (
    <DemoFrame>
      <p className="text-[12px] font-semibold text-[var(--text-primary)]">{label}</p>
      <div className="flex h-11 w-[var(--size-row-control)] items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-1">
        <RowControlHeader
          checked={checked}
          onToggle={() => setChecked((value) => (value === true ? false : true))}
        />
      </div>
      <span className="text-[11px] text-[var(--text-muted-strong)]">
        checked: {String(checked)}
      </span>
    </DemoFrame>
  );
}

export const HeaderUnchecked: Story = {
  render: () => <RowControlHeaderDemo label="Header — none selected" initialChecked={false} />,
};

export const HeaderIndeterminate: Story = {
  render: () => (
    <RowControlHeaderDemo label="Header — some rows selected" initialChecked="indeterminate" />
  ),
};

export const HeaderChecked: Story = {
  render: () => <RowControlHeaderDemo label="Header — all rows selected" initialChecked={true} />,
};
