import { useState } from "react";
import { useDemoTheme } from "../useDemoTheme";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Activity,
  ArrowDownCircle,
  ArrowLeftRight,
  Ban,
  Bell,
  Building2,
  ClipboardX,
  Database,
  Gavel,
  GitBranch,
  LayoutGrid,
  Percent,
  ScrollText,
  Server,
  Settings,
  ShieldAlert,
  Store,
  TrendingUp,
  UserX,
  Wallet,
  XOctagon,
} from "lucide-react";
import { AppShell } from "../../components/layout/AppShell";
import { SidebarAccountMenu } from "../../components/layout/SidebarAccountMenu";
import type { NavGroup } from "../../components/layout/types";
import { PortalContainerContext } from "../../context/portal-container-context";
import { MerchantsLiveRefactoredScreen } from "./merchants/MerchantsLiveRefactoredScreen";
import "./app.css";

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { key: "merchants", label: "Merchants", icon: Store, href: "/merchants" },
      { key: "transactions", label: "Transactions", icon: ArrowLeftRight, href: "/txs" },
      { key: "disputes", label: "Disputes", icon: Gavel, href: "/disputes" },
    ],
  },
  {
    label: "Finance",
    items: [
      { key: "balances", label: "Balances", icon: Wallet, href: "/balances" },
      {
        key: "top-up",
        label: "Balance Top-Up",
        icon: ArrowDownCircle,
        href: "/balance-top-up",
      },
      { key: "rates", label: "Rates", icon: TrendingUp, href: "/rates" },
    ],
  },
  {
    label: "Products",
    items: [
      { key: "widgets", label: "Widgets", icon: LayoutGrid, href: "/widgets" },
      { key: "counterparties", label: "Counterparties", icon: Building2, href: "/counterparties" },
      { key: "providers", label: "Providers", icon: Server, href: "/providers" },
    ],
  },
  {
    label: "Rules",
    items: [
      { key: "fees", label: "Fees", icon: Percent, href: "/fees" },
      { key: "routing", label: "Routing Rule", icon: GitBranch, href: "/routing" },
      { key: "payout-accounts", label: "Payout Accounts", icon: Database, href: "/payout-accounts" },
    ],
  },
  {
    label: "Governance",
    items: [
      { key: "antifraud", label: "Antifraud Events", icon: ShieldAlert, href: "/antifraud-events" },
      { key: "spam-blocks", label: "Client Spam Blocks", icon: Ban, href: "/client-spam-blocks" },
      {
        key: "wr-ban",
        label: "Widget Account Ban",
        icon: XOctagon,
        href: "/widget-account-ban",
      },
      {
        key: "score-ban-req",
        label: "Scoring Ban Accounts",
        icon: ClipboardX,
        href: "/scoring-ban-accounts",
      },
      {
        key: "score-ban-mc",
        label: "Scoring Ban Clients",
        icon: UserX,
        href: "/scoring-ban-merchant-clients",
      },
    ],
  },
  {
    label: "System",
    items: [
      { key: "settings", label: "Settings", icon: Settings, href: "/settings" },
      {
        key: "notifications",
        label: "Notifications Channel",
        icon: Bell,
        href: "/notifications-channel",
      },
      { key: "logs", label: "Logs", icon: ScrollText, href: "/logs" },
      { key: "liquidity", label: "Liquidity Check", icon: Activity, href: "/liquidity-check" },
    ],
  },
];

const meta: Meta<typeof AppShell> = {
  title: "Pages/Merchants",
  component: AppShell,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

function MerchantsPageDemo() {
  const [theme, setTheme] = useDemoTheme();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <div ref={setContainer} data-theme={theme} className="h-full">
      <PortalContainerContext.Provider value={container}>
        <AppShell defaultCollapsed={false}>
          <AppShell.Sidebar
            groups={NAV_GROUPS}
            activeKey="/merchants"
            renderLink={(_href, props) => (
              <button type="button" className={props.className}>
                {props.children}
              </button>
            )}
            header={
              <SidebarAccountMenu
                name="Sam Rockwell"
                role="Platform Admin"
                theme={theme}
                onThemeChange={setTheme}
                menuItems={[{ key: "settings", label: "Settings", icon: Settings, onClick: () => {} }]}
                onSignOut={() => {}}
              />
            }
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AppShell.Content>
              <MerchantsLiveRefactoredScreen />
            </AppShell.Content>
          </div>
        </AppShell>
      </PortalContainerContext.Provider>
    </div>
  );
}

export const Default: Story = {
  render: () => <MerchantsPageDemo />,
};
