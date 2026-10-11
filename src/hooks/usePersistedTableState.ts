import { useCallback, useMemo, useState } from "react";

import {
  deserializePersistedTableState,
  serializePersistedTableState,
  type PersistedTableState,
  type PersistedTableStateField,
} from "./table-state-persistence";

export type TableStateStorageAdapter = {
  read: () => string | null;
  write: (serialized: string | null) => void;
};

export type UsePersistedTableStateOptions = {
  /** Built-in `localStorage`, URL search param, or a custom adapter (e.g. router-backed). */
  storage: "localStorage" | "url" | TableStateStorageAdapter;
  /** `localStorage` item key (prefixed with `tablewright:`) or URL search-param name for built-in `url` mode. */
  key: string;
  /** Schema version stored in JSON; mismatched stored version yields empty state. */
  version: number;
  /** Which state keys are read from and written to storage. */
  fields: readonly PersistedTableStateField[];
};

export type UsePersistedTableStateResult = {
  state: PersistedTableState;
  setState: (
    patch:
      | Partial<PersistedTableState>
      | ((prev: PersistedTableState) => Partial<PersistedTableState>),
  ) => void;
  reset: () => void;
};

const LOCAL_STORAGE_PREFIX = "tablewright:";

function createLocalStorageAdapter(key: string): TableStateStorageAdapter {
  const storageKey = `${LOCAL_STORAGE_PREFIX}${key}`;
  return {
    read: () => {
      try {
        return window.localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    write: (serialized) => {
      try {
        if (serialized === null) {
          window.localStorage.removeItem(storageKey);
        } else {
          window.localStorage.setItem(storageKey, serialized);
        }
      } catch {
        // Storage may be unavailable (private mode, quota).
      }
    },
  };
}

function createUrlStorageAdapter(paramName: string): TableStateStorageAdapter {
  return {
    read: () => {
      if (typeof window === "undefined") {
        return null;
      }
      const params = new URLSearchParams(window.location.search);
      return params.get(paramName);
    },
    write: (serialized) => {
      if (typeof window === "undefined") {
        return;
      }
      const params = new URLSearchParams(window.location.search);
      if (serialized === null) {
        params.delete(paramName);
      } else {
        params.set(paramName, serialized);
      }
      const search = params.toString();
      const nextUrl =
        search.length > 0
          ? `${window.location.pathname}?${search}${window.location.hash}`
          : `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", nextUrl);
    },
  };
}

function resolveAdapter(
  storage: UsePersistedTableStateOptions["storage"],
  key: string,
): TableStateStorageAdapter {
  if (storage === "localStorage") {
    return createLocalStorageAdapter(key);
  }
  if (storage === "url") {
    return createUrlStorageAdapter(key);
  }
  return storage;
}

/**
 * Persist a subset of table UI state (sort, filters, column visibility, page size) across refresh or navigation.
 *
 * Wire `state` into your own `useTableOrchestration` initial values or effects — this hook does not touch orchestration.
 */
export function usePersistedTableState(
  options: UsePersistedTableStateOptions,
): UsePersistedTableStateResult {
  const { version, fields, storage, key } = options;
  const adapter = useMemo(() => resolveAdapter(storage, key), [storage, key]);

  const [state, setStateInternal] = useState<PersistedTableState>(() =>
    deserializePersistedTableState(adapter.read(), version, fields),
  );

  const persist = useCallback(
    (next: PersistedTableState) => {
      const serialized = serializePersistedTableState(next, version, fields);
      const hasPayloadField = fields.some((field) => next[field] !== undefined);
      adapter.write(hasPayloadField ? serialized : null);
    },
    [adapter, fields, version],
  );

  const setState = useCallback(
    (
      patch:
        | Partial<PersistedTableState>
        | ((prev: PersistedTableState) => Partial<PersistedTableState>),
    ) => {
      setStateInternal((prev) => {
        const partial = typeof patch === "function" ? patch(prev) : patch;
        const next: PersistedTableState = { ...prev, ...partial };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setStateInternal({});
    adapter.write(null);
  }, [adapter]);

  return { state, setState, reset };
}
