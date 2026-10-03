import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, FileDown, Landmark, Radio, RefreshCw, Shield, ShieldAlert, Split, Wallet } from 'lucide-react';
import { RowActionsMenu } from './RowActionsMenu';
import type { RowActionItem, RowActionSection } from './types';

const meta: Meta<typeof RowActionsMenu> = {
  title: 'DataTable/RowActionsMenu',
  component: RowActionsMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RowActionsMenu>;

const groupedSections: RowActionSection[] = [
  {
    label: 'Automation',
    actions: [
      { label: 'Create Flow', icon: Split, onClick: () => undefined },
      { label: 'Wallet Links', icon: Wallet, onClick: () => undefined },
      { label: 'Live Sessions', icon: Radio, onClick: () => undefined },
    ],
  },
  {
    label: 'Access & Review',
    actions: [
      { label: 'Permissions', icon: Shield, onClick: () => undefined },
      {
        label: 'Security Review',
        icon: ShieldAlert,
        onClick: () => undefined,
        variant: 'danger',
      },
    ],
  },
];

const flatActions: RowActionItem[] = [
  { label: 'Refresh Status', icon: RefreshCw, onClick: () => undefined },
  { label: 'Export CSV', icon: FileDown, onClick: () => undefined },
  { label: 'Duplicate Row', icon: Copy, onClick: () => undefined },
];

const reviewSections: RowActionSection[] = [
  {
    label: 'Operations',
    actions: [
      { label: 'Routing Rules', icon: Landmark, onClick: () => undefined },
      {
        label: 'Export CSV',
        icon: Copy,
        onClick: () => undefined,
        variant: 'accent',
      },
    ],
  },
  {
    label: 'Danger Zone',
    actions: [
      {
        label: 'Security Review',
        icon: ShieldAlert,
        onClick: () => undefined,
        variant: 'danger',
      },
    ],
  },
];

function RowPreview({
  name,
  workspaceId,
  children,
}: {
  name: string;
  workspaceId: string;
  children: ReactNode;
}) {
  return (
    <div className="group flex w-[320px] items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{name}</p>
        <p className="text-[11px] text-[var(--text-muted-strong)]">{workspaceId}</p>
      </div>
      {children}
    </div>
  );
}

export const Grouped: Story = {
  render: () => (
    <RowPreview name="Atlas Queue" workspaceId="WS-4F2D8A">
      <RowActionsMenu sections={groupedSections} triggerClassName="opacity-100" />
    </RowPreview>
  ),
};

export const Ungrouped: Story = {
  render: () => (
    <RowPreview name="Orbit Ledger" workspaceId="WS-19C3E7">
      <RowActionsMenu actions={flatActions} triggerClassName="opacity-100" />
    </RowPreview>
  ),
};

export const DangerAndAccentActions: Story = {
  render: () => (
    <RowPreview name="Signal Relay" workspaceId="WS-7B1A02">
      <RowActionsMenu sections={reviewSections} triggerClassName="opacity-100" />
    </RowPreview>
  ),
};
