import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutGrid, FolderKanban, Receipt, Wallet, Users, Settings } from 'lucide-react';
import { AppShell } from './AppShell';
import { SidebarAccountMenu } from './SidebarAccountMenu';
import { Button } from '../ui/button';
import type { NavGroup } from './types';

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { key: 'overview', label: 'Overview', icon: LayoutGrid, href: '#overview' },
      { key: 'projects', label: 'Projects', icon: FolderKanban, href: '#projects' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { key: 'invoices', label: 'Invoices', icon: Receipt, href: '#invoices' },
      { key: 'payouts', label: 'Payouts', icon: Wallet, href: '#payouts' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { key: 'team', label: 'Team', icon: Users, href: '#team' },
      { key: 'settings', label: 'Settings', icon: Settings, href: '#settings' },
    ],
  },
];

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  render: () => (
    <div
      className="w-full max-w-[960px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]"
      style={{ height: 600 }}
    >
      <AppShell>
        <AppShell.Sidebar
          groups={NAV_GROUPS}
          activeKey="#projects"
          header={
            <SidebarAccountMenu
              name="Priya Natarajan"
              role="Admin"
              avatarUrl="https://i.pravatar.cc/64?img=47"
              menuItems={[
                { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
              ]}
              onSignOut={() => {}}
            />
          }
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppShell.Header
            actions={
              <Button size="sm" variant="secondary">
                Export
              </Button>
            }
          >
            <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Projects</h1>
          </AppShell.Header>

          <AppShell.Content className="bg-[var(--bg-surface-muted)]">
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-[var(--text-tertiary)]">Page content area</p>
            </div>
          </AppShell.Content>
        </div>
      </AppShell>
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div
      className="w-full max-w-[960px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]"
      style={{ height: 600 }}
    >
      <AppShell defaultCollapsed>
        <AppShell.Sidebar
          groups={NAV_GROUPS}
          activeKey="#projects"
          header={
            <SidebarAccountMenu
              name="Priya Natarajan"
              role="Admin"
              avatarUrl="https://i.pravatar.cc/64?img=47"
              menuItems={[
                { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
              ]}
              onSignOut={() => {}}
            />
          }
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppShell.Header
            actions={
              <Button size="sm" variant="secondary">
                Export
              </Button>
            }
          >
            <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Projects</h1>
          </AppShell.Header>

          <AppShell.Content className="bg-[var(--bg-surface-muted)]">
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-[var(--text-tertiary)]">Page content area</p>
            </div>
          </AppShell.Content>
        </div>
      </AppShell>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeKey, setActiveKey] = useState('#projects');
    const activeLabel =
      NAV_GROUPS.flatMap((g) => g.items).find((i) => i.href === activeKey)?.label ?? 'Overview';

    return (
      <div className="w-full max-w-[960px] space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </Button>
          <span className="text-[12px] text-[var(--text-tertiary)]">
            or press{' '}
            <kbd className="rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] font-medium">
              Cmd+B
            </kbd>
          </span>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] [box-shadow:var(--shadow-card)]"
          style={{ height: 600 }}
        >
          <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed}>
            <AppShell.Sidebar
              groups={NAV_GROUPS}
              activeKey={activeKey}
              header={
                <SidebarAccountMenu
                  name="Priya Natarajan"
                  role="Admin"
                  avatarUrl="https://i.pravatar.cc/64?img=47"
                  menuItems={[
                    { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
                  ]}
                  onSignOut={() => {}}
                />
              }
              renderLink={(href, { className, children }) => (
                <button
                  type="button"
                  className={className}
                  onClick={() => setActiveKey(href)}
                >
                  {children}
                </button>
              )}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <AppShell.Header
                actions={
                  <Button size="sm" variant="secondary">
                    Export
                  </Button>
                }
              >
                <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">
                  {activeLabel}
                </h1>
              </AppShell.Header>

              <AppShell.Content className="bg-[var(--bg-surface-muted)]">
                <div className="flex h-full items-center justify-center">
                  <p className="text-[13px] text-[var(--text-tertiary)]">Page content area</p>
                </div>
              </AppShell.Content>
            </div>
          </AppShell>
        </div>
      </div>
    );
  },
};
