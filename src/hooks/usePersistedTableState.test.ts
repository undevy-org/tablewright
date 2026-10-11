import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePersistedTableState } from "./usePersistedTableState";

const STORAGE_KEY = "demo-table";
const PREFIXED_KEY = `tablewright:${STORAGE_KEY}`;

describe("usePersistedTableState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("persists to localStorage and restores on remount", () => {
    const fields = ["sorting", "pageSize"] as const;

    const first = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields,
      }),
    );

    act(() => {
      first.result.current.setState({
        sorting: { columnId: "name", direction: "asc" },
        pageSize: 30,
      });
    });

    expect(window.localStorage.getItem(PREFIXED_KEY)).toContain('"version":1');

    first.unmount();

    const second = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields,
      }),
    );

    expect(second.result.current.state).toEqual({
      sorting: { columnId: "name", direction: "asc" },
      pageSize: 30,
    });
  });

  it("treats version mismatch as empty state", () => {
    window.localStorage.setItem(
      PREFIXED_KEY,
      JSON.stringify({ version: 9, pageSize: 10 }),
    );

    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields: ["pageSize"],
      }),
    );

    expect(result.current.state).toEqual({});
  });

  it("persists via built-in url mode and restores on remount", () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    const param = "twState";
    const fields = ["columnVisibility"] as const;

    Object.defineProperty(window, "location", {
      value: {
        pathname: "/tables",
        search: "",
        hash: "",
      },
      writable: true,
      configurable: true,
    });

    const first = renderHook(() =>
      usePersistedTableState({
        storage: "url",
        key: param,
        version: 1,
        fields,
      }),
    );

    act(() => {
      first.result.current.setState({ columnVisibility: { colA: false } });
    });

    expect(replaceState).toHaveBeenCalled();
    const lastCall = replaceState.mock.calls.at(-1);
    expect(lastCall?.[2]).toContain(`${param}=`);

    const search = (lastCall?.[2] as string).split("?")[1] ?? "";
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/tables",
        search: `?${search}`,
        hash: "",
      },
      writable: true,
      configurable: true,
    });

    first.unmount();

    const second = renderHook(() =>
      usePersistedTableState({
        storage: "url",
        key: param,
        version: 1,
        fields,
      }),
    );

    expect(second.result.current.state).toEqual({
      columnVisibility: { colA: false },
    });
  });

  it("invokes custom adapter read/write and reset clears via write(null)", () => {
    let stored: string | null = null;
    const read = vi.fn(() => stored);
    const write = vi.fn((value: string | null) => {
      stored = value;
    });

    const { result, unmount } = renderHook(() =>
      usePersistedTableState({
        storage: { read, write },
        key: "ignored",
        version: 1,
        fields: ["pageSize"],
      }),
    );

    expect(read).toHaveBeenCalled();

    act(() => {
      result.current.setState({ pageSize: 15 });
    });
    expect(write).toHaveBeenCalledWith(expect.stringContaining('"pageSize":15'));

    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({});
    expect(write).toHaveBeenLastCalledWith(null);

    unmount();

    stored = JSON.stringify({ version: 1, pageSize: 15 });
    const restored = renderHook(() =>
      usePersistedTableState({
        storage: { read, write },
        key: "ignored",
        version: 1,
        fields: ["pageSize"],
      }),
    );
    expect(restored.result.current.state).toEqual({ pageSize: 15 });
  });

  it("reset removes localStorage key", () => {
    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields: ["pageSize"],
      }),
    );

    act(() => {
      result.current.setState({ pageSize: 5 });
    });
    expect(window.localStorage.getItem(PREFIXED_KEY)).not.toBeNull();

    act(() => {
      result.current.reset();
    });
    expect(window.localStorage.getItem(PREFIXED_KEY)).toBeNull();
  });

  it("supports functional setState updates", () => {
    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields: ["pageSize"],
      }),
    );

    act(() => {
      result.current.setState({ pageSize: 10 });
    });
    act(() => {
      result.current.setState((prev) => ({ pageSize: (prev.pageSize ?? 0) + 5 }));
    });

    expect(result.current.state.pageSize).toBe(15);
  });
});
