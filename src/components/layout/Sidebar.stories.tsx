import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BarChart3,
  FolderKanban,
  LayoutGrid,
  ListChecks,
  Settings,
  Users,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SidebarUser } from './SidebarUser';
import type { NavGroup } from './types';

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
      { key: 'projects', label: 'Projects', icon: FolderKanban, href: '/projects' },
      { key: 'tasks', label: 'Tasks', icon: ListChecks, href: '/tasks' },
    ],
  },
  {
    label: 'Data',
    items: [
      { key: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
      { key: 'customers', label: 'Customers', icon: Users, href: '/customers' },
    ],
  },
  {
    label: 'Admin',
    items: [{ key: 'settings', label: 'Settings', icon: Settings, href: '/settings' }],
  },
];

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => (
    <div className="flex h-[420px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-body)]">
      <Sidebar
        groups={NAV_GROUPS}
        activeKey="/projects"
        footer={<SidebarUser name="Jordan Ellis" />}
      />
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div className="flex h-[420px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-body)]">
      <Sidebar
        groups={NAV_GROUPS}
        activeKey="/projects"
        collapsed
        footer={<SidebarUser name="Jordan Ellis" collapsed />}
      />
    </div>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <div className="flex h-[420px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-body)]">
      <Sidebar
        groups={NAV_GROUPS}
        activeKey="/reports"
        header={
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            Northwind Labs
          </span>
        }
        footer={<SidebarUser name="Priya Kapoor" />}
      />
    </div>
  ),
};

function RouterAgnosticDemo() {
  const [activeKey, setActiveKey] = useState('/projects');

  return (
    <div className="flex h-[420px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-body)]">
      <Sidebar
        groups={NAV_GROUPS}
        activeKey={activeKey}
        footer={<SidebarUser name="Jordan Ellis" />}
        renderLink={(href, { className, children }) => (
          <button type="button" className={className} onClick={() => setActiveKey(href)}>
            {children}
          </button>
        )}
      />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Active key: <span className="font-medium text-[var(--text-secondary)]">{activeKey}</span>
        </p>
      </div>
    </div>
  );
}

export const RouterAgnosticLinks: Story = {
  render: () => <RouterAgnosticDemo />,
};
