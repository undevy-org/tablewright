import { beforeEach, describe, expect, it, vi } from "vitest";

type ToastStore = typeof import("./toast-store");

describe("toast-store", () => {
  let store: ToastStore;

  beforeEach(async () => {
    vi.resetModules();
    store = await import("./toast-store");
  });

  it("starts with an empty queue", () => {
    expect(store.getSnapshot()).toEqual([]);
  });

  it("queues toasts in firing order with variants and string titles", () => {
    store.toast("a");
    store.toast.success({ title: "b" });

    const snapshot = store.getSnapshot();
    expect(snapshot).toHaveLength(2);
    expect(snapshot[0]?.variant).toBe("default");
    expect(snapshot[0]?.title).toBe("a");
    expect(snapshot[1]?.variant).toBe("success");
    expect(snapshot[1]?.title).toBe("b");
  });

  it("sets variant error on toast.error", () => {
    store.toast.error({ title: "Failed" });
    expect(store.getSnapshot()[0]?.variant).toBe("error");
  });

  it("assigns unique ids", () => {
    store.toast("one");
    store.toast("two");
    const ids = store.getSnapshot().map((item) => item.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("notifies subscribers without a React tree", () => {
    const listener = vi.fn();
    store.subscribe(listener);
    store.toast("plain module");
    expect(listener).toHaveBeenCalled();
  });

  it("removes one toast by id and keeps the rest", () => {
    store.toast("first");
    store.toast("second");
    const [first] = store.getSnapshot();
    store.remove(first!.id);
    const remaining = store.getSnapshot();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.title).toBe("second");
  });

  it("ignores remove for an unknown id", () => {
    store.toast("keep");
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    const before = [...store.getSnapshot()];
    store.remove("toast-999");
    expect(store.getSnapshot()).toEqual(before);
    expect(listener).not.toHaveBeenCalled();
    unsub();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    store.toast("first");
    listener.mockClear();
    unsub();
    store.toast("second");
    expect(listener).not.toHaveBeenCalled();
  });

  it("drops empty string title and description values", () => {
    store.toast("");
    expect(store.getSnapshot()[0]?.title).toBeUndefined();

    store.toast({ title: "", description: "Body" });
    const [item] = store.getSnapshot().slice(-1);
    expect(item?.title).toBeUndefined();
    expect(item?.description).toBe("Body");
  });

  it("drops null title and description values", () => {
    store.toast({ title: null, description: "Body" } as {
      title: null;
      description: string;
    });
    const [item] = store.getSnapshot();
    expect(item?.title).toBeUndefined();
    expect(item?.description).toBe("Body");
  });

  it("uses increasing numeric toast ids", () => {
    store.toast("a");
    store.toast("b");
    const ids = store.getSnapshot().map((item) => item.id);
    const firstNum = Number(ids[0]?.replace("toast-", ""));
    const secondNum = Number(ids[1]?.replace("toast-", ""));
    expect(secondNum).toBe(firstNum + 1);
  });
});
