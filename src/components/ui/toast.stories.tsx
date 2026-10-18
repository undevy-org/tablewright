import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { getSnapshot, remove } from "../../lib/toast-store";
import { Toaster, toast } from "./toast";

function ToastDemo({ fire }: { fire: () => void }) {
  React.useEffect(() => {
    fire();
    return () => {
      for (const item of [...getSnapshot()]) {
        remove(item.id);
      }
    };
  }, [fire]);
  return <Toaster />;
}

const meta: Meta<typeof Toaster> = {
  title: "UI/Toast",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <>
      <ToastDemo
        fire={() =>
          toast({
            title: "Report scheduled",
            description: "It will be sent every Monday at 9:00.",
          })
        }
      />
    </>
  ),
};

export const Success: Story = {
  render: () => (
    <>
      <ToastDemo fire={() => toast.success("Merchant saved")} />
    </>
  ),
};

const ErrorToast: Story = {
  render: () => (
    <>
      <ToastDemo
        fire={() =>
          toast.error({
            title: "Sync failed",
            description: "Check your connection and try again.",
          })
        }
      />
    </>
  ),
};

export { ErrorToast as Error };

export const WithAction: Story = {
  render: () => (
    <>
      <ToastDemo
        fire={() =>
          toast({
            title: "Row deleted",
            action: { label: "Undo", onClick: () => {} },
          })
        }
      />
    </>
  ),
};

export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => (
    <>
      <ToastDemo
        fire={() =>
          toast({
            title: "Report scheduled",
            description: "It will be sent every Monday at 9:00.",
          })
        }
      />
    </>
  ),
};
