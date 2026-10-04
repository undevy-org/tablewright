import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FilterChip } from "./FilterChip";
import { FilterPopoverFooter, type FilterPopoverFooterLabels } from "./FilterPopoverFooter";
import type {
  ActiveFilter,
  ActiveFilterValue,
  ColumnFilterConfig,
  CompoundSubFilter,
  FilterStatsSlice,
} from "./filter-types";
import {
  getCompoundValue,
  getNumberRange,
  getStringArray,
  isFilterValueEmpty,
} from "./filter-values";

export interface CompoundFilterPopoverLabels {
  searchPlaceholder: string;
  addPlaceholder: string;
  contains: string;
  orBadge: string;
  chipMin: string;
  chipMax: string;
  statsAllPrefix: string;
  statsFilteredPrefix: string;
  numberInputPlaceholder: string;
  resetSectionTitle: (subLabel: string) => string;
  filtersCount: (n: number) => string;
  subValuesCount: (n: number) => string;
  subSelectedCount: (n: number) => string;
}

const DEFAULT_LABELS: CompoundFilterPopoverLabels = {
  searchPlaceholder: "Search...",
  addPlaceholder: "Add...",
  contains: "Contains",
  orBadge: "OR",
  chipMin: "min",
  chipMax: "max",
  statsAllPrefix: "All:",
  statsFilteredPrefix: "Filt:",
  numberInputPlaceholder: "0",
  resetSectionTitle: (subLabel) => `Reset ${subLabel}`,
  filtersCount: (n) => `${n} filters`,
  subValuesCount: (n) => `${n} values`,
  subSelectedCount: (n) => `${n} selected`,
};

// ── Draft types ──────────────────────────────────────────────────────────

type NumberRangeDraft = { type: "number-range"; from: string; to: string };
type TextDraft = { type: "text"; tags: string[]; input: string };
type EnumDraft = { type: "enum"; selected: string[] };
type SubFilterDraft = NumberRangeDraft | TextDraft | EnumDraft;

// ── Helpers ──────────────────────────────────────────────────────────────



function initDraft(
  sub: CompoundSubFilter,
  compound: Record<string, ActiveFilterValue>,
): SubFilterDraft {
  const val = compound[sub.key];
  if (sub.type === "number-range") {
    const range = getNumberRange(val);
    return {
      type: "number-range",
      from: range.from !== undefined ? String(range.from) : "",
      to: range.to !== undefined ? String(range.to) : "",
    };
  }
  if (sub.type === "enum") {
    return { type: "enum", selected: getStringArray(val) };
  }
  return {
    type: "text",
    tags: getStringArray(val),
    input: "",
  };
}

function draftToValue(draft: SubFilterDraft): ActiveFilterValue | undefined {
  if (draft.type === "number-range") {
    const from = draft.from.trim() !== "" ? Number(draft.from) : undefined;
    const to = draft.to.trim() !== "" ? Number(draft.to) : undefined;
    if (from === undefined && to === undefined) return undefined;
    return { from, to };
  }
  if (draft.type === "enum") {
    return draft.selected.length > 0 ? draft.selected : undefined;
  }
  const trimmed = draft.input.trim();
  const all =
    trimmed.length > 0 && !draft.tags.includes(trimmed)
      ? [...draft.tags, trimmed]
      : [...draft.tags];
  return all.length > 0 ? all : undefined;
}

// ── Sub-filter display for chip ──────────────────────────────────────────

function formatSubDisplay(
  sub: CompoundSubFilter,
  val: ActiveFilterValue,
  labels: CompoundFilterPopoverLabels,
): string | null {
  if (isFilterValueEmpty(val)) return null;
  if (sub.type === "number-range") {
    const { from, to } = getNumberRange(val);
    const label = sub.label.replace(/\s+/g, " ").split(" ").pop() ?? sub.label;
    if (from !== undefined && to !== undefined) return `${label}: ${from}–${to}`;
    if (from !== undefined) return `${label}: ≥${from}`;
    if (to !== undefined) return `${label}: ≤${to}`;
  }
  if (sub.type === "enum" && Array.isArray(val) && val.length > 0) {
    if (val.length === 1) {
      const label = sub.options?.find((o) => o.value === val[0])?.label ?? val[0];
      return `${sub.label}: ${label}`;
    }
    return `${sub.label}: ${labels.subSelectedCount(val.length)}`;
  }
  if (Array.isArray(val) && val.length > 0) {
    if (val.length === 1) {
      const display = val[0].length > 15 ? `${val[0].slice(0, 15)}…` : val[0];
      return `${sub.label}: ${display}`;
    }
    return `${sub.label}: ${labels.subValuesCount(val.length)}`;
  }
  return null;
}

// ── Props ────────────────────────────────────────────────────────────────

interface CompoundFilterPopoverProps {
  config: ColumnFilterConfig;
  filter: ActiveFilter;
  onChange: (value: ActiveFilterValue) => void;
  onRemove: () => void;
  initialOpen?: boolean;
  chipClassName?: string;
  columnFilterStats?: Record<string, FilterStatsSlice>;
  requestOpen?: boolean;
  onRequestOpenHandled?: () => void;
  labels?: Partial<CompoundFilterPopoverLabels>;
  footerLabels?: Partial<FilterPopoverFooterLabels>;
}

// ── Component ────────────────────────────────────────────────────────────

export function CompoundFilterPopover({
  config,
  filter,
  onChange,
  onRemove,
  initialOpen = false,
  chipClassName,
  columnFilterStats,
  requestOpen,
  onRequestOpenHandled,
  labels: labelOverrides,
  footerLabels,
}: CompoundFilterPopoverProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const subFilters = config.subFilters ?? [];
  const compound = getCompoundValue(filter.value);

  const [isOpen, setIsOpen] = useState(false);
  const onRequestOpenHandledRef = useRef(onRequestOpenHandled);
  useEffect(() => {
    onRequestOpenHandledRef.current = onRequestOpenHandled;
  });
  const initDrafts = () => {
    const d: Record<string, SubFilterDraft> = {};
    for (const sub of subFilters) d[sub.key] = initDraft(sub, compound);
    return d;
  };
  const [drafts, setDrafts] = useState<Record<string, SubFilterDraft>>(initDrafts);

  // The committed value can change from outside (filter form, preset, clear
  // all) while the popover is closed — re-seed the drafts so it opens on it.
  const [draftSource, setDraftSource] = useState(filter.value);
  if (!isOpen && draftSource !== filter.value) {
    setDraftSource(filter.value);
    setDrafts(initDrafts());
  }

  // Auto-open on initial mount
  useEffect(() => {
    if (!initialOpen) return;
    const id = setTimeout(() => setIsOpen(true), 0);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Programmatic open from external trigger
  useEffect(() => {
    if (!requestOpen) return;
    const id = setTimeout(() => {
      setIsOpen(true);
      onRequestOpenHandledRef.current?.();
    }, 0);
    return () => clearTimeout(id);
  }, [requestOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (isFilterValueEmpty(compound)) {
        onRemove();
        return;
      }
      // Reset drafts to committed value
      setDrafts(initDrafts());
    }
    setIsOpen(nextOpen);
  };

  const handleApply = () => {
    const result: Record<string, ActiveFilterValue> = {};
    for (const sub of subFilters) {
      const val = draftToValue(drafts[sub.key]);
      if (val !== undefined) result[sub.key] = val;
    }
    if (Object.keys(result).length === 0) {
      onRemove();
    } else {
      onChange(result);
    }
    setIsOpen(false);
  };

  const handleClearAll = () => {
    const d: Record<string, SubFilterDraft> = {};
    for (const sub of subFilters) {
      d[sub.key] =
        sub.type === "number-range"
          ? { type: "number-range", from: "", to: "" }
          : sub.type === "enum"
            ? { type: "enum", selected: [] }
            : { type: "text", tags: [], input: "" };
    }
    setDrafts(d);
  };

  const handleResetSection = (key: string) => {
    setDrafts((prev) => {
      const sub = subFilters.find((s) => s.key === key);
      if (!sub) return prev;
      return {
        ...prev,
        [key]:
          sub.type === "number-range"
            ? { type: "number-range", from: "", to: "" }
            : sub.type === "enum"
              ? { type: "enum", selected: [] }
              : { type: "text", tags: [], input: "" },
      };
    });
  };

  // ── Chip display ─────────────────────────────────────────────────────

  const getDisplayValue = (): string | undefined => {
    if (isFilterValueEmpty(compound)) return undefined;
    const parts: string[] = [];
    for (const sub of subFilters) {
      const display = formatSubDisplay(sub, compound[sub.key], labels);
      if (display) parts.push(display);
    }
    if (parts.length === 0) return undefined;
    const joined = parts.join(" & ");
    return joined.length > 30 ? labels.filtersCount(parts.length) : joined;
  };

  // ── Render sections ─────────────────────────────────────────────────

  const updateDraft = (key: string, updater: (prev: SubFilterDraft) => SubFilterDraft) => {
    setDrafts((prev) => ({ ...prev, [key]: updater(prev[key]) }));
  };

  const renderNumberRangeSection = (sub: CompoundSubFilter, draft: NumberRangeDraft) => {
    const statsKey = `${filter.columnId}:${sub.key}`;
    const stats = columnFilterStats?.[statsKey];
    const allNum = stats?.all?.type === "number-range" ? stats.all : null;
    const filtNum = stats?.filtered?.type === "number-range" ? stats.filtered : null;

    const chipCls = (active: boolean) =>
      active
        ? "rounded border border-[var(--tag-blue-text)]/20 bg-[var(--tag-blue-bg)] px-1.5 py-0.5 text-[11px] text-[var(--tag-blue-text)] cursor-pointer transition-colors"
        : "rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors";

    const renderNumRow = (label: string, numStats: typeof allNum) => {
      if (!numStats) return null;
      const { min, max } = numStats;
      return (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[40px]">
            {label}
          </span>
          <button
            type="button"
            className={chipCls(draft.from === String(min))}
            onClick={() =>
              updateDraft(sub.key, (d) => ({ ...d, from: String(min) }) as NumberRangeDraft)
            }
          >
            {labels.chipMin} {min.toLocaleString()}
          </button>
          <button
            type="button"
            className={chipCls(draft.to === String(max))}
            onClick={() =>
              updateDraft(sub.key, (d) => ({ ...d, to: String(max) }) as NumberRangeDraft)
            }
          >
            {labels.chipMax} {max.toLocaleString()}
          </button>
        </div>
      );
    };

    return (
      <>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] block">
              {labels.chipMin}
            </span>
            <Input
              type="number"
              autoFocus={subFilters.indexOf(sub) === 0}
              placeholder={allNum ? String(allNum.min) : labels.numberInputPlaceholder}
              value={draft.from}
              onChange={(e) =>
                updateDraft(sub.key, (prev) => ({
                  ...(prev as NumberRangeDraft),
                  from: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] block">
              {labels.chipMax}
            </span>
            <Input
              type="number"
              placeholder={allNum ? String(allNum.max) : labels.numberInputPlaceholder}
              value={draft.to}
              onChange={(e) =>
                updateDraft(sub.key, (prev) => ({
                  ...(prev as NumberRangeDraft),
                  to: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
          </div>
        </div>
        {allNum && (
          <div className="border-t border-[var(--border-subtle)] mt-3 pt-2 space-y-2">
            {renderNumRow(labels.statsAllPrefix, allNum)}
            {filtNum && (
              <div className="border-t border-[var(--border-subtle)] pt-1.5">
                {renderNumRow(labels.statsFilteredPrefix, filtNum)}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderTextSection = (sub: CompoundSubFilter, draft: TextDraft) => {
    const statsKey = `${filter.columnId}:${sub.key}`;
    const stats = columnFilterStats?.[statsKey];
    const allText = stats?.all?.type === "text" ? stats.all : null;
    const filtText = stats?.filtered?.type === "text" ? stats.filtered : null;

    const inTagsCls =
      "rounded border border-[var(--tag-blue-text)]/20 bg-[var(--tag-blue-bg)] px-1.5 py-0.5 text-[11px] text-[var(--tag-blue-text)] opacity-60 cursor-pointer transition-colors";
    const chipCls = (active: boolean) =>
      active
        ? "rounded border border-[var(--tag-blue-text)]/20 bg-[var(--tag-blue-bg)] px-1.5 py-0.5 text-[11px] text-[var(--tag-blue-text)] cursor-pointer transition-colors"
        : "rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors";

    const toggleTag = (s: string) => {
      updateDraft(sub.key, (d) => {
        const td = d as TextDraft;
        const tags = td.tags.includes(s) ? td.tags.filter((t) => t !== s) : [...td.tags, s];
        return { ...td, tags };
      });
    };

    const addTag = (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed.length === 0 || draft.tags.includes(trimmed)) return false;
      updateDraft(sub.key, (d) => {
        const td = d as TextDraft;
        return { ...td, tags: [...td.tags, trimmed], input: "" };
      });
      return true;
    };

    const applyWithPendingInput = () => {
      // Build result directly from current draft + pending input to avoid stale state
      const result: Record<string, ActiveFilterValue> = {};
      for (const sf of subFilters) {
        if (sf.key === sub.key) {
          // For this section, fold pending input into tags
          const trimmed = draft.input.trim();
          const tags =
            trimmed.length > 0 && !draft.tags.includes(trimmed)
              ? [...draft.tags, trimmed]
              : [...draft.tags];
          if (tags.length > 0) result[sf.key] = tags;
        } else {
          const val = draftToValue(drafts[sf.key]);
          if (val !== undefined) result[sf.key] = val;
        }
      }
      if (Object.keys(result).length === 0) {
        onRemove();
      } else {
        onChange(result);
      }
      setIsOpen(false);
    };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isModEnter = e.key === "Enter" && (e.metaKey || e.ctrlKey);
      if (isModEnter) {
        e.preventDefault();
        applyWithPendingInput();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (draft.input.trim().length === 0) {
          handleApply();
        } else if (draft.tags.length === 0) {
          addTag(draft.input);
          applyWithPendingInput();
        } else {
          addTag(draft.input);
        }
        return;
      }
      if (e.key === "Backspace" && draft.input.length === 0 && draft.tags.length > 0) {
        updateDraft(sub.key, (d) => {
          const td = d as TextDraft;
          return { ...td, tags: td.tags.slice(0, -1) };
        });
      }
    };

    const truncate = (s: string, max = 18) => (s.length > max ? s.slice(0, max) + "\u2026" : s);

    const renderTextRow = (label: string, textStats: typeof allText) => {
      if (!textStats) return null;
      const { samples, totalUnique } = textStats;
      const remaining = totalUnique - samples.length;
      return (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[40px]">
            {label}
          </span>
          {samples.map((s) => (
            <button
              key={s}
              type="button"
              className={draft.tags.includes(s) ? inTagsCls : chipCls(false)}
              onClick={() => toggleTag(s)}
            >
              {truncate(s)}
            </button>
          ))}
          {remaining > 0 && (
            <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[9px] text-[var(--text-tertiary)]">
              +{remaining}
            </span>
          )}
        </div>
      );
    };

    return (
      <>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] block mb-2">
          {labels.contains}
          {draft.tags.length >= 2 && (
            <span className="ml-1 text-[10px] font-semibold text-[var(--tag-blue-text)] bg-[var(--tag-blue-bg)] rounded px-1 py-0.5 uppercase">
              {labels.orBadge}
            </span>
          )}
        </span>
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-1.5 focus-within:border-[var(--border-focus)]">
          {draft.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 rounded bg-[var(--tag-blue-bg)] px-1.5 py-0.5 text-[11px] text-[var(--tag-blue-text)] max-w-[120px]"
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                className="ml-0.5 text-[var(--tag-blue-text)]/60 hover:text-[var(--tag-blue-text)] text-xs leading-none"
                onClick={() =>
                  updateDraft(sub.key, (d) => {
                    const td = d as TextDraft;
                    return { ...td, tags: td.tags.filter((t) => t !== tag) };
                  })
                }
              >
                ✕
              </button>
            </span>
          ))}
          <input
            autoFocus={subFilters.indexOf(sub) === 0}
            className="flex-1 min-w-[50px] bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
            placeholder={
              draft.tags.length === 0
                ? labels.searchPlaceholder
                : labels.addPlaceholder
            }
            value={draft.input}
            onChange={(e) =>
              updateDraft(sub.key, (prev) => ({ ...(prev as TextDraft), input: e.target.value }))
            }
            onKeyDown={handleTextKeyDown}
          />
        </div>
        {allText && (
          <div className="border-t border-[var(--border-subtle)] mt-3 pt-2 space-y-2">
            {renderTextRow(labels.statsAllPrefix, allText)}
            {filtText && (
              <div className="border-t border-[var(--border-subtle)] pt-1.5">
                {renderTextRow(labels.statsFilteredPrefix, filtText)}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderEnumSection = (sub: CompoundSubFilter, draft: EnumDraft) => {
    const statsKey = `${filter.columnId}:${sub.key}`;
    const stats = columnFilterStats?.[statsKey];
    const allEnum = stats?.all?.type === "enum" ? stats.all : null;
    const filtEnum = stats?.filtered?.type === "enum" ? stats.filtered : null;

    return (
      <div className="space-y-0.5">
        {sub.options?.map((option) => {
          const allCount = allEnum?.counts[option.value];
          const filtCount = filtEnum?.counts[option.value];
          return (
            <label
              key={option.value}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--bg-secondary)] rounded-md cursor-pointer transition-colors"
            >
              <Checkbox
                checked={draft.selected.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") return;
                  updateDraft(sub.key, (d) => {
                    const ed = d as EnumDraft;
                    return {
                      ...ed,
                      selected: checked
                        ? [...ed.selected, option.value]
                        : ed.selected.filter((v) => v !== option.value),
                    };
                  });
                }}
              />
              <span className="flex-1 text-sm text-[var(--text-primary)]">{option.label}</span>
              {allCount !== undefined && (
                <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
                  {filtCount !== undefined ? `${filtCount}\u2009/\u2009${allCount}` : allCount}
                </span>
              )}
            </label>
          );
        })}
      </div>
    );
  };

  const hasSectionValue = (key: string): boolean => {
    const draft = drafts[key];
    if (!draft) return false;
    if (draft.type === "number-range") return draft.from.trim() !== "" || draft.to.trim() !== "";
    if (draft.type === "enum") return draft.selected.length > 0;
    return draft.tags.length > 0 || draft.input.trim().length > 0;
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <FilterChip
          label={config.label}
          value={getDisplayValue()}
          onRemove={onRemove}
          active={!!getDisplayValue()}
          className={chipClassName}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={8}
        className="w-auto p-0 [box-shadow:var(--shadow-menu)] border-[var(--border-subtle)] flex flex-col max-h-[min(var(--radix-popover-content-available-height),520px)] overflow-hidden"
      >
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {subFilters.map((sub, idx) => (
            <div
              key={sub.key}
              className={`p-3 w-60 flex flex-col min-h-0 overflow-y-auto overscroll-contain ${idx > 0 ? "border-l border-[var(--border-subtle)]" : ""}`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                    {sub.label}
                  </span>
                  {sub.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                      {sub.badge}
                    </span>
                  )}
                </div>
                {hasSectionValue(sub.key) && (
                  <button
                    type="button"
                    className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                    onClick={() => handleResetSection(sub.key)}
                    title={labels.resetSectionTitle(sub.label)}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Section content */}
              {drafts[sub.key]?.type === "number-range" &&
                renderNumberRangeSection(sub, drafts[sub.key] as NumberRangeDraft)}
              {drafts[sub.key]?.type === "text" &&
                renderTextSection(sub, drafts[sub.key] as TextDraft)}
              {drafts[sub.key]?.type === "enum" &&
                renderEnumSection(sub, drafts[sub.key] as EnumDraft)}
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 bg-[var(--bg-surface)]">
          <FilterPopoverFooter
            onApply={handleApply}
            onClear={handleClearAll}
            labels={footerLabels}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
