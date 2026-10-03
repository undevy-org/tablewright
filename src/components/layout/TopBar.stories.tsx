import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Plus } from 'lucide-react';
import { TopBar } from './TopBar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const meta: Meta<typeof TopBar> = {
  title: 'Layout/TopBar',
  component: TopBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopBar>;

export const Default: Story = {
  render: () => (
    <div className="w-[720px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]">
      <TopBar>
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Dashboard</h1>
      </TopBar>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="w-[720px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]">
      <TopBar
        actions={
          <Button size="sm" variant="secondary">
            Export
          </Button>
        }
      >
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Merchants</h1>
      </TopBar>
    </div>
  ),
};

export const WithMultipleActions: Story = {
  render: () => (
    <div className="w-[720px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]">
      <TopBar
        actions={
          <>
            <Button size="sm" variant="secondary">
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="size-4" />
              New merchant
            </Button>
          </>
        }
      >
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Merchants</h1>
      </TopBar>
    </div>
  ),
};

export const WithStatusBadge: Story = {
  render: () => (
    <div className="w-[720px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]">
      <TopBar
        actions={
          <Button size="sm" variant="secondary">
            Export
          </Button>
        }
      >
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-[18px] font-semibold text-[var(--text-primary)]">
            Northwind Labs
          </h1>
          <Badge variant="success">Active</Badge>
        </div>
      </TopBar>
    </div>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <div className="w-[480px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]">
      <TopBar>
        <h1 className="truncate text-[18px] font-semibold text-[var(--text-primary)]">
          Settings
        </h1>
      </TopBar>
    </div>
  ),
};

export const NarrowWithTruncation: Story = {
  render: () => (
    <div className="w-[320px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]">
      <TopBar
        actions={
          <Button size="sm" variant="secondary">
            <Plus className="size-4" />
          </Button>
        }
      >
        <h1 className="truncate text-[18px] font-semibold text-[var(--text-primary)]">
          Quarterly Counterparty Reconciliation Report
        </h1>
      </TopBar>
    </div>
  ),
};
