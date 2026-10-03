import type { BadgeVariant } from "../../../components/data-table/types";
import type { ActiveFilter, ActiveFilterValue } from "../../../components/data-table/filter-types";
import { parsePossibleTimestamp, formatDateParts } from "../../../lib/format-timestamp";
import { formatEnumLabel } from "../../../lib/format-enum";
import type {
  RawTransaction,
  TransactionViewModel,
  TxDirection,
  TxStatus,
  PaymentMethod,
} from "./types";

export function mapRawTransactionToViewModel(raw: RawTransaction): TransactionViewModel {
  const createdAtDate = parsePossibleTimestamp(raw.created_at);
  const updatedAtDate = parsePossibleTimestamp(raw.updated_at);
  const completedAtDate = parsePossibleTimestamp(raw.completed_at);
  const paymentExpiresAtDate = parsePossibleTimestamp(raw.payment_expires_at);

  return {
    txId: raw.tx_id,
    direction: raw.tx_direction,
    status: raw.tx_status,
    geo: raw.geo,
    merchantId: raw.merchant_id,
    merchantName: raw.merchant_name || "Unknown",
    merchantTxId: raw.merchant_tx_id,
    merchantClientId: raw.merchant_client_id,
    merchantFeePct: raw.merchant_fee_pct,
    merchantRate: raw.merchant_rate,
    merchantOutAmount: raw.merchant_out_amount,
    merchantOutAmountConfirmed: raw.merchant_out_amount_confirmed,
    provider: raw.provider,
    providerFeePct: raw.provider_fee_pct,
    providerTxId: raw.provider_tx_id,
    providerRate: raw.provider_rate,
    providerOutAmount: raw.provider_out_amount,
    providerOutAmountConfirmed: raw.provider_out_amount_confirmed,
    baseRate: raw.base_rate,
    baseRateType: raw.base_rate_type,
    paymentMethod: raw.payment_method,
    paymentSystem: raw.payment_system,
    paymentRequisite: raw.payment_requisite,
    paymentRequisiteFullName: raw.payment_requisite_full_name,
    paymentExpiresAt: paymentExpiresAtDate
      ? formatDateParts(paymentExpiresAtDate)
      : raw.payment_expires_at,
    paymentExpiresAtValue: paymentExpiresAtDate ? paymentExpiresAtDate.getTime() : 0,
    widgetId: raw.widget_id,
    bankNameRequested: raw.bank_name_requested,
    paymentLinkQrNational: raw.payment_link_qr_national,
    paymentLinkBankDirect: raw.payment_link_bank_direct,
    inCurrency: raw.in_currency,
    inAmount: raw.in_amount,
    inAmountConfirmed: raw.in_amount_confirmed,
    inAmountInitial: raw.in_amount_initial,
    outCurrency: raw.out_currency,
    feeCurrency: raw.fee_currency,
    feeAmount: raw.fee_amount,
    feeAmountConfirmed: raw.fee_amount_confirmed,
    allowVariableAmountOnCreation: raw.allow_variable_amount_on_creation,
    isVariableAmount: raw.is_variable_amount,
    isRequisitePool: raw.is_requisite_pool,
    isBalanceReleased: raw.is_balance_released,
    isBalanceReserved: raw.is_balance_reserved,
    isManualConfirmed: raw.is_manual_confirmed,
    createdAt: createdAtDate ? formatDateParts(createdAtDate) : raw.created_at,
    createdAtValue: createdAtDate ? createdAtDate.getTime() : 0,
    updatedAt: updatedAtDate ? formatDateParts(updatedAtDate) : raw.updated_at,
    updatedAtValue: updatedAtDate ? updatedAtDate.getTime() : 0,
    completedAt: completedAtDate ? formatDateParts(completedAtDate) : raw.completed_at,
    completedAtValue: completedAtDate ? completedAtDate.getTime() : 0,
    searchText:
      `${raw.tx_id} ${raw.merchant_tx_id} ${raw.merchant_name} ${raw.merchant_id}`.toLowerCase(),
  };
}

export const statusBadgeVariants: Record<TxStatus, BadgeVariant> = {
  TX_SUCCESS: "success",
  TX_ACTIVE: "indigo",
  TX_ON_VERIFICATION: "purple",
  TX_AWAITING_CONFIRMATION: "info",
  TX_CANCELLED: "danger",
  TX_EXPIRED: "warning",
  TX_RECALCULATED: "sky",
};

export const directionBadgeVariants: Record<TxDirection, BadgeVariant> = {
  P2P_FIAT_IN: "info",
  P2P_FIAT_OUT: "neutral",
  C2C_FIAT_IN: "info",
  C2C_FIAT_OUT: "neutral",
  ECOM_FIAT_IN: "success",
};

export const paymentMethodBadgeVariants: Record<PaymentMethod, BadgeVariant> = {
  DIRECTPAY: "neutral",
  INSTANTPAY: "neutral",
  MOBILE: "neutral",
  CROSSBORDER_INSTANTPAY: "neutral",
  CROSSBORDER_BANK_CARD: "neutral",
  BANK_CARD: "neutral",
  BANK_ACCOUNT: "neutral",
  ONECLICK: "neutral",
  QR: "neutral",
  QR_NATIONAL: "neutral",
  QR_NATIONAL_MOBILE: "neutral",
  TIPS: "neutral",
};

export const directionLabels: Record<TxDirection, string> = {
  P2P_FIAT_IN: "P2P In",
  P2P_FIAT_OUT: "P2P Out",
  C2C_FIAT_IN: "C2C In",
  C2C_FIAT_OUT: "C2C Out",
  ECOM_FIAT_IN: "ECOM In",
};

export function formatDirectionLabel(direction: TxDirection): string {
  return directionLabels[direction];
}

export function formatStatusLabel(status: TxStatus): string {
  return formatEnumLabel(status);
}

export function getTransactionSortValue(
  tx: TransactionViewModel,
  columnId: string,
): string | number {
  switch (columnId) {
    case "txId":
      return tx.txId;
    case "direction":
      return tx.direction;
    case "status":
      return tx.status;
    case "merchant":
      return tx.merchantName;
    case "merchantId":
      return tx.merchantId;
    case "amount":
      return tx.inAmount;
    case "inAmount":
      return tx.inAmount;
    case "paymentMethod":
      return tx.paymentMethod;
    case "geo":
      return tx.geo;
    case "createdAt":
      return tx.createdAtValue;
    case "updatedAt":
      return tx.updatedAtValue;
    case "completedAt":
      return tx.completedAtValue;
    case "paymentExpiresAt":
      return tx.paymentExpiresAtValue;
    case "provider":
      return tx.provider;
    case "feePct":
      return tx.merchantFeePct;
    case "rate":
      return tx.merchantRate;
    case "requisite":
      return tx.paymentRequisite;
    case "paymentRequisiteFullName":
      return tx.paymentRequisiteFullName;
    case "fee":
      return tx.feeAmount;
    case "feeAmountConfirmed":
      return tx.feeAmountConfirmed;
    case "merchantFeePct":
      return tx.merchantFeePct;
    case "merchantRate":
      return tx.merchantRate;
    case "merchantOut":
      return tx.merchantOutAmount;
    case "merchantOutAmount":
      return tx.merchantOutAmount;
    case "merchantOutAmountConfirmed":
      return tx.merchantOutAmountConfirmed;
    case "providerOut":
      return tx.providerOutAmount;
    case "providerOutAmount":
      return tx.providerOutAmount;
    case "providerOutAmountConfirmed":
      return tx.providerOutAmountConfirmed;
    case "inAmountConfirmed":
      return tx.inAmountConfirmed;
    case "feeAmount":
      return tx.feeAmount;
    case "providerRate":
      return tx.providerRate;
    case "baseRate":
      return tx.baseRate;
    default:
      return tx.txId;
  }
}

export function matchesTransactionFilter(tx: TransactionViewModel, filter: ActiveFilter): boolean {
  const { columnId, value } = filter;
  switch (columnId) {
    case "status":
      return Array.isArray(value) && value.length > 0 ? value.includes(tx.status) : true;
    case "direction":
      return Array.isArray(value) && value.length > 0 ? value.includes(tx.direction) : true;
    case "merchant": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const nameVal = compound.merchantName;
        const txIdVal = compound.merchantTxId;
        if (Array.isArray(nameVal) && nameVal.length > 0) {
          if (!nameVal.some((v) => tx.merchantName.toLowerCase().includes(v.toLowerCase())))
            return false;
        }
        if (Array.isArray(txIdVal) && txIdVal.length > 0) {
          if (!txIdVal.some((v) => tx.merchantTxId.toLowerCase().includes(v.toLowerCase())))
            return false;
        }
      }
      return true;
    }
    case "merchantId":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.merchantId.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "geo":
      return Array.isArray(value) && value.length > 0 ? value.includes(tx.geo) : true;
    case "paymentMethod":
      return Array.isArray(value) && value.length > 0 ? value.includes(tx.paymentMethod) : true;
    case "provider": {
      if (Array.isArray(value)) {
        return value.length > 0
          ? value.some((v) => tx.provider.toLowerCase().includes(v.toLowerCase()))
          : true;
      }
      if (typeof value === "object" && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const nameVal = compound.provider as string[] | undefined;
        const txIdVal = compound.providerTxId as string[] | undefined;
        if (Array.isArray(nameVal) && nameVal.length > 0) {
          if (!nameVal.some((v) => tx.provider.toLowerCase().includes(v.toLowerCase())))
            return false;
        }
        if (Array.isArray(txIdVal) && txIdVal.length > 0) {
          if (!txIdVal.some((v) => tx.providerTxId.toLowerCase().includes(v.toLowerCase())))
            return false;
        }
      }
      return true;
    }
    case "txId":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.txId.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "merchantTxId":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.merchantTxId.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "merchantClientId":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.merchantClientId.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "providerTxId":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.providerTxId.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "paymentSystem":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.paymentSystem.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "requisite": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const reqVal = compound.paymentRequisite as string[] | undefined;
        const nameVal = compound.paymentRequisiteFullName as string[] | undefined;
        if (Array.isArray(reqVal) && reqVal.length > 0) {
          if (!reqVal.some((v) => tx.paymentRequisite.toLowerCase().includes(v.toLowerCase())))
            return false;
        }
        if (Array.isArray(nameVal) && nameVal.length > 0) {
          if (
            !nameVal.some((v) =>
              tx.paymentRequisiteFullName.toLowerCase().includes(v.toLowerCase()),
            )
          )
            return false;
        }
      }
      return true;
    }
    case "paymentRequisite":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.paymentRequisite.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "paymentRequisiteFullName":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.paymentRequisiteFullName.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "widgetId":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.widgetId.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "bankNameRequested":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.bankNameRequested.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "outCurrency":
      return Array.isArray(value) && value.length > 0
        ? value.some((v) => tx.outCurrency.toLowerCase().includes(v.toLowerCase()))
        : true;
    case "createdAt": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: string; to?: string };
        const fromTs = from ? new Date(from).getTime() : null;
        const toTs = to ? new Date(to).setHours(23, 59, 59, 999) : null;
        if (fromTs && tx.createdAtValue < fromTs) return false;
        if (toTs && tx.createdAtValue > toTs) return false;
      }
      return true;
    }
    case "updatedAt": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: string; to?: string };
        const fromTs = from ? new Date(from).getTime() : null;
        const toTs = to ? new Date(to).setHours(23, 59, 59, 999) : null;
        if (fromTs && tx.updatedAtValue < fromTs) return false;
        if (toTs && tx.updatedAtValue > toTs) return false;
      }
      return true;
    }
    case "completedAt": {
      if (typeof value === "object" && !Array.isArray(value)) {
        if (tx.completedAtValue === 0) return false; // no completion date
        const { from, to } = value as { from?: string; to?: string };
        const fromTs = from ? new Date(from).getTime() : null;
        const toTs = to ? new Date(to).setHours(23, 59, 59, 999) : null;
        if (fromTs && tx.completedAtValue < fromTs) return false;
        if (toTs && tx.completedAtValue > toTs) return false;
      }
      return true;
    }
    case "paymentExpiresAt": {
      if (typeof value === "object" && !Array.isArray(value)) {
        if (tx.paymentExpiresAtValue === 0) return false; // no expiry date
        const { from, to } = value as { from?: string; to?: string };
        const fromTs = from ? new Date(from).getTime() : null;
        const toTs = to ? new Date(to).setHours(23, 59, 59, 999) : null;
        if (fromTs && tx.paymentExpiresAtValue < fromTs) return false;
        if (toTs && tx.paymentExpiresAtValue > toTs) return false;
      }
      return true;
    }
    case "amount": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const inVal = compound.inAmount as { from?: number; to?: number } | undefined;
        const outVal = compound.merchantOutAmount as { from?: number; to?: number } | undefined;
        if (inVal && typeof inVal === "object") {
          if (inVal.from !== undefined && tx.inAmount < inVal.from) return false;
          if (inVal.to !== undefined && tx.inAmount > inVal.to) return false;
        }
        if (outVal && typeof outVal === "object") {
          if (outVal.from !== undefined && tx.merchantOutAmount < outVal.from) return false;
          if (outVal.to !== undefined && tx.merchantOutAmount > outVal.to) return false;
        }
      }
      return true;
    }
    case "inAmount": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const amountVal = compound.inAmount as { from?: number; to?: number } | undefined;
        const confirmedVal = compound.inAmountConfirmed as
          | { from?: number; to?: number }
          | undefined;
        if (amountVal && typeof amountVal === "object") {
          if (amountVal.from !== undefined && tx.inAmount < amountVal.from) return false;
          if (amountVal.to !== undefined && tx.inAmount > amountVal.to) return false;
        }
        if (confirmedVal && typeof confirmedVal === "object") {
          if (confirmedVal.from !== undefined && tx.inAmountConfirmed < confirmedVal.from)
            return false;
          if (confirmedVal.to !== undefined && tx.inAmountConfirmed > confirmedVal.to) return false;
        }
      }
      return true;
    }
    case "inAmountInitial": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: number; to?: number };
        if (from !== undefined && tx.inAmountInitial < from) return false;
        if (to !== undefined && tx.inAmountInitial > to) return false;
      }
      return true;
    }
    case "fee": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const feeVal = compound.feeAmount as { from?: number; to?: number } | undefined;
        const confirmedVal = compound.feeAmountConfirmed as
          | { from?: number; to?: number }
          | undefined;
        if (feeVal && typeof feeVal === "object") {
          if (feeVal.from !== undefined && tx.feeAmount < feeVal.from) return false;
          if (feeVal.to !== undefined && tx.feeAmount > feeVal.to) return false;
        }
        if (confirmedVal && typeof confirmedVal === "object") {
          if (confirmedVal.from !== undefined && tx.feeAmountConfirmed < confirmedVal.from)
            return false;
          if (confirmedVal.to !== undefined && tx.feeAmountConfirmed > confirmedVal.to)
            return false;
        }
      }
      return true;
    }
    case "feeAmount": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: number; to?: number };
        if (from !== undefined && tx.feeAmount < from) return false;
        if (to !== undefined && tx.feeAmount > to) return false;
      }
      return true;
    }
    case "feeAmountConfirmed": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: number; to?: number };
        if (from !== undefined && tx.feeAmountConfirmed < from) return false;
        if (to !== undefined && tx.feeAmountConfirmed > to) return false;
      }
      return true;
    }
    case "feePct": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const merchantFeeVal = compound.merchantFeePct as
          | { from?: number; to?: number }
          | undefined;
        const providerFeeVal = compound.providerFeePct as
          | { from?: number; to?: number }
          | undefined;
        if (merchantFeeVal && typeof merchantFeeVal === "object") {
          if (merchantFeeVal.from !== undefined && tx.merchantFeePct < merchantFeeVal.from)
            return false;
          if (merchantFeeVal.to !== undefined && tx.merchantFeePct > merchantFeeVal.to)
            return false;
        }
        if (providerFeeVal && typeof providerFeeVal === "object") {
          if (providerFeeVal.from !== undefined && tx.providerFeePct < providerFeeVal.from)
            return false;
          if (providerFeeVal.to !== undefined && tx.providerFeePct > providerFeeVal.to)
            return false;
        }
      }
      return true;
    }
    case "merchantFeePct": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: number; to?: number };
        if (from !== undefined && tx.merchantFeePct < from) return false;
        if (to !== undefined && tx.merchantFeePct > to) return false;
      }
      return true;
    }
    case "rate": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const merchantRateVal = compound.merchantRate as { from?: number; to?: number } | undefined;
        const providerRateVal = compound.providerRate as { from?: number; to?: number } | undefined;
        if (merchantRateVal && typeof merchantRateVal === "object") {
          if (merchantRateVal.from !== undefined && tx.merchantRate < merchantRateVal.from)
            return false;
          if (merchantRateVal.to !== undefined && tx.merchantRate > merchantRateVal.to)
            return false;
        }
        if (providerRateVal && typeof providerRateVal === "object") {
          if (providerRateVal.from !== undefined && tx.providerRate < providerRateVal.from)
            return false;
          if (providerRateVal.to !== undefined && tx.providerRate > providerRateVal.to)
            return false;
        }
      }
      return true;
    }
    case "merchantRate": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: number; to?: number };
        if (from !== undefined && tx.merchantRate < from) return false;
        if (to !== undefined && tx.merchantRate > to) return false;
      }
      return true;
    }
    case "merchantOut": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const amountVal = compound.merchantOutAmount as { from?: number; to?: number } | undefined;
        const confirmedVal = compound.merchantOutAmountConfirmed as
          | { from?: number; to?: number }
          | undefined;
        if (amountVal && typeof amountVal === "object") {
          if (amountVal.from !== undefined && tx.merchantOutAmount < amountVal.from) return false;
          if (amountVal.to !== undefined && tx.merchantOutAmount > amountVal.to) return false;
        }
        if (confirmedVal && typeof confirmedVal === "object") {
          if (confirmedVal.from !== undefined && tx.merchantOutAmountConfirmed < confirmedVal.from)
            return false;
          if (confirmedVal.to !== undefined && tx.merchantOutAmountConfirmed > confirmedVal.to)
            return false;
        }
      }
      return true;
    }
    case "providerFeePct": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: number; to?: number };
        if (from !== undefined && tx.providerFeePct < from) return false;
        if (to !== undefined && tx.providerFeePct > to) return false;
      }
      return true;
    }
    case "providerRate": {
      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: number; to?: number };
        if (from !== undefined && tx.providerRate < from) return false;
        if (to !== undefined && tx.providerRate > to) return false;
      }
      return true;
    }
    case "providerOut": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        const amountVal = compound.providerOutAmount as { from?: number; to?: number } | undefined;
        const confirmedVal = compound.providerOutAmountConfirmed as
          | { from?: number; to?: number }
          | undefined;
        if (amountVal && typeof amountVal === "object") {
          if (amountVal.from !== undefined && tx.providerOutAmount < amountVal.from) return false;
          if (amountVal.to !== undefined && tx.providerOutAmount > amountVal.to) return false;
        }
        if (confirmedVal && typeof confirmedVal === "object") {
          if (confirmedVal.from !== undefined && tx.providerOutAmountConfirmed < confirmedVal.from)
            return false;
          if (confirmedVal.to !== undefined && tx.providerOutAmountConfirmed > confirmedVal.to)
            return false;
        }
      }
      return true;
    }
    case "baseRate": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, ActiveFilterValue>;
        if ("baseRate" in compound || "baseRateType" in compound) {
          // compound filter (new): { baseRate: { from, to }, baseRateType: string[] }
          const rateVal = compound.baseRate as { from?: number; to?: number } | undefined;
          const typeVal = compound.baseRateType as string[] | undefined;
          if (rateVal && typeof rateVal === "object") {
            if (rateVal.from !== undefined && tx.baseRate < rateVal.from) return false;
            if (rateVal.to !== undefined && tx.baseRate > rateVal.to) return false;
          }
          if (Array.isArray(typeVal) && typeVal.length > 0) {
            if (!typeVal.includes(tx.baseRateType)) return false;
          }
        } else {
          // legacy simple range
          const { from, to } = value as { from?: number; to?: number };
          if (from !== undefined && tx.baseRate < from) return false;
          if (to !== undefined && tx.baseRate > to) return false;
        }
      }
      return true;
    }
    case "baseRateType":
      return Array.isArray(value) && value.length > 0 ? value.includes(tx.baseRateType) : true;
    case "isVariableAmount":
      return Array.isArray(value) && value.length > 0
        ? value.includes(String(tx.isVariableAmount))
        : true;
    case "isBalanceReleased":
      return Array.isArray(value) && value.length > 0
        ? value.includes(String(tx.isBalanceReleased))
        : true;
    case "isBalanceReserved":
      return Array.isArray(value) && value.length > 0
        ? value.includes(String(tx.isBalanceReserved))
        : true;
    case "isRequisitePool":
      return Array.isArray(value) && value.length > 0
        ? value.includes(String(tx.isRequisitePool))
        : true;
    case "isManualConfirmed":
      return Array.isArray(value) && value.length > 0
        ? value.includes(String(tx.isManualConfirmed))
        : true;
    default:
      return true;
  }
}
