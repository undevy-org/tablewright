import type { ColumnMetaDef } from "../../../components/data-table/types";
import type { ColumnFilterConfig } from "../../../components/data-table/filter-types";
import { formatEnumLabel } from "../../../lib/format-enum";
import { formatDirectionLabel, formatStatusLabel } from "./adapters";
import type { TxDirection, TxStatus } from "./types";
import { TX_STATUSES, TX_DIRECTIONS, PAYMENT_METHODS } from "./types";

export const transactionColumnMeta: Record<string, ColumnMetaDef> = {
  rowControl: { minW: 80, sticky: "left", stickyOffset: 0, variant: "control" },
  actions: { minW: 72, sticky: "right", stickyOffset: 0 },
  txId: { minW: 160 },
  direction: { minW: 110 },
  status: { minW: 140 },
  merchant: { minW: 220 },
  amount: { minW: 160 },
  paymentMethod: { minW: 150 },
  geo: { minW: 80 },
  createdAt: { minW: 156 },
  updatedAt: { minW: 156 },
  completedAt: { minW: 156 },
  provider: { minW: 200 },
  merchantId: { minW: 160 },
  merchantClientId: { minW: 130 },
  feePct: { minW: 130 },
  rate: { minW: 140 },
  merchantOut: { minW: 160 },
  providerOut: { minW: 160 },
  baseRate: { minW: 160 },
  paymentSystem: { minW: 140 },
  requisite: { minW: 180 },
  paymentExpiresAt: { minW: 156 },
  widgetId: { minW: 130 },
  bankNameRequested: { minW: 140 },
  inAmount: { minW: 160 },
  outCurrency: { minW: 100 },
  fee: { minW: 160 },
  inAmountInitial: { minW: 140 },
  isVariableAmount: { minW: 120 },
  isBalanceReleased: { minW: 130 },
  isBalanceReserved: { minW: 130 },
  isRequisitePool: { minW: 120 },
  isManualConfirmed: { minW: 130 },
};

// All columns except rowControl and actions.
// Order mirrors the rendered table order in columns.tsx: business fields
// first, time block last.
export const transactionToggleableColumnIds = [
  "txId",
  "status",
  "direction",
  "paymentMethod",
  "merchant",
  "amount",
  "geo",
  "merchantId",
  "merchantClientId",
  "feePct",
  "rate",
  "merchantOut",
  "provider",
  "providerOut",
  "baseRate",
  "paymentSystem",
  "requisite",
  "widgetId",
  "bankNameRequested",
  "inAmount",
  "outCurrency",
  "fee",
  "inAmountInitial",
  "isVariableAmount",
  "isBalanceReleased",
  "isBalanceReserved",
  "isRequisitePool",
  "isManualConfirmed",
  "createdAt",
  "updatedAt",
  "completedAt",
  "paymentExpiresAt",
] as const;

export const transactionColumnLabels: Record<string, string> = {
  txId: "TX ID",
  direction: "Direction",
  status: "Status",
  merchant: "Name / TX ID",
  amount: "Amount",
  paymentMethod: "Pay Method",
  geo: "Geo",
  createdAt: "Created",
  merchantId: "Merchant ID",
  merchantClientId: "Client ID",
  merchantOut: "Merchant Out",
  provider: "Name / TX ID",
  providerOut: "Provider Out",
  baseRate: "Base Rate",
  paymentSystem: "Payment System",
  requisite: "Requisite",
  paymentExpiresAt: "Expires At",
  widgetId: "Widget ID",
  bankNameRequested: "Bank",
  inAmount: "In Amount",
  outCurrency: "Out Currency",
  fee: "Fee",
  inAmountInitial: "Initial Amount",
  isVariableAmount: "Variable Amount",
  isBalanceReleased: "Balance Released",
  isBalanceReserved: "Balance Reserved",
  isRequisitePool: "Requisite Pool",
  isManualConfirmed: "Manual Confirmed",
  updatedAt: "Updated At",
  completedAt: "Completed At",
  feePct: "Fee %",
  rate: "Rate",
};

export const transactionColumnFilters: Record<string, ColumnFilterConfig> = {
  // --- enum filters ---
  status: {
    type: "enum",
    label: "Status",
    options: TX_STATUSES.map((s) => ({
      label: formatStatusLabel(s as TxStatus),
      value: s,
    })),
  },
  direction: {
    type: "enum",
    label: "Direction",
    options: TX_DIRECTIONS.map((d) => ({
      label: formatDirectionLabel(d as TxDirection),
      value: d,
    })),
  },
  geo: {
    type: "enum",
    label: "Geo",
    options: [
      { label: "Brazil", value: "BR" },
      { label: "Mexico", value: "MX" },
      { label: "Indonesia", value: "ID" },
      { label: "Vietnam", value: "VN" },
      { label: "Nigeria", value: "NG" },
      { label: "Philippines", value: "PH" },
      { label: "Egypt", value: "EG" },
    ],
  },
  paymentMethod: {
    type: "enum",
    label: "Payment Method",
    options: PAYMENT_METHODS.map((m) => ({
      label: formatEnumLabel(m),
      value: m,
    })),
  },
  // --- boolean filters (stored as enum with "true"/"false") ---
  isVariableAmount: {
    type: "enum",
    label: "Variable Amount",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  isBalanceReleased: {
    type: "enum",
    label: "Balance Released",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  isBalanceReserved: {
    type: "enum",
    label: "Balance Reserved",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  isRequisitePool: {
    type: "enum",
    label: "Requisite Pool",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  isManualConfirmed: {
    type: "enum",
    label: "Manual Confirmed",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  // --- compound filters ---
  merchant: {
    type: "compound",
    label: "Name / TX ID",
    subFilters: [
      { key: "merchantName", type: "text", label: "Name", field: "merchantName" },
      { key: "merchantTxId", type: "text", label: "TX ID", field: "merchantTxId" },
    ],
  },
  fee: {
    type: "compound",
    label: "Fee",
    subFilters: [
      { key: "feeAmount", type: "number-range", label: "Fee", field: "feeAmount" },
      {
        key: "feeAmountConfirmed",
        type: "number-range",
        label: "Confirmed",
        field: "feeAmountConfirmed",
      },
    ],
  },
  baseRate: {
    type: "compound",
    label: "Base Rate",
    subFilters: [
      { key: "baseRate", type: "number-range", label: "Rate", field: "baseRate" },
      {
        key: "baseRateType",
        type: "enum",
        label: "Type",
        field: "baseRateType",
        options: [
          { label: "Market", value: "MARKET" },
          { label: "Fixed", value: "FIXED" },
          { label: "Floating", value: "FLOATING" },
        ],
      },
    ],
  },
  requisite: {
    type: "compound",
    label: "Requisite",
    subFilters: [
      { key: "paymentRequisite", type: "text", label: "Requisite", field: "paymentRequisite" },
      {
        key: "paymentRequisiteFullName",
        type: "text",
        label: "Full Name",
        field: "paymentRequisiteFullName",
      },
    ],
  },
  feePct: {
    type: "compound",
    label: "Fee %",
    subFilters: [
      {
        key: "merchantFeePct",
        type: "number-range",
        label: "Merchant Fee %",
        field: "merchantFeePct",
      },
      {
        key: "providerFeePct",
        type: "number-range",
        label: "Provider Fee %",
        field: "providerFeePct",
      },
    ],
  },
  rate: {
    type: "compound",
    label: "Rate",
    subFilters: [
      { key: "merchantRate", type: "number-range", label: "Merchant Rate", field: "merchantRate" },
      { key: "providerRate", type: "number-range", label: "Provider Rate", field: "providerRate" },
    ],
  },
  provider: {
    type: "compound",
    label: "Name / TX ID",
    subFilters: [
      { key: "provider", type: "text", label: "Name", field: "provider" },
      { key: "providerTxId", type: "text", label: "TX ID", field: "providerTxId" },
    ],
  },
  // --- text filters ---
  txId: { type: "text", label: "TX ID" },
  merchantId: { type: "text", label: "Merchant ID" },
  merchantClientId: { type: "text", label: "Client ID" },
  paymentSystem: { type: "text", label: "Payment System" },
  widgetId: { type: "text", label: "Widget ID" },
  bankNameRequested: { type: "text", label: "Bank" },
  outCurrency: { type: "text", label: "Out Currency" },
  // --- number-range filters ---
  amount: {
    type: "compound",
    label: "Amount",
    subFilters: [
      {
        key: "inAmount",
        type: "number-range",
        label: "In Amount",
        badge: "RUB",
        field: "inAmount",
      },
      {
        key: "merchantOutAmount",
        type: "number-range",
        label: "Out Amount",
        badge: "USDT",
        field: "merchantOutAmount",
      },
    ],
  },
  inAmount: {
    type: "compound",
    label: "In Amount",
    subFilters: [
      { key: "inAmount", type: "number-range", label: "Amount", field: "inAmount" },
      {
        key: "inAmountConfirmed",
        type: "number-range",
        label: "Confirmed",
        field: "inAmountConfirmed",
      },
    ],
  },
  inAmountInitial: { type: "number-range", label: "Initial Amount" },
  merchantOut: {
    type: "compound",
    label: "Merchant Out",
    subFilters: [
      {
        key: "merchantOutAmount",
        type: "number-range",
        label: "Amount",
        field: "merchantOutAmount",
      },
      {
        key: "merchantOutAmountConfirmed",
        type: "number-range",
        label: "Confirmed",
        field: "merchantOutAmountConfirmed",
      },
    ],
  },
  providerOut: {
    type: "compound",
    label: "Provider Out",
    subFilters: [
      {
        key: "providerOutAmount",
        type: "number-range",
        label: "Amount",
        field: "providerOutAmount",
      },
      {
        key: "providerOutAmountConfirmed",
        type: "number-range",
        label: "Confirmed",
        field: "providerOutAmountConfirmed",
      },
    ],
  },
  // --- date filters ---
  createdAt: { type: "date", label: "Created At" },
  updatedAt: { type: "date", label: "Updated At" },
  completedAt: { type: "date", label: "Completed At" },
  paymentExpiresAt: { type: "date", label: "Payment Expires At" },
};

export const transactionRowsPerPageOptions = [15, 30, 60, 100] as const;
