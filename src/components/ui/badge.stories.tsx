import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'danger', 'info', 'neutral', 'purple', 'sky', 'indigo'],
    },
  },
  args: { children: 'Badge', variant: 'neutral' },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {};
export const Success: Story = { args: { variant: 'success' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const Danger: Story = { args: { variant: 'danger' } };
export const Info: Story = { args: { variant: 'info' } };
export const Purple: Story = { args: { variant: 'purple' } };
export const Sky: Story = { args: { variant: 'sky' } };
export const Indigo: Story = { args: { variant: 'indigo' } };
