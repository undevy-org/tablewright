import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarUser } from './SidebarUser';

const meta: Meta<typeof SidebarUser> = {
  title: 'Layout/SidebarUser',
  component: SidebarUser,
  tags: ['autodocs'],
  args: {
    name: 'Demo User',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarUser>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[240px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarUser {...args} />
    </div>
  ),
};

export const WithAvatar: Story = {
  args: {
    name: 'Priya Natarajan',
    avatarUrl: 'https://i.pravatar.cc/64?img=47',
  },
  render: (args) => (
    <div className="w-[240px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarUser {...args} />
    </div>
  ),
};

export const Collapsed: Story = {
  args: {
    name: 'Priya Natarajan',
    avatarUrl: 'https://i.pravatar.cc/64?img=47',
    collapsed: true,
  },
  render: (args) => (
    <div className="w-[56px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarUser {...args} />
    </div>
  ),
};

export const CollapsedInitialsOnly: Story = {
  args: {
    name: 'Atlas Queue',
    collapsed: true,
  },
  render: (args) => (
    <div className="w-[56px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarUser {...args} />
    </div>
  ),
};
