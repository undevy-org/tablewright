import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Toaster, toast } from "./toast";

function FireOnce({ fire }: { fire: () => void }) {
  React.useEffect(() => {
    fire();
  }, [fire]);
  return null;
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
      <Toaster />
      <FireOnce
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
      <Toaster />
      <FireOnce fire={() => toast.success("Merchant saved")} />
    </>
  ),
};

const ErrorToast: Story = {
  render: () => (
    <>
      <Toaster />
      <FireOnce
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
      <Toaster />
      <FireOnce
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
      <Toaster />
      <FireOnce
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
