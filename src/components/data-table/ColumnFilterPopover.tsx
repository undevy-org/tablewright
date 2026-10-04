import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FilterChipPopoverTrigger } from "./FilterChipPopoverTrigger";
import { FilterPopoverFooter, type FilterPopoverFooterLabels } from "./FilterPopoverFooter";
import type {
  ActiveFilter,
  ColumnFilterConfig,
  ActiveFilterValue,
  FilterStatsSlice,
} from "./filter-types";
import { getDateRange, getNumberRange, getStringArray, isFilterValueEmpty } from "./filter-values";

export interface ColumnFilterPopoverLabels {
  searchPlaceholder: string;
  addValuePlaceholder: string;
  noData: string;
  statsAllPrefix: string;
  statsFilteredPrefix: string;
  statsTextAllPrefix: string;
  statsTextFilteredPrefix: string;
  chipFrom: string;
  chipTo: string;
  chipMin: string;
  chipMax: string;
  contains: string;
  orBadge: string;
  numberInputPlaceholder: string;
  valuesCount: (n: number) => string;
  selectedCount: (n: number) => string;
}

const DEFAULT_LABELS: ColumnFilterPopoverLabels = {
  searchPlaceholder: "Search...",
  addValuePlaceholder: "Add value...",
  noData: "no data",
  statsAllPrefix: "All:",
  statsFilteredPrefix: "Filtered:",
  statsTextAllPrefix: "e.g. All:",
  statsTextFilteredPrefix: "e.g. Filt:",
  chipFrom: "from",
  chipTo: "to",
  chipMin: "min",
  chipMax: "max",
  contains: "Contains",
  orBadge: "OR",
  numberInputPlaceholder: "0",
  valuesCount: (n: number) => `${n} values`,
  selectedCount: (n: number) => `${n} selected`,
};

interface ColumnFilterPopoverProps {
  config: ColumnFilterConfig;
  filter: ActiveFilter;
  onChange: (value: ActiveFilterValue) => void;
  onRemove: () => void;
  initialOpen?: boolean;
  chipClassName?: string;
  stats?: FilterStatsSlice;
  requestOpen?: boolean;
  onRequestOpenHandled?: () => void;
  labels?: Partial<ColumnFilterPopoverLabels>;
  footerLabels?: Partial<FilterPopoverFooterLabels>;
}

function formatChipDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function isEmptyValue(value: ActiveFilterValue, type: ColumnFilterConfig["type"]): boolean {
  if (type === "text" || type === "enum") return isFilterValueEmpty(getStringArray(value));
  if (type === "date") return isFilterValueEmpty(getDateRange(value));
  if (type === "number-range") return isFilterValueEmpty(getNumberRange(value));
  return true;
}

function dateDraft(value: ActiveFilterValue): { from: string; to: string } {
  const { from = "", to = "" } = getDateRange(value);
  return { from, to };
}

function numberDraft(bound: number | undefined): string {
  return bound !== undefined ? String(bound) : "";
}

export function ColumnFilterPopover({
  config,
  filter,
  onChange,
  onRemove,
  initialOpen = false,
  chipClassName,
  stats,
  requestOpen,
  onRequestOpenHandled,
  labels: labelOverrides,
  footerLabels,
}: ColumnFilterPopoverProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [isOpen, setIsOpen] = useState(false);
  const onRequestOpenHandledRef = useRef(onRequestOpenHandled);
  useEffect(() => {
    onRequestOpenHandledRef.current = onRequestOpenHandled;
  });

  // Delay auto-open to next tick so DropdownMenu dismiss events fire first
  useEffect(() => {
    if (!initialOpen) return;
    const id = setTimeout(() => setIsOpen(true), 0);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Programmatic open from external trigger (e.g. filter menu click on active item)
  useEffect(() => {
    if (!requestOpen) return;
    const id = setTimeout(() => {
      setIsOpen(true);
      onRequestOpenHandledRef.current?.();
    }, 0);
    return () => clearTimeout(id);
  }, [requestOpen]);

  // Draft state — separate from committed filter.value
  const [draftTags, setDraftTags] = useState<string[]>(
    config.type === "text" ? getStringArray(filter.value) : [],
  );
  const [draftInput, setDraftInput] = useState("");
  const [draftEnum, setDraftEnum] = useState<string[]>(getStringArray(filter.value));
  const [draftDate, setDraftDate] = useState(dateDraft(filter.value));
  const [draftNumberFrom, setDraftNumberFrom] = useState(
    numberDraft(getNumberRange(filter.value).from),
  );
  const [draftNumberTo, setDraftNumberTo] = useState(numberDraft(getNumberRange(filter.value).to));

  const resetDrafts = (value: ActiveFilterValue) => {
    setDraftTags(config.type === "text" ? getStringArray(value) : []);
    setDraftInput("");
    setDraftEnum(getStringArray(value));
    setDraftDate(dateDraft(value));
    const numVal = getNumberRange(value);
    setDraftNumberFrom(numberDraft(numVal.from));
    setDraftNumberTo(numberDraft(numVal.to));
  };

  // The committed value can change from outside (filter form, preset, clear
  // all) while the popover is closed — re-seed the drafts so it opens on it.
  const [draftSource, setDraftSource] = useState(filter.value);
  if (!isOpen && draftSource !== filter.value) {
    setDraftSource(filter.value);
    resetDrafts(filter.value);
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Closing without Apply: remove chip if no committed value yet
      if (isEmptyValue(filter.value, config.type)) {
        onRemove();
        return;
      }
      // Otherwise reset draft to the committed value
      resetDrafts(filter.value);
    }
    setIsOpen(nextOpen);
  };

  const handleApply = () => {
    let value: ActiveFilterValue;
    switch (config.type) {
      case "text": {
        const trimmed = draftInput.trim();
        const all =
          trimmed.length > 0 && !draftTags.includes(trimmed)
            ? [...draftTags, trimmed]
            : [...draftTags];
        value = all;
        break;
      }
      case "enum":
        value = draftEnum;
        break;
      case "date":
        value = draftDate;
        break;
      case "number-range": {
        const from = draftNumberFrom.trim() !== "" ? Number(draftNumberFrom) : undefined;
        const to = draftNumberTo.trim() !== "" ? Number(draftNumberTo) : undefined;
        value = { from, to };
        break;
      }
      default:
        return;
    }
    if (isEmptyValue(value, config.type)) {
      onRemove();
    } else {
      onChange(value);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setDraftTags([]);
    setDraftInput("");
    setDraftEnum([]);
    setDraftDate({ from: "", to: "" });
    setDraftNumberFrom("");
    setDraftNumberTo("");
  };

  const renderContent = () => {
    const allStats = stats?.all ?? null;
    const filteredStats = stats?.filtered ?? null;

    const chipCls = (active: boolean) =>
      active
        ? "rounded border border-[var(--tag-blue-text)]/20 bg-[var(--tag-blue-bg)] px-1.5 py-0.5 text-[11px] text-[var(--tag-blue-text)] cursor-pointer transition-colors"
        : "rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors";

    const truncate = (s: string, max = 20) => (s.length > max ? s.slice(0, max) + "\u2026" : s);

    switch (config.type) {
      case "text": {
        const inTagsCls =
          "rounded border border-[var(--tag-blue-text)]/20 bg-[var(--tag-blue-bg)] px-1.5 py-0.5 text-[11px] text-[var(--tag-blue-text)] opacity-60 cursor-pointer transition-colors";

        const toggleTag = (s: string) => {
          setDraftTags((prev) => (prev.includes(s) ? prev.filter((t) => t !== s) : [...prev, s]));
        };

        const addTag = (raw: string) => {
          const trimmed = raw.trim();
          if (trimmed.length === 0 || draftTags.includes(trimmed)) return false;
          setDraftTags((prev) => [...prev, trimmed]);
          setDraftInput("");
          return true;
        };

        const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          const isModEnter = e.key === "Enter" && (e.metaKey || e.ctrlKey);
          if (isModEnter) {
            e.preventDefault();
            handleApply();
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            if (draftInput.trim().length === 0) {
              handleApply();
            } else if (draftTags.length === 0) {
              addTag(draftInput);
              handleApply();
            } else {
              addTag(draftInput);
            }
            return;
          }
          if (e.key === "Backspace" && draftInput.length === 0 && draftTags.length > 0) {
            setDraftTags((prev) => prev.slice(0, -1));
          }
        };

        const renderTextRow = (label: string, textStats: typeof allStats) => {
          if (!textStats || textStats.type !== "text") {
            return (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                  {label}
                </span>
                <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--text-tertiary)] italic">
                  {labels.noData}
                </span>
              </div>
            );
          }
          const { samples, totalUnique } = textStats;
          const remaining = totalUnique - samples.length;
          return (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                {label}
              </span>
              {samples.map((s) => {
                const isInTags = draftTags.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={isInTags ? inTagsCls : chipCls(false)}
                    onClick={() => toggleTag(s)}
                  >
                    {truncate(s)}
                  </button>
                );
              })}
              {remaining > 0 && (
                <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[9px] text-[var(--text-tertiary)]">
                  +{remaining}
                </span>
              )}
            </div>
          );
        };

        const allText = allStats?.type === "text" ? allStats : null;
        const filtText = filteredStats?.type === "text" ? filteredStats : null;

        return (
          <div className="p-3 w-64 space-y-3">
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider block">
              {labels.contains}
              {draftTags.length >= 2 && (
                <span className="ml-1 text-[10px] font-semibold text-[var(--tag-blue-text)] bg-[var(--tag-blue-bg)] rounded px-1 py-0.5 uppercase">
                  {labels.orBadge}
                </span>
              )}
            </span>
            <div className="flex flex-wrap items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-1.5 focus-within:border-[var(--border-focus)]">
              {draftTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded bg-[var(--tag-blue-bg)] px-1.5 py-0.5 text-[11px] text-[var(--tag-blue-text)] max-w-[140px]"
                >
                  <span className="truncate">{tag}</span>
                  <button
                    type="button"
                    className="ml-0.5 text-[var(--tag-blue-text)]/60 hover:text-[var(--tag-blue-text)] text-xs leading-none"
                    onClick={() => setDraftTags((prev) => prev.filter((t) => t !== tag))}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                autoFocus
                className="flex-1 min-w-[60px] bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                placeholder={
                  draftTags.length === 0
                    ? labels.searchPlaceholder
                    : labels.addValuePlaceholder
                }
                value={draftInput}
                onChange={(e) => setDraftInput(e.target.value)}
                onKeyDown={handleTextKeyDown}
              />
            </div>
            {allText && (
              <div className="border-t border-[var(--border-subtle)] pt-2 space-y-2">
                {renderTextRow(labels.statsTextAllPrefix, allText)}
                {filteredStats !== null && (
                  <div className="border-t border-[var(--border-subtle)] pt-1.5">
                    {renderTextRow(labels.statsTextFilteredPrefix, filtText)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case "enum": {
        const enumAllStats = allStats?.type === "enum" ? allStats : null;
        const enumFiltStats = filteredStats?.type === "enum" ? filteredStats : null;
        return (
          <div className="p-2 w-56 space-y-1">
            {config.options?.map((option) => {
              const allCount = enumAllStats?.counts[option.value];
              const filtCount = enumFiltStats?.counts[option.value];
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--bg-secondary)] rounded-md cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={draftEnum.includes(option.value)}
                    onCheckedChange={(checked) => {
                      setDraftEnum((prev) =>
                        checked ? [...prev, option.value] : prev.filter((v) => v !== option.value),
                      );
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
      }

      case "date": {
        const renderDateRow = (label: string, dateStats: typeof allStats) => {
          if (!dateStats || dateStats.type !== "date") {
            return (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                  {label}
                </span>
                <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--text-tertiary)] italic">
                  {labels.noData}
                </span>
              </div>
            );
          }
          const { min, max } = dateStats;
          if (min === max) {
            const isActive = draftDate.from === min && draftDate.to === min;
            return (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                  {label}
                </span>
                <button
                  type="button"
                  className={chipCls(isActive)}
                  onClick={() => setDraftDate({ from: min, to: min })}
                >
                  {formatChipDate(min)}
                </button>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                {label}
              </span>
              <button
                type="button"
                className={chipCls(draftDate.from === min)}
                onClick={() => setDraftDate((prev) => ({ ...prev, from: min }))}
              >
                {labels.chipFrom} {formatChipDate(min)}
              </button>
              <button
                type="button"
                className={chipCls(draftDate.to === max)}
                onClick={() => setDraftDate((prev) => ({ ...prev, to: max }))}
              >
                {labels.chipTo} {formatChipDate(max)}
              </button>
            </div>
          );
        };

        const allDate = allStats?.type === "date" ? allStats : null;
        const filtDate = filteredStats?.type === "date" ? filteredStats : null;

        return (
          <div className="p-3 w-64 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider block">
                {labels.chipFrom}
              </span>
              <Input
                type="date"
                value={draftDate.from}
                onChange={(e) => setDraftDate((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider block">
                {labels.chipTo}
              </span>
              <Input
                type="date"
                value={draftDate.to}
                onChange={(e) => setDraftDate((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
            {allDate && (
              <div className="border-t border-[var(--border-subtle)] pt-2 space-y-2">
                {renderDateRow(labels.statsAllPrefix, allDate)}
                {filteredStats !== null && (
                  <div className="border-t border-[var(--border-subtle)] pt-1.5">
                    {renderDateRow(labels.statsFilteredPrefix, filtDate)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case "number-range": {
        const renderNumRow = (label: string, numStats: typeof allStats) => {
          if (!numStats || numStats.type !== "number-range") {
            return (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                  {label}
                </span>
                <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--text-tertiary)] italic">
                  {labels.noData}
                </span>
              </div>
            );
          }
          const { min, max } = numStats;
          if (min === max) {
            const isActive = draftNumberFrom === String(min) && draftNumberTo === String(min);
            return (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                  {label}
                </span>
                <button
                  type="button"
                  className={chipCls(isActive)}
                  onClick={() => {
                    setDraftNumberFrom(String(min));
                    setDraftNumberTo(String(min));
                  }}
                >
                  {min}
                </button>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap min-w-[54px]">
                {label}
              </span>
              <button
                type="button"
                className={chipCls(draftNumberFrom === String(min))}
                onClick={() => setDraftNumberFrom(String(min))}
              >
                {labels.chipMin} {min}
              </button>
              <button
                type="button"
                className={chipCls(draftNumberTo === String(max))}
                onClick={() => setDraftNumberTo(String(max))}
              >
                {labels.chipMax} {max}
              </button>
            </div>
          );
        };

        const allNum = allStats?.type === "number-range" ? allStats : null;
        const filtNum = filteredStats?.type === "number-range" ? filteredStats : null;

        return (
          <div className="p-3 w-64 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider block">
                {labels.chipMin}
              </span>
              <Input
                type="number"
                autoFocus
                placeholder={allNum ? String(allNum.min) : labels.numberInputPlaceholder}
                value={draftNumberFrom}
                onChange={(e) => setDraftNumberFrom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider block">
                {labels.chipMax}
              </span>
              <Input
                type="number"
                placeholder={allNum ? String(allNum.max) : labels.numberInputPlaceholder}
                value={draftNumberTo}
                onChange={(e) => setDraftNumberTo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
              />
            </div>
            {allNum && (
              <div className="border-t border-[var(--border-subtle)] pt-2 space-y-2">
                {renderNumRow(labels.statsAllPrefix, allNum)}
                {filteredStats !== null && (
                  <div className="border-t border-[var(--border-subtle)] pt-1.5">
                    {renderNumRow(labels.statsFilteredPrefix, filtNum)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getDisplayValue = () => {
    const { value } = filter;
    if (isEmptyValue(value, config.type)) return undefined;

    if (config.type === "text" && Array.isArray(value)) {
      if (value.length === 1) {
        return value[0].length > 20 ? `${value[0].slice(0, 20)}…` : value[0];
      }
      if (value.length === 2) {
        const joined = value.join(", ");
        return joined.length > 24 ? labels.valuesCount(value.length) : joined;
      }
      return labels.valuesCount(value.length);
    }

    if (config.type === "enum" && Array.isArray(value)) {
      if (value.length === 1) {
        return config.options?.find((o) => o.value === value[0])?.label ?? value[0];
      }
      return labels.selectedCount(value.length);
    }

    if (config.type === "date") {
      const { from, to } = getDateRange(value);
      if (from && to) return `${from} \u2014 ${to}`;
      if (from) return `${labels.chipFrom} ${from}`;
      if (to) return `${labels.chipTo} ${to}`;
    }

    if (config.type === "number-range") {
      const { from, to } = getNumberRange(value);
      if (from !== undefined && to !== undefined) return `${from}\u2013${to}`;
      if (from !== undefined) return `\u2265${from}`;
      if (to !== undefined) return `\u2264${to}`;
    }

    return undefined;
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <FilterChipPopoverTrigger
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
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{renderContent()}</div>
        <div className="flex-shrink-0 bg-[var(--bg-surface)]">
          <FilterPopoverFooter
            onApply={handleApply}
            onClear={handleClear}
            labels={footerLabels}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
