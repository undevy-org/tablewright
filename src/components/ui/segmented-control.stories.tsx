import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, LayoutGrid } from 'lucide-react';
import { SegmentedControl } from './segmented-control';

type ViewMode = 'list' | 'grid';
type Period = 'day' | 'week' | 'month';

const viewOptions = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
] as const;

const viewIconOptions = [
  { value: 'list', icon: List, ariaLabel: 'List view' },
  { value: 'grid', icon: LayoutGrid, ariaLabel: 'Grid view' },
] as const;

const periodOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
] as const;

const meta: Meta<typeof SegmentedControl> = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: () => {
    function ViewModeDemo() {
      const [value, setValue] = React.useState<ViewMode>('list');
      return (
        <SegmentedControl
          value={value}
          options={viewOptions}
          onValueChange={setValue}
          variant="toolbar"
        />
      );
    }

    return <ViewModeDemo />;
  },
};

export const ThreeSegments: Story = {
  render: () => {
    function PeriodDemo() {
      const [value, setValue] = React.useState<Period>('week');
      return (
        <SegmentedControl
          value={value}
          options={periodOptions}
          onValueChange={setValue}
          variant="toolbar"
        />
      );
    }

    return <PeriodDemo />;
  },
};

export const IconOnly: Story = {
  render: () => {
    function IconOnlyDemo() {
      const [value, setValue] = React.useState<ViewMode>('list');
      return (
        <SegmentedControl
          value={value}
          options={viewIconOptions}
          onValueChange={setValue}
          variant="toolbar"
          label="View mode"
        />
      );
    }

    return <IconOnlyDemo />;
  },
};

export const WithAccessibleLabel: Story = {
  render: () => {
    function LabeledDemo() {
      const [value, setValue] = React.useState<ViewMode>('grid');
      return (
        <SegmentedControl
          value={value}
          options={viewOptions}
          onValueChange={setValue}
          variant="toolbar"
          label="View mode"
        />
      );
    }

    return <LabeledDemo />;
  },
};
