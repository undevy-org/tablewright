import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';
import { Button } from './button';
import { ButtonFooter } from './button-footer';
import { Input } from './input';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="dialog-default-name"
              className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted-strong)]"
            >
              Name
            </label>
            <Input id="dialog-default-name" defaultValue="Jane Cooper" />
          </div>
          <div>
            <label
              htmlFor="dialog-default-username"
              className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted-strong)]"
            >
              Username
            </label>
            <Input id="dialog-default-username" defaultValue="jcooper" />
          </div>
        </div>

        <ButtonFooter className="-mx-6 px-6 pt-4 mt-4">
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button">Save changes</Button>
        </ButtonFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithFormFields: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Set a name and choose which environments this project should target.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted-strong)]">
              Project name
            </label>
            <Input placeholder="My project" />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted-strong)]">
              Environments
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Development', checked: true },
                { label: 'Staging', checked: true },
                { label: 'Production', checked: false },
              ].map((item) => (
                <label
                  key={item.label}
                  className="inline-flex items-center gap-2 text-[13px] text-[var(--text-primary)]"
                >
                  <Checkbox checked={item.checked} aria-label={item.label} />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <ButtonFooter className="-mx-6 px-6 pt-4 mt-4">
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button">Create</Button>
        </ButtonFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Simple: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Show info</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Heads up</DialogTitle>
          <DialogDescription>
            This is a minimal dialog composed from just a title and a description, with no
            footer or form content.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
