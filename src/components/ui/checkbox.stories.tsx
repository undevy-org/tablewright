import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'select', options: [false, true, 'indeterminate'] },
  },
  args: {
    disabled: false,
    'aria-label': 'Accept terms and conditions',
  },
  render: (args) => (
    <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
      <Checkbox {...args} />
      Accept terms and conditions
    </label>
  ),
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { defaultChecked: 'indeterminate' } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const DisabledIndeterminate: Story = {
  args: { disabled: true, defaultChecked: 'indeterminate' },
};
