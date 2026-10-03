import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: { placeholder: 'Enter a value' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Placeholder: Story = {
  args: { placeholder: 'Search projects' },
};

export const Filled: Story = {
  args: { value: 'Acme Corp', readOnly: true },
};

export const Focused: Story = {
  args: {
    value: 'owner@northwind-labs.example',
    readOnly: true,
    className: 'border-[var(--border-focus)] ring-1 ring-[var(--border-focus)]',
  },
};

export const Disabled: Story = {
  args: { value: 'Field unavailable', disabled: true, readOnly: true },
};

export const ErrorState: Story = {
  args: { value: 'invalid@', error: true },
};
