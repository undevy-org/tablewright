import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePersistedTableState } from "./usePersistedTableState";

function lastCallArg(spy: ReturnType<typeof vi.spyOn>, index: number): unknown {
  const call = spy.mock.calls.at(-1);
  return call?.[index];
}

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

  it("persists explicit null sorting and restores on remount", () => {
    const fields = ["sorting"] as const;

    const first = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields,
      }),
    );

    act(() => {
      first.result.current.setState({ sorting: null });
    });

    first.unmount();

    const second = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields,
      }),
    );

    expect(second.result.current.state).toEqual({ sorting: null });
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

  it("persists when only one of several configured fields is set", () => {
    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: "partial-fields",
        version: 1,
        fields: ["pageSize", "sorting"],
      }),
    );

    act(() => {
      result.current.setState({ pageSize: 25 });
    });

    expect(window.localStorage.getItem("tablewright:partial-fields")).toContain(
      '"pageSize":25',
    );
  });

  it("only serializes keys listed in fields", () => {
    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields: ["pageSize"],
      }),
    );

    act(() => {
      result.current.setState({
        pageSize: 10,
        sorting: { columnId: "name", direction: "asc" },
      });
    });

    const stored = JSON.parse(window.localStorage.getItem(PREFIXED_KEY) ?? "{}") as Record<
      string,
      unknown
    >;
    expect(stored.pageSize).toBe(10);
    expect(stored.sorting).toBeUndefined();
  });

  it("persists columnFilters and columnVisibility", () => {
    const fields = ["columnFilters", "columnVisibility"] as const;
    const { result, unmount } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: "cols",
        version: 1,
        fields,
      }),
    );

    act(() => {
      result.current.setState({
        columnFilters: [{ columnId: "status", value: ["ON"] }],
        columnVisibility: { status: false },
      });
    });

    unmount();

    const { result: restored } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: "cols",
        version: 1,
        fields,
      }),
    );

    expect(restored.current.state).toEqual({
      columnFilters: [{ columnId: "status", value: ["ON"] }],
      columnVisibility: { status: false },
    });
  });

  it("clears storage when persisted fields become undefined", () => {
    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: STORAGE_KEY,
        version: 1,
        fields: ["pageSize"],
      }),
    );

    act(() => {
      result.current.setState({ pageSize: 20 });
    });
    expect(window.localStorage.getItem(PREFIXED_KEY)).not.toBeNull();

    act(() => {
      result.current.setState({ pageSize: undefined });
    });
    expect(window.localStorage.getItem(PREFIXED_KEY)).toBeNull();
  });

  it("merges other URL search params when writing url storage", () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/list",
        search: "?foo=bar",
        hash: "#section",
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "url",
        key: "table",
        version: 1,
        fields: ["pageSize"],
      }),
    );

    act(() => {
      result.current.setState({ pageSize: 10 });
    });

    expect(lastCallArg(replaceState, 1)).toBe("");

    const url = lastCallArg(replaceState, 2) as string;
    expect(url).toContain("foo=bar");
    expect(url).toContain("table=");
    expect(url).toContain("#section");
  });

  it("uses pathname-only URL when url param is cleared", () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/list",
        search: "?table=%7B%22version%22%3A1%7D",
        hash: "",
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() =>
      usePersistedTableState({
        storage: "url",
        key: "table",
        version: 1,
        fields: ["pageSize"],
      }),
    );

    act(() => {
      result.current.reset();
    });

    expect(lastCallArg(replaceState, 2)).toBe("/list");
  });

  it("writes updated version after options.version changes", () => {
    const { result, rerender } = renderHook(
      ({ version }: { version: number }) =>
        usePersistedTableState({
          storage: "localStorage",
          key: "versioned",
          version,
          fields: ["pageSize"],
        }),
      { initialProps: { version: 1 } },
    );

    act(() => {
      result.current.setState({ pageSize: 5 });
    });

    rerender({ version: 2 });

    act(() => {
      result.current.setState({ pageSize: 6 });
    });

    const stored = JSON.parse(
      window.localStorage.getItem("tablewright:versioned") ?? "{}",
    ) as { version: number; pageSize: number };
    expect(stored.version).toBe(2);
    expect(stored.pageSize).toBe(6);
  });

  it("reset clears the active storage key after key changes", () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) =>
        usePersistedTableState({
          storage: "localStorage",
          key,
          version: 1,
          fields: ["pageSize"],
        }),
      { initialProps: { key: "table-a" } },
    );

    act(() => {
      result.current.setState({ pageSize: 3 });
    });
    expect(window.localStorage.getItem("tablewright:table-a")).not.toBeNull();

    rerender({ key: "table-b" });

    act(() => {
      result.current.setState({ pageSize: 4 });
    });
    expect(window.localStorage.getItem("tablewright:table-b")).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(window.localStorage.getItem("tablewright:table-b")).toBeNull();
    expect(window.localStorage.getItem("tablewright:table-a")).not.toBeNull();
  });

  it("persists explicit null sorting when sorting is in fields", () => {
    const { result, unmount } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: "sort-null",
        version: 1,
        fields: ["sorting"],
      }),
    );

    act(() => {
      result.current.setState({ sorting: null });
    });

    const stored = JSON.parse(
      window.localStorage.getItem("tablewright:sort-null") ?? "{}",
    ) as { sorting: null };
    expect(stored.sorting).toBeNull();

    unmount();

    const { result: restored } = renderHook(() =>
      usePersistedTableState({
        storage: "localStorage",
        key: "sort-null",
        version: 1,
        fields: ["sorting"],
      }),
    );
    expect(restored.current.state.sorting).toBeNull();
  });

  it("uses a new storage key when options.key changes", () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) =>
        usePersistedTableState({
          storage: "localStorage",
          key,
          version: 1,
          fields: ["pageSize"],
        }),
      { initialProps: { key: "table-a" } },
    );

    act(() => {
      result.current.setState({ pageSize: 3 });
    });
    expect(window.localStorage.getItem("tablewright:table-a")).not.toBeNull();

    rerender({ key: "table-b" });

    act(() => {
      result.current.setState({ pageSize: 4 });
    });

    expect(window.localStorage.getItem("tablewright:table-b")).toContain('"pageSize":4');
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
