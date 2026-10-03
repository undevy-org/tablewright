import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithGroup: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>Cut</DropdownMenuItem>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuItem>Paste</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: () => {
    function CheckboxMenu() {
      const [showToolbar, setShowToolbar] = React.useState(true);
      const [showSidebar, setShowSidebar] = React.useState(false);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">View options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={showToolbar}
              onCheckedChange={setShowToolbar}
            >
              Show toolbar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showSidebar}
              onCheckedChange={setShowSidebar}
            >
              Show sidebar
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return <CheckboxMenu />;
  },
};

export const Open: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
