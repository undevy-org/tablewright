import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeSwitch, type ThemeSwitchProps } from './theme-switch';

type ThemeValue = ThemeSwitchProps['value'];

const meta: Meta<typeof ThemeSwitch> = {
  title: 'UI/ThemeSwitch',
  component: ThemeSwitch,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['toolbar', 'icon'] },
    label: { control: 'text' },
  },
  args: { variant: 'toolbar', label: 'Theme' },
};

export default meta;
type Story = StoryObj<typeof ThemeSwitch>;

// ThemeSwitch is a fully controlled component (no internal state, no
// defaultValue-style prop): the active segment is whatever `value` says it
// is, and it only ever changes via `onValueChange`. Rendering it with plain
// static args would make it inert in the Storybook canvas — clicking the
// other segment would call the (unset) callback and nothing would visibly
// change. This local demo wrapper owns the toggled state so each story is
// actually interactive.
function ThemeSwitchDemo({
  variant,
  label,
  initialValue,
}: {
  variant?: ThemeSwitchProps['variant'];
  label?: string;
  initialValue: ThemeValue;
}) {
  const [value, setValue] = React.useState<ThemeValue>(initialValue);
  return <ThemeSwitch value={value} onValueChange={setValue} variant={variant} label={label} />;
}

export const Default: Story = {
  render: (args) => (
    <ThemeSwitchDemo variant={args.variant} label={args.label} initialValue="light" />
  ),
};

export const DarkSelected: Story = {
  render: (args) => (
    <ThemeSwitchDemo variant={args.variant} label={args.label} initialValue="dark" />
  ),
};

export const Icon: Story = {
  args: { variant: 'icon' },
  render: (args) => (
    <ThemeSwitchDemo variant={args.variant} label={args.label} initialValue="light" />
  ),
};

export const IconDarkSelected: Story = {
  args: { variant: 'icon' },
  render: (args) => (
    <ThemeSwitchDemo variant={args.variant} label={args.label} initialValue="dark" />
  ),
};

// Link mode: when both hrefs are supplied, the component navigates instead
// of calling onValueChange, so this story stays a plain static render (the
// hrefs are placeholder in-page anchors, not real routes).
export const LinkMode: Story = {
  render: (args) => (
    <ThemeSwitch
      value="light"
      variant={args.variant}
      label={args.label}
      lightHref="#light"
      darkHref="#dark"
    />
  ),
};
