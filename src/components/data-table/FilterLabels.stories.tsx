import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppliedStateChips } from "./AppliedStateChips";
import { ColumnFilterPopover } from "./ColumnFilterPopover";
import { CompoundFilterPopover } from "./CompoundFilterPopover";
import { FilterFormPanel } from "./FilterFormPanel";
import { FilterPopoverFooter } from "./FilterPopoverFooter";
import type { ActiveFilter, ColumnFilterConfig } from "./filter-types";

const footerLabelsRu = {
  apply: "Применить",
  clear: "Сбросить",
};

const columnFilterLabelsRu = {
  searchPlaceholder: "Поиск…",
  addValuePlaceholder: "Добавить…",
  noData: "нет данных",
  statsAllPrefix: "Все:",
  statsFilteredPrefix: "Отфильтр.:",
  statsTextAllPrefix: "напр. Все:",
  statsTextFilteredPrefix: "напр. Отф.:",
  chipFrom: "с",
  chipTo: "по",
  chipMin: "мин",
  chipMax: "макс",
  contains: "Содержит",
  orBadge: "ИЛИ",
  numberInputPlaceholder: "0",
  valuesCount: (n: number) => `${n} знач.`,
  selectedCount: (n: number) => `${n} выбрано`,
};

const compoundFilterLabelsRu = {
  searchPlaceholder: "Поиск…",
  addPlaceholder: "Добавить…",
  contains: "Содержит",
  orBadge: "ИЛИ",
  chipMin: "мин",
  chipMax: "макс",
  statsAllPrefix: "Все:",
  statsFilteredPrefix: "Отф.:",
  numberInputPlaceholder: "0",
  resetSectionTitle: (subLabel: string) => `Сбросить ${subLabel}`,
  filtersCount: (n: number) => `${n} фильтров`,
  subValuesCount: (n: number) => `${n} знач.`,
  subSelectedCount: (n: number) => `${n} выбрано`,
};

const appliedChipsLabelsRu = {
  clearAll: "Очистить всё",
  columns: "Колонки",
  hiddenCount: (n: number) => `${n} скрыто`,
};

const formPanelLabelsRu = {
  closeFiltersAriaLabel: "Закрыть фильтры",
  closeFiltersTitle: "Закрыть фильтры",
  apply: "Применить",
  clear: "Сбросить",
  anyPlaceholder: "Любой",
  rangeFromPlaceholder: "От",
  rangeToPlaceholder: "До",
  fieldRangeFromAriaLabel: (fieldLabel: string) => `${fieldLabel} — с`,
  fieldRangeToAriaLabel: (fieldLabel: string) => `${fieldLabel} — по`,
  compoundSubRangeFromAriaLabel: (subLabel: string) => `${subLabel} — с`,
  compoundSubRangeToAriaLabel: (subLabel: string) => `${subLabel} — по`,
  compoundSubRangeFromPlaceholder: (subLabel: string) => `${subLabel} от`,
  compoundSubRangeToPlaceholder: (subLabel: string) => `${subLabel} до`,
  multiValueFormHint:
    "Несколько значений — редактируйте в чипах или попапе фильтра колонки над таблицей.",
  valuesCount: (n: number) => `${n} знач.`,
  selectedCount: (n: number) => `${n} выбрано`,
  clearFieldForSingleEdit: "Сбросить, чтобы ввести одно значение",
};

const filterConfigs: Record<string, ColumnFilterConfig> = {
  status: {
    type: "enum",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Paused", value: "paused" },
    ],
  },
  amount: { type: "number-range", label: "Amount" },
  note: { type: "text", label: "Note" },
  bundle: {
    type: "compound",
    label: "Bundle",
    subFilters: [
      { key: "q", type: "text", label: "Query", field: "q" },
      {
        key: "tier",
        type: "enum",
        label: "Tier",
        field: "tier",
        options: [{ label: "A", value: "a" }],
      },
    ],
  },
};

const meta: Meta = {
  title: "DataTable/FilterLabels",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function LocalizedFilterLabelsDemo() {
  const [filters, setFilters] = React.useState<ActiveFilter[]>([
    { columnId: "status", value: ["active"] },
    { columnId: "amount", value: { from: 10, to: 100 } },
    { columnId: "note", value: ["alpha"] },
    { columnId: "bundle", value: { q: ["x"] } },
  ]);

  const setFilter = (columnId: string, value: ActiveFilter["value"]) => {
    setFilters((prev) => {
      const rest = prev.filter((f) => f.columnId !== columnId);
      return [...rest, { columnId, value }];
    });
  };

  return (
    <div className="tablewright max-w-4xl space-y-8 p-4">
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Filter form panel</h3>
        <FilterFormPanel
          filterConfigs={filterConfigs}
          fields={["status", "amount", "note"]}
          filters={filters}
          title="Фильтры"
          onApply={() => undefined}
          onClear={() => undefined}
          onClose={() => undefined}
          labels={formPanelLabelsRu}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Applied chips + popovers</h3>
        <AppliedStateChips
          filters={filters}
          configs={filterConfigs}
          newestColumnId={null}
          onRemoveFilter={(id) => setFilters((prev) => prev.filter((f) => f.columnId !== id))}
          onChangeFilter={setFilter}
          currentSort={null}
          columnLabels={{}}
          onRemoveSort={() => undefined}
          hiddenColumnsCount={2}
          onResetColumns={() => undefined}
          customFilterChip={null}
          onRemoveCustomFilter={() => undefined}
          onClearAll={() => setFilters([])}
          labels={appliedChipsLabelsRu}
          columnFilterLabels={columnFilterLabelsRu}
          compoundFilterLabels={compoundFilterLabelsRu}
          filterPopoverFooterLabels={footerLabelsRu}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Standalone popovers</h3>
        <div className="flex flex-wrap gap-3">
          <ColumnFilterPopover
            config={filterConfigs.note}
            filter={{ columnId: "note", value: [] }}
            onChange={() => undefined}
            onRemove={() => undefined}
            initialOpen
            labels={columnFilterLabelsRu}
            footerLabels={footerLabelsRu}
          />
          <CompoundFilterPopover
            config={filterConfigs.bundle}
            filter={{ columnId: "bundle", value: {} }}
            onChange={() => undefined}
            onRemove={() => undefined}
            labels={compoundFilterLabelsRu}
            footerLabels={footerLabelsRu}
          />
        </div>
      </section>

      <section>
        <FilterPopoverFooter
          onApply={() => undefined}
          onClear={() => undefined}
          labels={footerLabelsRu}
        />
      </section>
    </div>
  );
}

export const RussianOverrides: Story = {
  render: () => <LocalizedFilterLabelsDemo />,
};
