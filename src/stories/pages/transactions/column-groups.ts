import type { ColumnGroup } from "../../../components/data-table/filter-types";

export type { ColumnGroup } from "../../../components/data-table/filter-types";

export const TRANSACTION_COLUMN_GROUPS: ColumnGroup[] = [
  {
    key: "core",
    label: "Core",
    columnIds: ["txId", "direction", "status", "merchant", "amount", "paymentMethod", "geo"],
  },
  {
    key: "merchant",
    label: "Merchant",
    columnIds: ["merchantId", "merchantClientId", "feePct", "merchantOut"],
  },
  {
    key: "provider",
    label: "Provider",
    columnIds: ["provider", "rate", "providerOut", "baseRate"],
  },
  {
    key: "payment",
    label: "Payment",
    columnIds: ["paymentSystem", "requisite", "widgetId", "bankNameRequested"],
  },
  {
    key: "amounts",
    label: "Amounts & Rates",
    columnIds: ["inAmount", "inAmountInitial", "outCurrency", "fee"],
  },
  {
    key: "flags",
    label: "Flags & Meta",
    columnIds: [
      "isVariableAmount",
      "isBalanceReleased",
      "isBalanceReserved",
      "isRequisitePool",
      "isManualConfirmed",
    ],
  },
  {
    key: "time",
    label: "Time",
    columnIds: ["createdAt", "updatedAt", "completedAt", "paymentExpiresAt"],
  },
];
