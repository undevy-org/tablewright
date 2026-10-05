import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ButtonFooter } from "../ui/button-footer";
import { Input } from "../ui/input";
import { Combobox } from "../ui/combobox";

import type {
  ActiveFilter,
  ActiveFilterValue,
  ColumnFilterConfig,
  CompoundFilterValue,
  DateRangeValue,
  NumberRangeValue,
} from "./filter-types";
import {
  getCompoundValue,
  getDateRange,
  getNumberRange,
  getStringArray,
  isFilterValueEmpty,
  isMultiStringFilterValue,
} from "./filter-values";
import { hasActiveManagedFilters, type ManagedFilterChange } from "./managed-filters";

export interface FilterFormPanelLabels {
  closeFiltersAriaLabel: string;
  closeFiltersTitle: string;
  apply: string;
  clear: string;
  anyPlaceholder: string;
  rangeFromPlaceholder: string;
  rangeToPlaceholder: string;
  fieldRangeFromAriaLabel: (fieldLabel: string) => string;
  fieldRangeToAriaLabel: (fieldLabel: string) => string;
  compoundSubRangeFromAriaLabel: (subLabel: string) => string;
  compoundSubRangeToAriaLabel: (subLabel: string) => string;
  compoundSubRangeFromPlaceholder: (subLabel: string) => string;
  compoundSubRangeToPlaceholder: (subLabel: string) => string;
  /** Shown under read-only multi-value text fields in the form panel. */
  multiValueFormHint: string;
  valuesCount: (count: number) => string;
  selectedCount: (count: number) => string;
  /** Clears a multi-value field so the user can enter a single value. */
  clearFieldForSingleEdit: string;
}

const DEFAULT_LABELS: FilterFormPanelLabels = {
  closeFiltersAriaLabel: "Close filters",
  closeFiltersTitle: "Close filters",
  apply: "Apply",
  clear: "Clear",
  anyPlaceholder: "Any",
  rangeFromPlaceholder: "From",
  rangeToPlaceholder: "To",
  fieldRangeFromAriaLabel: (fieldLabel) => `${fieldLabel} — from`,
  fieldRangeToAriaLabel: (fieldLabel) => `${fieldLabel} — to`,
  compoundSubRangeFromAriaLabel: (subLabel) => `${subLabel} — from`,
  compoundSubRangeToAriaLabel: (subLabel) => `${subLabel} — to`,
  compoundSubRangeFromPlaceholder: (subLabel) => `${subLabel} from`,
  compoundSubRangeToPlaceholder: (subLabel) => `${subLabel} to`,
  multiValueFormHint:
    "Multiple values — edit using the column filter chips or popover above the table.",
  valuesCount: (count) => `${count} values`,
  selectedCount: (count) => `${count} selected`,
  clearFieldForSingleEdit: "Clear to edit one value",
};

export interface FilterFormPanelProps {
  /** All known filter configs (same shape used by GroupedFilterAdd). */
  filterConfigs: Record<string, ColumnFilterConfig>;
  /** Ordered list of column IDs to render as form fields. */
  fields: readonly string[];
  /**
   * Currently active filters from the page-level orchestrator.
   * Must be a stable reference — pass `orch.columnFilters` directly, not a derived array
   * (touched-field tracking depends on referential stability for the reseed effect).
   */
  filters: ActiveFilter[];
  /** Called on Apply with only managed-field changes. */
  onApply: (changes: ManagedFilterChange[]) => void;
  /** Called on Clear with the managed columnIds to clear. */
  onClear: (managedColumnIds: string[]) => void;
  /** Optional title above the grid. Defaults to "Filters". */
  title?: string;
  /** Optional className passed to the root form element. */
  className?: string;
  /** Optional DOM id on the root form element (used by aria-controls from FilterFormToggle). */
  id?: string;
  /** Optional close handler — when provided, renders a close button in the header. */
  onClose?: () => void;
  /**
   * Sub-filters to omit inside compound fields, addressed as `${fieldId}:${subKey}`.
   * Lets a compound render only a subset of its sub-filters — the rest stay
   * available through the page's filter-visibility manager. Whole-field hiding
   * is done by leaving the id out of `fields`; this is only for sub-fields.
   */
  hiddenSubFilterKeys?: readonly string[];
  labels?: Partial<FilterFormPanelLabels>;
}

type FormState = Record<string, ActiveFilterValue | undefined>;


function deriveInitialState(fields: readonly string[], filters: ActiveFilter[]): FormState {
  const byId = new Map(filters.map((f) => [f.columnId, f.value] as const));
  const next: FormState = {};
  for (const id of fields) next[id] = byId.get(id);
  return next;
}

export function FilterFormPanel({
  filterConfigs,
  fields,
  filters,
  onApply,
  onClear,
  title = "Filters",
  className,
  id,
  onClose,
  hiddenSubFilterKeys,
  labels: labelOverrides,
}: FilterFormPanelProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const hiddenSubSet = useMemo(() => new Set(hiddenSubFilterKeys ?? []), [hiddenSubFilterKeys]);

  const renderableFields = useMemo(
    () =>
      fields.filter((id) => {
        if (filterConfigs[id]) return true;
        console.warn(`[FilterFormPanel] Unknown columnId in 'fields': ${id}`);
        return false;
      }),
    [fields, filterConfigs],
  );

  const [state, setState] = useState<FormState>(() =>
    deriveInitialState(renderableFields, filters),
  );

  const touchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = deriveInitialState(renderableFields, filters);
    setState((prev) => {
      const next: FormState = { ...prev };
      let changed = false;
      for (const fieldId of renderableFields) {
        if (touchedRef.current.has(fieldId)) continue;
        if (next[fieldId] !== fresh[fieldId]) {
          next[fieldId] = fresh[fieldId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [filters, renderableFields]);

  const setField = useCallback(
    (id: string, value: ActiveFilterValue | undefined, compoundSubKey?: string) => {
      touchedRef.current.add(id);
      if (compoundSubKey) touchedRef.current.add(compoundSubTouchKey(id, compoundSubKey));
      setState((prev) => ({ ...prev, [id]: value }));
    },
    [],
  );

  const handleApply = useCallback(() => {
    const activeIds = new Set(filters.map((f) => f.columnId));
    const committedById = new Map(filters.map((f) => [f.columnId, f.value] as const));
    const touched = touchedRef.current;
    const changes: ManagedFilterChange[] = [];
    for (const id of renderableFields) {
      const config = filterConfigs[id];
      if (!config) continue;
      const committed = committedById.get(id);
      const draft = state[id];
      const resolution = resolveFieldApplyChange(
        config,
        id,
        committed,
        draft,
        touched,
        hiddenSubSet,
        activeIds.has(id),
      );
      if (resolution.kind === "skip") continue;
      if (resolution.kind === "remove") changes.push({ columnId: id, action: "remove" });
      else changes.push({ columnId: id, action: "set", value: resolution.value });
    }
    onApply(changes);
    touchedRef.current.clear();
  }, [filterConfigs, filters, hiddenSubSet, onApply, renderableFields, state]);

  const handleClear = useCallback(() => {
    setState(deriveInitialState(renderableFields, []));
    onClear(renderableFields);
    touchedRef.current.clear();
  }, [onClear, renderableFields]);

  const isClearDisabled =
    !hasActiveManagedFilters(filters, renderableFields) &&
    renderableFields.every((fieldId) => isFilterValueEmpty(state[fieldId]));

  return (
    <form
      id={id}
      aria-label={title}
      onSubmit={(e) => {
        e.preventDefault();
        handleApply();
      }}
      className={cn(
        "mb-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-sunken)]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-6 pb-2 pt-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          {title}
        </h2>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={labels.closeFiltersAriaLabel}
            title={labels.closeFiltersTitle}
            onClick={onClose}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-end gap-3 px-6 pb-4">
        {renderableFields.map((fieldId) => {
          const config = filterConfigs[fieldId];
          if (!config) return null;
          return (
            <Field
              key={fieldId}
              config={config}
              value={state[fieldId]}
              onChange={(v, compoundSubKey) => setField(fieldId, v, compoundSubKey)}
              fieldId={fieldId}
              hiddenSubSet={hiddenSubSet}
              labels={labels}
            />
          );
        })}
      </div>

      <div className="px-6 pb-4">
        <ButtonFooter align="end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClear}
            disabled={isClearDisabled}
          >
            {labels.clear}
          </Button>
          <Button type="submit" size="sm">
            {labels.apply}
          </Button>
        </ButtonFooter>
      </div>
    </form>
  );
}

interface FieldProps {
  config: ColumnFilterConfig;
  value: ActiveFilterValue | undefined;
  onChange: (next: ActiveFilterValue | undefined, compoundSubKey?: string) => void;
  fieldId: string;
  hiddenSubSet: Set<string>;
  labels: FilterFormPanelLabels;
}

function Field({ config, value, onChange, fieldId, hiddenSubSet, labels }: FieldProps) {
  if (config.type === "text") {
    const strings = getStringArray(value);
    if (strings.length > 1) {
      return (
        <MultiValueStringSummary
          label={config.label}
          summary={formatTextMultiSummary(strings, labels)}
          hint={labels.multiValueFormHint}
          clearLabel={labels.clearFieldForSingleEdit}
          onClearForEdit={() => onChange(undefined)}
        />
      );
    }
    const text = strings[0] ?? "";
    return (
      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--text-secondary)]">{config.label}</span>
        <Input
          aria-label={config.label}
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? undefined : [v]);
          }}
          className="h-9 min-w-0"
        />
      </label>
    );
  }

  if (config.type === "enum") {
    const strings = getStringArray(value);
    if (strings.length > 1) {
      return (
        <MultiValueStringSummary
          label={config.label}
          summary={formatEnumMultiSummary(strings, config.options, labels)}
          hint={labels.multiValueFormHint}
          clearLabel={labels.clearFieldForSingleEdit}
          onClearForEdit={() => onChange(undefined)}
        />
      );
    }
    const comboboxValue = strings.length > 0 ? strings[0] : null;
    // Combobox (cmdk) вместо Radix Select: строка поиска фильтрует опции по
    // label+value подстрокой. Повторный клик по выбранному (clearable) = «Any».
    return (
      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--text-secondary)]">{config.label}</span>
        <Combobox
          value={comboboxValue}
          onChange={(v) => onChange(v === null ? undefined : [v])}
          options={config.options ?? []}
          placeholder={labels.anyPlaceholder}
          triggerAriaLabel={config.label}
          triggerClassName="h-9 min-w-0"
        />
      </label>
    );
  }

  if (config.type === "date") {
    const range = getDateRange(value);
    const update = (key: "from" | "to") => (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      const next: DateRangeValue = { ...range, [key]: v || undefined };
      onChange(next.from || next.to ? next : undefined);
    };
    return (
      <div className="flex min-w-0 flex-col gap-1.5 [grid-column:span_2]">
        <span className="text-[11px] font-medium text-[var(--text-secondary)]">{config.label}</span>
        <div className="flex min-w-0 gap-2">
          <Input
            type="date"
            aria-label={labels.fieldRangeFromAriaLabel(config.label)}
            value={range.from ?? ""}
            onChange={update("from")}
            className="h-9 min-w-0 flex-1"
          />
          <Input
            type="date"
            aria-label={labels.fieldRangeToAriaLabel(config.label)}
            value={range.to ?? ""}
            onChange={update("to")}
            className="h-9 min-w-0 flex-1"
          />
        </div>
      </div>
    );
  }

  if (config.type === "number-range") {
    const range = getNumberRange(value);
    const update = (key: "from" | "to") => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const parsed = raw === "" ? undefined : Number(raw);
      const next: NumberRangeValue = { ...range, [key]: Number.isFinite(parsed) ? parsed : undefined };
      onChange(next.from !== undefined || next.to !== undefined ? next : undefined);
    };
    return (
      <div className="flex min-w-0 flex-col gap-1.5 [grid-column:span_2]">
        <span className="text-[11px] font-medium text-[var(--text-secondary)]">{config.label}</span>
        <div className="flex min-w-0 gap-2">
          <Input
            type="number"
            aria-label={labels.fieldRangeFromAriaLabel(config.label)}
            value={range.from ?? ""}
            onChange={update("from")}
            placeholder={labels.rangeFromPlaceholder}
            className="h-9 min-w-0 flex-1"
          />
          <Input
            type="number"
            aria-label={labels.fieldRangeToAriaLabel(config.label)}
            value={range.to ?? ""}
            onChange={update("to")}
            placeholder={labels.rangeToPlaceholder}
            className="h-9 min-w-0 flex-1"
          />
        </div>
      </div>
    );
  }

  if (config.type === "compound") {
    const compound = getCompoundValue(value);

    const updateSub = (subKey: string, next: ActiveFilterValue | undefined) => {
      const rest = { ...compound };
      delete rest[subKey];
      const merged: CompoundFilterValue =
        next === undefined || isFilterValueEmpty(next) ? rest : { ...rest, [subKey]: next };
      onChange(Object.keys(merged).length === 0 ? undefined : merged, subKey);
    };

    const visibleSubs = (config.subFilters ?? []).filter(
      (sub) => !hiddenSubSet.has(`${fieldId}:${sub.key}`),
    );
    if (visibleSubs.length === 0) return null;
    const subCount = visibleSubs.length;
    return (
      <div
        className="flex min-w-0 flex-col gap-1.5"
        style={{ gridColumn: `span ${Math.max(2, Math.min(subCount, 4))}` }}
      >
        <span className="text-[11px] font-medium text-[var(--text-secondary)]">{config.label}</span>
        <div className="grid min-w-0 gap-2 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {visibleSubs.map((sub) => {
            const subValue = compound[sub.key];
            if (sub.type === "text") {
              const strings = getStringArray(subValue);
              if (strings.length > 1) {
                return (
                  <MultiValueStringSummary
                    key={sub.key}
                    label={sub.label}
                    summary={formatTextMultiSummary(strings, labels)}
                    hint={labels.multiValueFormHint}
                    clearLabel={labels.clearFieldForSingleEdit}
                    onClearForEdit={() => updateSub(sub.key, undefined)}
                    compact
                  />
                );
              }
              const text = strings[0] ?? "";
              return (
                <Input
                  key={sub.key}
                  aria-label={sub.label}
                  placeholder={sub.label}
                  value={text}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateSub(sub.key, v === "" ? undefined : [v]);
                  }}
                  className="h-9 min-w-0"
                />
              );
            }
            if (sub.type === "enum") {
              const strings = getStringArray(subValue);
              if (strings.length > 1) {
                return (
                  <MultiValueStringSummary
                    key={sub.key}
                    label={sub.label}
                    summary={formatEnumMultiSummary(strings, sub.options, labels)}
                    hint={labels.multiValueFormHint}
                    clearLabel={labels.clearFieldForSingleEdit}
                    onClearForEdit={() => updateSub(sub.key, undefined)}
                    compact
                  />
                );
              }
              const comboboxValue = strings.length > 0 ? strings[0] : null;
              return (
                <Combobox
                  key={sub.key}
                  value={comboboxValue}
                  onChange={(v) => updateSub(sub.key, v === null ? undefined : [v])}
                  options={sub.options ?? []}
                  placeholder={sub.label}
                  triggerAriaLabel={sub.label}
                  triggerClassName="h-9 min-w-0"
                />
              );
            }
            if (sub.type === "number-range") {
              const range = getNumberRange(subValue);
              const updateRange = (key: "from" | "to") => (e: ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                const parsed = raw === "" ? undefined : Number(raw);
                const next: NumberRangeValue = {
                  ...range,
                  [key]: Number.isFinite(parsed) ? parsed : undefined,
                };
                updateSub(
                  sub.key,
                  next.from !== undefined || next.to !== undefined ? next : undefined,
                );
              };
              return (
                <div key={sub.key} className="flex min-w-0 gap-2">
                  <Input
                    type="number"
                    aria-label={labels.compoundSubRangeFromAriaLabel(sub.label)}
                    value={range.from ?? ""}
                    onChange={updateRange("from")}
                    placeholder={labels.compoundSubRangeFromPlaceholder(sub.label)}
                    className="h-9 min-w-0 flex-1"
                  />
                  <Input
                    type="number"
                    aria-label={labels.compoundSubRangeToAriaLabel(sub.label)}
                    value={range.to ?? ""}
                    onChange={updateRange("to")}
                    placeholder={labels.compoundSubRangeToPlaceholder(sub.label)}
                    className="h-9 min-w-0 flex-1"
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  // No fall-through expected — every `ColumnFilterType` is handled above.
  return null;
}

function compoundSubTouchKey(fieldId: string, subKey: string): string {
  return `${fieldId}:${subKey}`;
}

function formatTextMultiSummary(values: string[], labels: FilterFormPanelLabels): string {
  if (values.length === 2) {
    const joined = values.join(", ");
    return joined.length > 24 ? labels.valuesCount(values.length) : joined;
  }
  return labels.valuesCount(values.length);
}

function formatEnumMultiSummary(
  values: string[],
  options: { label: string; value: string }[] | undefined,
  labels: FilterFormPanelLabels,
): string {
  if (values.length === 2) {
    const parts = values.map((v) => options?.find((o) => o.value === v)?.label ?? v);
    const joined = parts.join(", ");
    return joined.length > 24 ? labels.selectedCount(values.length) : joined;
  }
  return labels.selectedCount(values.length);
}

function mergeCompoundValueForApply(
  config: ColumnFilterConfig,
  fieldId: string,
  committed: ActiveFilterValue | undefined,
  draft: ActiveFilterValue | undefined,
  touched: Set<string>,
  hiddenSubSet: Set<string>,
): ActiveFilterValue | undefined {
  const committedCompound = getCompoundValue(committed);
  const draftCompound = getCompoundValue(draft);
  const merged: CompoundFilterValue = {};

  for (const sub of config.subFilters ?? []) {
    if (hiddenSubSet.has(compoundSubTouchKey(fieldId, sub.key))) continue;
    const touchKey = compoundSubTouchKey(fieldId, sub.key);
    const subCommitted = committedCompound[sub.key];
    const subDraft = draftCompound[sub.key];

    if (
      (sub.type === "text" || sub.type === "enum") &&
      isMultiStringFilterValue(subCommitted) &&
      !touched.has(touchKey)
    ) {
      if (subCommitted !== undefined && !isFilterValueEmpty(subCommitted)) {
        merged[sub.key] = subCommitted;
      }
      continue;
    }

    if (subDraft === undefined || isFilterValueEmpty(subDraft)) continue;
    merged[sub.key] = subDraft;
  }

  return Object.keys(merged).length === 0 ? undefined : merged;
}

type ApplyResolution =
  | { kind: "skip" }
  | { kind: "remove" }
  | { kind: "set"; value: ActiveFilterValue };

function resolveFieldApplyChange(
  config: ColumnFilterConfig,
  fieldId: string,
  committed: ActiveFilterValue | undefined,
  draft: ActiveFilterValue | undefined,
  touched: Set<string>,
  hiddenSubSet: Set<string>,
  isActive: boolean,
): ApplyResolution {
  if (config.type === "text" || config.type === "enum") {
    if (isMultiStringFilterValue(committed) && !touched.has(fieldId)) {
      return { kind: "skip" };
    }
    if (draft === undefined || isFilterValueEmpty(draft)) {
      return isActive ? { kind: "remove" } : { kind: "skip" };
    }
    return { kind: "set", value: draft };
  }

  if (config.type === "date" || config.type === "number-range") {
    if (draft === undefined || isFilterValueEmpty(draft)) {
      return isActive ? { kind: "remove" } : { kind: "skip" };
    }
    return { kind: "set", value: draft };
  }

  if (config.type === "compound") {
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

  return { kind: "skip" };
}

interface MultiValueStringSummaryProps {
  label: string;
  summary: string;
  hint: string;
  clearLabel: string;
  onClearForEdit: () => void;
  compact?: boolean;
}

function MultiValueStringSummary({
  label,
  summary,
  hint,
  clearLabel,
  onClearForEdit,
  compact,
}: MultiValueStringSummaryProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", compact && "col-span-full")}>
      <span className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
      <p className="text-[12px] text-[var(--text-primary)]">{summary}</p>
      <p className="text-[11px] leading-snug text-[var(--text-secondary)]">{hint}</p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-9 self-start"
        onClick={onClearForEdit}
      >
        {clearLabel}
      </Button>
    </div>
  );
}
