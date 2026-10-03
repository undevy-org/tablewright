import type { ViewPreset } from "../../../components/data-table/filter-types";

export type TxStatus =
  | "TX_ACTIVE"
  | "TX_SUCCESS"
  | "TX_ON_VERIFICATION"
  | "TX_CANCELLED"
  | "TX_EXPIRED"
  | "TX_RECALCULATED"
  | "TX_AWAITING_CONFIRMATION";

export type TxDirection =
  | "P2P_FIAT_IN"
  | "P2P_FIAT_OUT"
  | "C2C_FIAT_IN"
  | "C2C_FIAT_OUT"
  | "ECOM_FIAT_IN";

// Payment-rail identifiers below are normalized (generic names for the
// country-specific instant-payment / national-QR rails the source system
// used), per the repo's domain-identity gate.
export type PaymentMethod =
  | "DIRECTPAY"
  | "INSTANTPAY"
  | "MOBILE"
  | "CROSSBORDER_INSTANTPAY"
  | "CROSSBORDER_BANK_CARD"
  | "BANK_CARD"
  | "BANK_ACCOUNT"
  | "ONECLICK"
  | "QR"
  | "QR_NATIONAL"
  | "QR_NATIONAL_MOBILE"
  | "TIPS";

export const TX_STATUSES = [
  "TX_ACTIVE",
  "TX_SUCCESS",
  "TX_ON_VERIFICATION",
  "TX_CANCELLED",
  "TX_EXPIRED",
  "TX_RECALCULATED",
  "TX_AWAITING_CONFIRMATION",
] as const;

export const TX_DIRECTIONS = [
  "P2P_FIAT_IN",
  "P2P_FIAT_OUT",
  "C2C_FIAT_IN",
  "C2C_FIAT_OUT",
  "ECOM_FIAT_IN",
] as const;

export const PAYMENT_METHODS = [
  "DIRECTPAY",
  "INSTANTPAY",
  "MOBILE",
  "CROSSBORDER_INSTANTPAY",
  "CROSSBORDER_BANK_CARD",
  "BANK_CARD",
  "BANK_ACCOUNT",
  "ONECLICK",
  "QR",
  "QR_NATIONAL",
  "QR_NATIONAL_MOBILE",
  "TIPS",
] as const;

export const DISPUTE_REASONS = [
  "SENT_WRONG_AMOUNT",
  "SENT_AND_NOT_CONFIRMED",
  "SENT_DOUBLE",
  "OTHER",
] as const;

export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export interface RawTransaction {
  tx_id: string;
  tx_direction: TxDirection;
  tx_status: TxStatus;
  merchant_id: string;
  merchant_name: string;
  allow_variable_amount_on_creation: boolean;
  geo: string;
  merchant_tx_id: string;
  merchant_client_id: string;
  merchant_fee_pct: number;
  merchant_rate: number;
  merchant_out_amount: number;
  merchant_out_amount_confirmed: number;
  provider: string;
  provider_fee_pct: number;
  provider_tx_id: string;
  provider_rate: number;
  base_rate: number;
  provider_out_amount: number;
  provider_out_amount_confirmed: number;
  payment_method: PaymentMethod;
  payment_system: string;
  payment_requisite_full_name: string;
  widget_id: string;
  payment_requisite: string;
  payment_expires_at: string;
  in_currency: string;
  in_amount: number;
  in_amount_confirmed: number;
  out_currency: string;
  fee_currency: string;
  fee_amount: number;
  is_variable_amount: boolean;
  in_amount_initial: number;
  bank_name_requested: string;
  fee_amount_confirmed: number;
  is_requisite_pool: boolean;
  is_balance_released: boolean;
  is_balance_reserved: boolean;
  is_manual_confirmed: boolean;
  base_rate_type: string;
  payment_link_qr_national: string;
  payment_link_bank_direct: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

export interface TransactionViewModel {
  txId: string;
  direction: TxDirection;
  status: TxStatus;
  geo: string;
  merchantId: string;
  merchantName: string;
  merchantTxId: string;
  merchantClientId: string;
  merchantFeePct: number;
  merchantRate: number;
  merchantOutAmount: number;
  merchantOutAmountConfirmed: number;
  provider: string;
  providerFeePct: number;
  providerTxId: string;
  providerRate: number;
  providerOutAmount: number;
  providerOutAmountConfirmed: number;
  baseRate: number;
  baseRateType: string;
  paymentMethod: PaymentMethod;
  paymentSystem: string;
  paymentRequisite: string;
  paymentRequisiteFullName: string;
  paymentExpiresAt: string;
  paymentExpiresAtValue: number;
  widgetId: string;
  bankNameRequested: string;
  paymentLinkQrNational: string;
  paymentLinkBankDirect: string;
  inCurrency: string;
  inAmount: number;
  inAmountConfirmed: number;
  inAmountInitial: number;
  outCurrency: string;
  feeCurrency: string;
  feeAmount: number;
  feeAmountConfirmed: number;
  allowVariableAmountOnCreation: boolean;
  isVariableAmount: boolean;
  isRequisitePool: boolean;
  isBalanceReleased: boolean;
  isBalanceReserved: boolean;
  isManualConfirmed: boolean;
  createdAt: string;
  createdAtValue: number;
  updatedAt: string;
  updatedAtValue: number;
  completedAt: string;
  completedAtValue: number;
  searchText: string;
}

export type TransactionViewKey =
  | "all"
  | "needs-attention"
  | "failed"
  | "exceptions"
  | "finance"
  | "custom";

export type TransactionViewPreset = ViewPreset<TransactionViewModel, TransactionViewKey>;

// Re-export shared filter types
export type {
  ColumnFilterType,
  ColumnFilterConfig,
  ActiveFilterValue,
  ActiveFilter,
  ViewPreset,
} from "../../../components/data-table/filter-types";
