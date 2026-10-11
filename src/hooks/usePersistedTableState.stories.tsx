import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../components/ui/button";
import { usePersistedTableState } from "./usePersistedTableState";

const meta: Meta = {
  title: "DataTable/PersistedTableState",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

function PersistedStateDemo() {
  const [mountKey, setMountKey] = useState(0);

  return (
    <div className="flex flex-col gap-4 p-6 min-w-[320px]">
      <p className="text-sm text-muted-foreground">
        Change sort or page size, then simulate a reload to restore from localStorage.
      </p>
      <div key={mountKey}>
        <PersistedStatePanel />
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setMountKey((k) => k + 1)}
      >
        Simulate reload (remount)
      </Button>
    </div>
  );
}

function PersistedStatePanel() {
  const { state, setState, reset } = usePersistedTableState({
    storage: "localStorage",
    key: "storybook-persisted-table",
    version: 1,
    fields: ["sorting", "pageSize"],
  });

  const sortLabel = state.sorting
    ? `${state.sorting.columnId} (${state.sorting.direction})`
    : "none";

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="text-sm">
        <div>Sort: {sortLabel}</div>
        <div>Page size: {state.pageSize ?? "default"}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() =>
            setState({ sorting: { columnId: "name", direction: "asc" } })
          }
        >
          Sort by name
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setState({ pageSize: 50 })}
        >
          Page size 50
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => reset()}>
          Reset persisted state
        </Button>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <PersistedStateDemo />,
};
