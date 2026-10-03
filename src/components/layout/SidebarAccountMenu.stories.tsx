import { useState } from 'react';
import { useDemoTheme } from '../../stories/useDemoTheme';
import { PortalContainerContext } from '../../context/portal-container-context';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreditCard, Settings, Trash2, Users } from 'lucide-react';
import { SidebarAccountMenu } from './SidebarAccountMenu';
import type { AccountMenuItem, SidebarAccountMenuProps } from './SidebarAccountMenu';

const meta: Meta<typeof SidebarAccountMenu> = {
  title: 'Layout/SidebarAccountMenu',
  component: SidebarAccountMenu,
  tags: ['autodocs'],
  args: {
    name: 'Priya Natarajan',
    role: 'Workspace Admin',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarAccountMenu>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[240px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarAccountMenu {...args} />
    </div>
  ),
};

export const WithAvatar: Story = {
  args: {
    avatarUrl: 'https://i.pravatar.cc/64?img=47',
  },
  render: (args) => (
    <div className="w-[240px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarAccountMenu {...args} />
    </div>
  ),
};

export const Collapsed: Story = {
  args: {
    avatarUrl: 'https://i.pravatar.cc/64?img=47',
    collapsed: true,
  },
  render: (args) => (
    <div className="w-[56px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarAccountMenu {...args} />
    </div>
  ),
};

const demoMenuItems: AccountMenuItem[] = [
  { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
  { key: 'billing', label: 'Billing', icon: CreditCard, onClick: () => {} },
  { key: 'members', label: 'Manage members', icon: Users, onClick: () => {} },
  {
    key: 'delete',
    label: 'Delete workspace',
    icon: Trash2,
    variant: 'destructive',
    onClick: () => {},
  },
];

export const WithMenuItemsAndSignOut: Story = {
  args: {
    menuItems: demoMenuItems,
    onSignOut: () => {},
  },
  render: (args) => (
    <div className="w-[240px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <SidebarAccountMenu {...args} />
    </div>
  ),
};

function ThemeSwitchDemo(args: SidebarAccountMenuProps) {
  const [theme, setTheme] = useDemoTheme();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <div
      ref={setContainer}
      data-theme={theme}
      className="w-[240px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      <PortalContainerContext.Provider value={container}>
        <SidebarAccountMenu {...args} theme={theme} onThemeChange={setTheme} />
      </PortalContainerContext.Provider>
    </div>
  );
}

export const WithThemeSwitch: Story = {
  render: (args) => <ThemeSwitchDemo {...args} />,
};
