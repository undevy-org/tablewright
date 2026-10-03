import type { ViewPreset } from "../../../components/data-table/filter-types";

export const liveTabKeys = [
  "merchants",
  "balances",
  "statistics",
  "widgets",
  "reports",
  "bank-block-lists",
  "merchant-rate-settings",
  "merchant-withdraw-fees",
  "request-logs",
] as const;

export type LiveTabKey = (typeof liveTabKeys)[number];

export type LiveMerchantRole = "MERCHANT";
export type LiveMerchantStatus = "ACTIVE" | "BLOCKED" | "DELETED";
export type LiveMerchantTrafficType =
  | "TRAFFIC_LOW_RISK"
  | "TRAFFIC_MEDIUM_RISK"
  | "TRAFFIC_HIGH_RISK";
export type LiveMerchantBalanceType =
  | "BALANCE_CRYPTO"
  | "BALANCE_FIAT"
  | "BALANCE_CRYPTO_DEPOSIT"
  | "BALANCE_FIAT_DEPOSIT";

export interface RawLiveMerchant {
  id: string;
  name: string;
  role: LiveMerchantRole;
  status: LiveMerchantStatus;
  mfa_required: boolean;
  traffic_type: LiveMerchantTrafficType;
  balance_type: LiveMerchantBalanceType;
  spam_block_expiration: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LiveSummaryRow {
  title: string;
  values: string[];
}

export interface LiveTabSummary {
  key: Exclude<LiveTabKey, "merchants" | "reports">;
  label: string;
  count: number;
  endpoint: string;
  topActions: string[];
  filterNames: string[];
  columns: string[];
  sampleRows: LiveSummaryRow[];
  emptyStateMessage?: string;
  notes?: string[];
}

export interface LiveReportSectionSummary {
  key: string;
  title: string;
  endpoint: string;
  topActions: string[];
  filterNames: string[];
  columns: string[];
  sampleRows: LiveSummaryRow[];
  notes?: string[];
}

export interface LiveCreateMerchantOptions {
  trafficTypes: LiveMerchantTrafficType[];
  balanceTypes: LiveMerchantBalanceType[];
}

export interface LiveMerchantViewModel {
  id: string;
  name: string;
  role: LiveMerchantRole;
  status: LiveMerchantStatus;
  trafficType: LiveMerchantTrafficType;
  balanceType: LiveMerchantBalanceType;
  spamBlockExpiration: string | null;
  spamBlockExpirationValue: number | null;
  createdAt: string;
  createdAtValue: number;
  updatedAt: string;
  updatedAtValue: number;
  deletedAt: string | null;
  deletedAtValue: number | null;
  searchText: string;
}

export interface CreateMerchantPreviewFormState {
  name: string;
  trafficType: LiveMerchantTrafficType;
  balanceType: LiveMerchantBalanceType;
}

export interface PreviewActionState {
  merchantId: string;
  merchantName: string;
  actionLabel: string;
}

export type {
  ColumnFilterType,
  ColumnFilterConfig,
  ActiveFilterValue,
  ActiveFilter,
  ViewPreset,
} from "../../../components/data-table/filter-types";

export type MerchantViewKey =
  | "all"
  | "active"
  | "blocked"
  | "expiring-soon"
  | "recently-created"
  | "custom";

export type MerchantViewPreset = ViewPreset<LiveMerchantViewModel, MerchantViewKey>;
