import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReportSummaryCard } from './ReportSummaryCard';

const meta: Meta<typeof ReportSummaryCard> = {
  title: 'Dashboard/ReportSummaryCard',
  component: ReportSummaryCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportSummaryCard>;

export const Default: Story = {
  args: {
    title: 'Transactions',
    count: 128,
    endpoint: 'GET /api/reports/transactions',
    topActions: ['Export CSV', 'Schedule report'],
    filterNames: ['Date range', 'Status'],
    columns: ['Workspace', 'Amount', 'Status', 'Updated'],
    sampleRows: [
      { title: 'Atlas Queue', values: ['$12,400.00', 'Settled', '12.02.2026'] },
      { title: 'Orbit Ledger', values: ['$3,150.00', 'Pending', '06.03.2026'] },
    ],
  },
};

export const NoCount: Story = {
  args: {
    ...Default.args,
    count: undefined,
  },
};

export const EmptySampleRows: Story = {
  args: {
    ...Default.args,
    sampleRows: [],
    emptyStateMessage: 'No transactions matched the current filters.',
  },
};

export const NoTopActionsOrFilters: Story = {
  args: {
    ...Default.args,
    topActions: [],
    filterNames: [],
  },
};

export const WithNotes: Story = {
  args: {
    ...Default.args,
    notes: [
      'Amounts are shown in USD and refreshed hourly.',
      'Pending rows settle automatically after 3 business days.',
    ],
  },
};
