import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonFooter } from './button-footer';
import { Button } from './button';

const meta: Meta<typeof ButtonFooter> = {
  title: 'UI/ButtonFooter',
  component: ButtonFooter,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
  args: {
    children: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof ButtonFooter>;

export const Default: Story = {};

export const PopoverSize: Story = {
  render: () => (
    <div className="w-full max-w-xs overflow-hidden rounded-md border border-[var(--border-subtle)]">
      <ButtonFooter className="px-3 py-2.5">
        <Button variant="secondary" size="sm">
          Clear
        </Button>
        <Button size="sm">Apply</Button>
      </ButtonFooter>
    </div>
  ),
};

export const DialogSize: Story = {
  render: () => (
    <div className="w-full max-w-sm rounded-md border border-[var(--border-subtle)] px-6 pb-6 pt-4">
      <p className="mb-2 text-[13px] text-[var(--text-secondary)]">
        Configure a new workspace named &ldquo;Northwind Labs&rdquo;.
      </p>
      <ButtonFooter className="-mx-6 px-6 pt-4 mt-4">
        <Button variant="secondary">Cancel</Button>
        <Button>Save Workspace</Button>
      </ButtonFooter>
    </div>
  ),
};
