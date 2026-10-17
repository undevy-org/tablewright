import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { Button } from './button';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">Hover for details</Button>
      </TooltipTrigger>
      <TooltipContent>Short explanation for the control.</TooltipContent>
    </Tooltip>
  ),
};

export const Top: Story = {
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">Top placement</Button>
      </TooltipTrigger>
      <TooltipContent side="top">Tooltip opens above the trigger.</TooltipContent>
    </Tooltip>
  ),
};

export const Right: Story = {
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">Right placement</Button>
      </TooltipTrigger>
      <TooltipContent side="right">Tooltip opens to the right.</TooltipContent>
    </Tooltip>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">Bottom placement</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Tooltip opens below the trigger.</TooltipContent>
    </Tooltip>
  ),
};

export const Left: Story = {
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">Left placement</Button>
      </TooltipTrigger>
      <TooltipContent side="left">Tooltip opens to the left.</TooltipContent>
    </Tooltip>
  ),
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">Dark theme</Button>
      </TooltipTrigger>
      <TooltipContent>Tooltip tokens in dark mode.</TooltipContent>
    </Tooltip>
  ),
};
