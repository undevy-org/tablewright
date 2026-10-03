import type { TransactionViewPreset } from "./types";

// ── All Transactions ────────────────────────────────────────────────────
// Reset point — no filters, no sort, almost all columns visible.
// merchantId is hidden by default: the internal merchant identifier is rarely
// needed in the table itself (it lives in the drawer); ops can opt-in via the
// columns picker.
const allColumnsVisibility: Record<string, boolean> = {
  merchantId: false,
};

// ── Needs Attention ─────────────────────────────────────────────────────
// Inbox for ops/support: statuses that require human action.
const needsAttentionVisibility: Record<string, boolean> = {
  geo: false,
  merchantId: false,
  merchantClientId: false,
  feePct: false,
  rate: false,
  merchantOut: false,
  providerOut: false,
  baseRate: false,
  paymentSystem: false,
  requisite: false,
  widgetId: false,
  inAmount: false,
  inAmountInitial: false,
  outCurrency: false,
  fee: false,
  isVariableAmount: false,
  isBalanceReleased: false,
  isBalanceReserved: false,
  isRequisitePool: false,
  isManualConfirmed: false,
  completedAt: false,
};

// ── Failed / Expired ────────────────────────────────────────────────────
// Support / incident resolution / dispute triage.
const failedVisibility: Record<string, boolean> = {
  geo: false,
  createdAt: false,
  merchantId: false,
  merchantClientId: false,
  feePct: false,
  rate: false,
  merchantOut: false,
  providerOut: false,
  baseRate: false,
  paymentSystem: false,
  requisite: false,
  paymentExpiresAt: false,
  widgetId: false,
  inAmount: false,
  inAmountInitial: false,
  outCurrency: false,
  fee: false,
  isVariableAmount: false,
  isBalanceReleased: false,
  isBalanceReserved: false,
  isRequisitePool: false,
  isManualConfirmed: false,
  completedAt: false,
};

// ── Exceptions ──────────────────────────────────────────────────────────
// Audit queue: recalculated transactions with amount deviations.
const exceptionsVisibility: Record<string, boolean> = {
  direction: false,
  geo: false,
  createdAt: false,
  paymentMethod: false,
  merchantId: false,
  merchantClientId: false,
  feePct: false,
  rate: false,
  merchantOut: false,
  providerOut: false,
  baseRate: false,
  paymentSystem: false,
  requisite: false,
  paymentExpiresAt: false,
  widgetId: false,
  bankNameRequested: false,
  inAmount: false,
  inAmountInitial: false,
  outCurrency: false,
  fee: false,
  isVariableAmount: false,
  isBalanceReleased: false,
  isBalanceReserved: false,
  isRequisitePool: false,
  completedAt: false,
};

// ── Finance Review ──────────────────────────────────────────────────────
// Reconciliation & rate verification — wide by design.
const financeVisibility: Record<string, boolean> = {
  geo: false,
  createdAt: false,
  paymentMethod: false,
  merchantId: false,
  merchantClientId: false,
  paymentSystem: false,
  requisite: false,
  paymentExpiresAt: false,
  widgetId: false,
  bankNameRequested: false,
  inAmount: false,
  inAmountInitial: false,
  outCurrency: false,
  isVariableAmount: false,
  isBalanceReleased: false,
  isBalanceReserved: false,
  isRequisitePool: false,
  isManualConfirmed: false,
  completedAt: false,
};

export const transactionViewPresets: TransactionViewPreset[] = [
  {
    key: "all",
    label: "All Transactions",
    filters: [],
    sort: null,
    columnVisibility: allColumnsVisibility,
  },
  {
    key: "needs-attention",
    label: "Needs Attention",
    filters: [
      {
        columnId: "status",
        value: ["TX_ON_VERIFICATION", "TX_AWAITING_CONFIRMATION", "TX_RECALCULATED"],
      },
    ],
    sort: { columnId: "createdAt", direction: "asc" },
    columnVisibility: needsAttentionVisibility,
  },
  {
    key: "failed",
    label: "Failed / Expired",
    filters: [{ columnId: "status", value: ["TX_CANCELLED", "TX_EXPIRED"] }],
    sort: { columnId: "updatedAt", direction: "desc" },
    columnVisibility: failedVisibility,
  },
  {
    key: "exceptions",
    label: "Exceptions",
    filters: [{ columnId: "status", value: ["TX_RECALCULATED"] }],
    sort: { columnId: "updatedAt", direction: "desc" },
    columnVisibility: exceptionsVisibility,
  },
  {
    key: "finance",
    label: "Finance Review",
    filters: [{ columnId: "status", value: ["TX_SUCCESS", "TX_RECALCULATED"] }],
    sort: { columnId: "updatedAt", direction: "desc" },
    columnVisibility: financeVisibility,
  },
];
