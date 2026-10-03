import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['default', 'sm', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Button', variant: 'default', size: 'default' },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Small: Story = { args: { size: 'sm' } };
export const IconOnly: Story = { args: { size: 'icon', children: '★' } };
export const Disabled: Story = { args: { disabled: true } };
