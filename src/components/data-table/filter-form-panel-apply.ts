import type {
  ActiveFilterValue,
  ColumnFilterConfig,
  CompoundFilterValue,
  CompoundSubFilter,
} from "./filter-types";
import { getCompoundValue, isFilterValueEmpty, isMultiStringFilterValue } from "./filter-values";

export interface MultiValueSummaryLabels {
  valuesCount: (count: number) => string;
  selectedCount: (count: number) => string;
}

export function compoundSubTouchKey(fieldId: string, subKey: string): string {
  return `${fieldId}:${subKey}`;
}

export function recordFilterFieldTouch(
  touched: Set<string>,
  fieldId: string,
  compoundSubKey?: string,
): void {
  touched.add(fieldId);
  if (compoundSubKey) {
    touched.add(compoundSubTouchKey(fieldId, compoundSubKey));
  }
}

export function singleStringDraftValue(strings: string[]): string {
  return strings[0] ?? "";
}

export function enumComboboxSelection(strings: string[]): string | null {
  return strings.length > 0 ? strings[0] : null;
}

export function patchFieldState<T extends Record<string, ActiveFilterValue | undefined>>(
  prev: T,
  fieldId: string,
  value: ActiveFilterValue | undefined,
): T {
  return { ...prev, [fieldId]: value };
}

export function mergeCompoundSubDraft(
  compound: CompoundFilterValue,
  subKey: string,
  next: ActiveFilterValue | undefined,
): ActiveFilterValue | undefined {
  const rest = { ...compound };
  delete rest[subKey];
  const merged: CompoundFilterValue =
    next === undefined || isFilterValueEmpty(next) ? rest : { ...rest, [subKey]: next };
  return Object.keys(merged).length === 0 ? undefined : merged;
}

export function formatTextMultiSummary(values: string[], labels: MultiValueSummaryLabels): string {
  if (values.length === 2) {
    const joined = values.join(", ");
    return joined.length > 24 ? labels.valuesCount(values.length) : joined;
  }
  return labels.valuesCount(values.length);
}

export function formatEnumMultiSummary(
  values: string[],
  options: { label: string; value: string }[] | undefined,
  labels: MultiValueSummaryLabels,
): string {
  if (values.length === 2) {
    const parts = values.map((v) => options?.find((o) => o.value === v)?.label ?? v);
    const joined = parts.join(", ");
    return joined.length > 24 ? labels.selectedCount(values.length) : joined;
  }
  return labels.selectedCount(values.length);
}

export function shouldPreserveMultiSubOnApply(
  sub: CompoundSubFilter,
  subCommitted: ActiveFilterValue | undefined,
  touchKey: string,
  touched: Set<string>,
): boolean {
  if (sub.type !== "text" && sub.type !== "enum") return false;
  return isMultiStringFilterValue(subCommitted) && !touched.has(touchKey);
}

export function mergeCompoundValueForApply(
  config: ColumnFilterConfig,
  fieldId: string,
  committed: ActiveFilterValue | undefined,
  draft: ActiveFilterValue | undefined,
  touched: Set<string>,
  hiddenSubSet: Set<string>,
): ActiveFilterValue | undefined {
  const committedCompound = getCompoundValue(committed);
  const draftCompound = getCompoundValue(draft);
  const merged: CompoundFilterValue = { ...draftCompound };

  for (const sub of config.subFilters ?? []) {
    if (hiddenSubSet.has(compoundSubTouchKey(fieldId, sub.key))) continue;
    const touchKey = compoundSubTouchKey(fieldId, sub.key);
    const subCommitted = committedCompound[sub.key];
    const subDraft = draftCompound[sub.key];

    if (shouldPreserveMultiSubOnApply(sub, subCommitted, touchKey, touched)) {
      if (subCommitted !== undefined && !isFilterValueEmpty(subCommitted)) {
        merged[sub.key] = subCommitted;
      }
      continue;
    }

    if (subDraft === undefined || isFilterValueEmpty(subDraft)) continue;
    merged[sub.key] = subDraft;
  }

  for (const key of Object.keys(merged)) {
    const value = merged[key];
    if (isFilterValueEmpty(value)) {
      delete merged[key];
    }
  }

  return Object.keys(merged).length === 0 ? undefined : merged;
}

export type ApplyResolution =
  | { kind: "skip" }
  | { kind: "remove" }
  | { kind: "set"; value: ActiveFilterValue };

export function resolveFieldApplyChange(
  config: ColumnFilterConfig,
  fieldId: string,
  committed: ActiveFilterValue | undefined,
  draft: ActiveFilterValue | undefined,
  touched: Set<string>,
  hiddenSubSet: Set<string>,
  isActive: boolean,
): ApplyResolution {
  switch (config.type) {
    case "text":
    case "enum": {
      if (isMultiStringFilterValue(committed) && !touched.has(fieldId)) {
        return { kind: "skip" };
      }
      if (draft === undefined || isFilterValueEmpty(draft)) {
        return isActive ? { kind: "remove" } : { kind: "skip" };
      }
      return { kind: "set", value: draft };
    }
    case "date":
    case "number-range": {
      if (draft === undefined || isFilterValueEmpty(draft)) {
        return isActive ? { kind: "remove" } : { kind: "skip" };
      }
      return { kind: "set", value: draft };
    }
    case "compound": {
      const merged = mergeCompoundValueForApply(
        config,
        fieldId,
        committed,
        draft,
        touched,
        hiddenSubSet,
      );
      if (merged === undefined || isFilterValueEmpty(merged)) {
        return isActive ? { kind: "remove" } : { kind: "skip" };
      }
      return { kind: "set", value: merged };
    }
    default:
      return { kind: "skip" };
  }
}
