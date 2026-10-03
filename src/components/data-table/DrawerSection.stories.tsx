import type { Meta, StoryObj } from '@storybook/react-vite';
import { DrawerSection } from './DrawerSection';
import { DrawerField } from './DrawerField';
import { Badge } from '../ui/badge';

const meta: Meta<typeof DrawerSection> = {
  title: 'DataTable/DrawerSection',
  component: DrawerSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DrawerSection>;

export const Default: Story = {
  render: () => (
    <div className="w-[320px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <DrawerSection title="Overview" className="mb-0">
        <DrawerField label="Name" value="Atlas Queue" />
        <DrawerField label="ID" value="WS-4F2D8A" />
        <DrawerField
          label="Status"
          value={
            <Badge variant="success" className="w-fit gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              ACTIVE
            </Badge>
          }
        />
        <DrawerField label="Tier" value="Standard" />
      </DrawerSection>
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="w-[520px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5">
      <div className="grid grid-cols-2 gap-3">
        <DrawerSection title="Overview" card>
          <DrawerField label="Name" value="Atlas Queue" />
          <DrawerField label="ID" value="WS-4F2D8A" />
        </DrawerSection>
        <DrawerSection title="Routing" card>
          <DrawerField label="Ledger" value="Orbit Ledger" />
          <DrawerField label="Relay" value="Signal Relay" />
        </DrawerSection>
      </div>
    </div>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <div className="w-[320px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <DrawerSection title="Overview">
        <DrawerField label="Name" value="Atlas Queue" />
        <DrawerField label="ID" value="WS-4F2D8A" />
        <DrawerField
          label="Status"
          value={
            <Badge variant="success" className="w-fit gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              ACTIVE
            </Badge>
          }
        />
        <DrawerField label="Tier" value="Standard" />
      </DrawerSection>
      <DrawerSection title="Routing" className="mb-0">
        <DrawerField label="Ledger" value="Orbit Ledger" />
        <DrawerField label="Relay" value="Signal Relay" />
        <DrawerField label="Owner" value="Northwind Labs" />
      </DrawerSection>
    </div>
  ),
};
