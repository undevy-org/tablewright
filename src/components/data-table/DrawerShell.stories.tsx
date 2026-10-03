import type { Meta, StoryObj } from '@storybook/react-vite';
import { DrawerShell } from './DrawerShell';
import { DrawerSection } from './DrawerSection';
import { DrawerField } from './DrawerField';
import { Badge } from '../ui/badge';

const meta: Meta<typeof DrawerShell> = {
  title: 'DataTable/DrawerShell',
  component: DrawerShell,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DrawerShell>;

function DrawerShellDemo({ open }: { open: boolean }) {
  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-[var(--border-subtle)]">
      <DrawerShell
        open={open}
        onClose={() => {}}
        title="Atlas Queue"
        subtitle="WS-4F2D8A"
        headerExtra={<Badge variant="success">ACTIVE</Badge>}
      >
        <DrawerSection title="Overview">
          <DrawerField label="Name" value="Atlas Queue" />
          <DrawerField label="ID" value="WS-4F2D8A" />
          <DrawerField label="Status" value={<Badge variant="success">ACTIVE</Badge>} />
        </DrawerSection>
        <DrawerSection title="Details">
          <DrawerField label="Owner" value="Northwind Labs" />
          <DrawerField label="Linked ledger" value="Orbit Ledger" />
          <DrawerField label="Relay" value="Signal Relay" />
        </DrawerSection>
      </DrawerShell>
    </div>
  );
}

export const Open: Story = {
  render: () => <DrawerShellDemo open={true} />,
};

export const Closed: Story = {
  render: () => <DrawerShellDemo open={false} />,
};
