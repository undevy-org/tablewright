import type { ColumnMetaDef } from "../../../components/data-table/types";

import type { ColumnFilterConfig, LiveTabKey } from "./types";

export const liveTabs: Array<{ key: LiveTabKey; label: string }> = [
  { key: "merchants", label: "Merchants" },
  { key: "balances", label: "Balances" },
  { key: "statistics", label: "Statistics" },
  { key: "widgets", label: "Widgets" },
  { key: "reports", label: "Reports" },
  { key: "bank-block-lists", label: "Bank Block Lists" },
  { key: "merchant-rate-settings", label: "Merchant Rate Settings" },
  { key: "merchant-withdraw-fees", label: "Merchant Withdraw Fees" },
  { key: "request-logs", label: "Request Logs" },
];

export const merchantRowsPerPageOptions = [15, 30, 60, 100] as const;
export const merchantsEmptyMessage =
  "No merchants match the current search, status, and date filters.";

export const merchantColumnMeta: Record<string, ColumnMetaDef> = {
  rowControl: { minW: 80, sticky: "left", stickyOffset: 0, variant: "control" },
  actions: { minW: 72, sticky: "right", stickyOffset: 0 },
  merchant: { minW: 288 },
  spamBlock: { minW: 188 },
  traffic: { minW: 190 },
  balance: { minW: 190 },
  status: { minW: 136 },
  createdAt: { minW: 156 },
  updatedAt: { minW: 156 },
};

export const merchantToggleableColumnIds = [
  "merchant",
  "spamBlock",
  "traffic",
  "balance",
  "status",
  "createdAt",
  "updatedAt",
] as const;

export const merchantColumnLabels: Record<(typeof merchantToggleableColumnIds)[number], string> = {
  merchant: "Name / ID",
  spamBlock: "Block Expires",
  traffic: "Traffic Type",
  balance: "Balance Type",
  status: "Status",
  createdAt: "Created",
  updatedAt: "Updated",
};

export const merchantColumnFilters: Record<string, ColumnFilterConfig> = {
  merchant: {
    type: "compound",
    label: "Name / ID",
    subFilters: [
      { key: "name", type: "text", label: "Name", field: "name" },
      { key: "id", type: "text", label: "ID", field: "id" },
    ],
  },
  status: {
    type: "enum",
    label: "Status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Blocked", value: "BLOCKED" },
      { label: "Deleted", value: "DELETED" },
    ],
  },
  traffic: {
    type: "enum",
    label: "Traffic Type",
    fieldName: "trafficType",
    options: [
      { label: "Low Risk", value: "TRAFFIC_LOW_RISK" },
      { label: "Medium Risk", value: "TRAFFIC_MEDIUM_RISK" },
      { label: "High Risk", value: "TRAFFIC_HIGH_RISK" },
    ],
  },
  balance: {
    type: "enum",
    label: "Balance Type",
    fieldName: "balanceType",
    options: [
      { label: "Crypto", value: "BALANCE_CRYPTO" },
      { label: "Fiat", value: "BALANCE_FIAT" },
      { label: "Crypto Deposit", value: "BALANCE_CRYPTO_DEPOSIT" },
      { label: "Fiat Deposit", value: "BALANCE_FIAT_DEPOSIT" },
    ],
  },
  createdAt: { type: "date", label: "Created At" },
  updatedAt: { type: "date", label: "Updated At" },
  spamBlock: { type: "date", label: "Spam Block", fieldName: "spamBlockExpiration" },
};
