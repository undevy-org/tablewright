import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-semibold">Popover title</h4>
          <p className="text-[13px] text-[var(--text-secondary)]">
            This is the content of the popover. It can contain rich UI such as forms, pickers, or
            filters.
          </p>
          <div className="mt-2 flex justify-end">
            <Button size="sm">Action</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignStart: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Align start</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="text-[13px] text-[var(--text-secondary)]">
          This popover aligns its start edge with the trigger's start edge.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Align end</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <p className="text-[13px] text-[var(--text-secondary)]">
          This popover aligns its end edge with the trigger's end edge.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const Open: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-[13px] text-[var(--text-secondary)]">
          This popover is open by default for visual review in Storybook.
        </p>
      </PopoverContent>
    </Popover>
  ),
};
