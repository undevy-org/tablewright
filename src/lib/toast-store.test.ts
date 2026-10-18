import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSnapshot, remove, subscribe, toast } from "./toast-store";

function clearStore() {
  for (const item of [...getSnapshot()]) {
    remove(item.id);
  }
}

describe("toast-store", () => {
  beforeEach(() => {
    clearStore();
  });

  it("queues toasts in firing order with variants and string titles", () => {
    toast("a");
    toast.success({ title: "b" });

    const snapshot = getSnapshot();
    expect(snapshot).toHaveLength(2);
    expect(snapshot[0]?.variant).toBe("default");
    expect(snapshot[0]?.title).toBe("a");
    expect(snapshot[1]?.variant).toBe("success");
    expect(snapshot[1]?.title).toBe("b");
  });

  it("sets variant error on toast.error", () => {
    toast.error({ title: "Failed" });
    expect(getSnapshot()[0]?.variant).toBe("error");
  });

  it("assigns unique ids", () => {
    toast("one");
    toast("two");
    const ids = getSnapshot().map((item) => item.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("notifies subscribers without a React tree", () => {
    const listener = vi.fn();
    subscribe(listener);
    toast("plain module");
    expect(listener).toHaveBeenCalled();
  });

  it("removes one toast by id and keeps the rest", () => {
    toast("first");
    toast("second");
    const [first] = getSnapshot();
    remove(first!.id);
    const remaining = getSnapshot();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.title).toBe("second");
  });
});
