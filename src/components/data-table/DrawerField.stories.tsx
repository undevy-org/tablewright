import type { Meta, StoryObj } from '@storybook/react-vite';
import { DrawerField } from './DrawerField';
import { Badge } from '../ui/badge';

const meta: Meta<typeof DrawerField> = {
  title: 'DataTable/DrawerField',
  component: DrawerField,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DrawerField>;

export const Default: Story = {
  render: () => (
    <div className="w-[280px] space-y-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <DrawerField label="Name" value="Atlas Queue" />
      <DrawerField label="ID" value="WS-4F2D8A" />
      <DrawerField label="Status" value="ACTIVE" />
      <DrawerField label="Tier" value="Standard" />
    </div>
  ),
};

export const WithRichValue: Story = {
  render: () => (
    <div className="w-[280px] space-y-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <DrawerField
        label="Status"
        value={
          <Badge variant="success" className="w-fit gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Success
          </Badge>
        }
      />
      <DrawerField
        label="Workspace"
        value={<span className="font-medium text-[var(--text-primary)]">Orbit Ledger</span>}
      />
      <DrawerField
        label="Relay"
        value={<span className="font-medium text-[var(--text-primary)]">Signal Relay</span>}
      />
    </div>
  ),
};

export const WithChildren: Story = {
  render: () => (
    <div className="w-[280px] space-y-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <DrawerField label="Name">Atlas Queue</DrawerField>
      <DrawerField label="Status">
        <Badge variant="success" className="w-fit gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Success
        </Badge>
      </DrawerField>
    </div>
  ),
};

export const Single: Story = {
  render: () => (
    <div className="w-[280px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <DrawerField label="Tier" value="Standard" />
    </div>
  ),
};
