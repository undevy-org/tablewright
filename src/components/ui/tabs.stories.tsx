import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const tabs = ['Overview', 'Activity', 'Settings'] as const;

const countedTabs = [
  { label: 'Overview', count: 24 },
  { label: 'Activity', count: 8 },
  { label: 'Settings', count: 3 },
] as const;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="Overview" className="w-full max-w-md">
      <TabsList className="w-full justify-start">
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab} value={tab} className="p-4 text-[13px] text-[var(--text-secondary)]">
          Content for {tab}
        </TabsContent>
      ))}
    </Tabs>
  ),
};

export const SecondTabActive: Story = {
  render: () => (
    <Tabs defaultValue="Activity" className="w-full max-w-md">
      <TabsList className="w-full justify-start">
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab} value={tab} className="p-4 text-[13px] text-[var(--text-secondary)]">
          Content for {tab}
        </TabsContent>
      ))}
    </Tabs>
  ),
};

export const WithCounts: Story = {
  render: () => (
    <Tabs defaultValue="Overview" className="w-full max-w-md">
      <TabsList className="w-full justify-start">
        {countedTabs.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.label} count={tab.count}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {countedTabs.map((tab) => (
        <TabsContent
          key={tab.label}
          value={tab.label}
          className="p-4 text-[13px] text-[var(--text-secondary)]"
        >
          Content for {tab.label}
        </TabsContent>
      ))}
    </Tabs>
  ),
};

export const WithCountsSecondActive: Story = {
  render: () => (
    <Tabs defaultValue="Activity" className="w-full max-w-md">
      <TabsList className="w-full justify-start">
        {countedTabs.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.label} count={tab.count}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {countedTabs.map((tab) => (
        <TabsContent
          key={tab.label}
          value={tab.label}
          className="p-4 text-[13px] text-[var(--text-secondary)]"
        >
          Content for {tab.label}
        </TabsContent>
      ))}
    </Tabs>
  ),
};
