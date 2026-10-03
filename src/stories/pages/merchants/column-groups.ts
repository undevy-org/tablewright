import type { ColumnGroup } from "../../../components/data-table/filter-types";

export const MERCHANT_COLUMN_GROUPS: ColumnGroup[] = [
  {
    key: "identity",
    label: "Identity",
    columnIds: ["merchant", "status"],
  },
  {
    key: "config",
    label: "Configuration",
    columnIds: ["traffic", "balance", "spamBlock"],
  },
  {
    key: "time",
    label: "Time",
    columnIds: ["createdAt", "updatedAt"],
  },
];
