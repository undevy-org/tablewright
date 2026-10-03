import type { BadgeVariant } from "../../../components/data-table/types";
import type {
  ActiveFilter,
  LiveMerchantBalanceType,
  LiveMerchantStatus,
  LiveMerchantTrafficType,
  LiveMerchantViewModel,
  RawLiveMerchant,
} from "./types";
import { parsePossibleTimestamp, formatDateParts } from "../../../lib/format-timestamp";

export { formatLiveTimestamp, parsePossibleTimestamp, formatDateParts } from "../../../lib/format-timestamp";
export { formatEnumLabel } from "../../../lib/format-enum";

export function mapRawMerchantToViewModel(raw: RawLiveMerchant): LiveMerchantViewModel {
  const createdAtDate = parsePossibleTimestamp(raw.created_at);
  const updatedAtDate = parsePossibleTimestamp(raw.updated_at);
  const deletedAtDate = parsePossibleTimestamp(raw.deleted_at);
  const spamBlockExpirationDate = parsePossibleTimestamp(raw.spam_block_expiration);

  const createdAt = createdAtDate ? formatDateParts(createdAtDate) : raw.created_at;
  const updatedAt = updatedAtDate ? formatDateParts(updatedAtDate) : raw.updated_at;
  const deletedAt = deletedAtDate ? formatDateParts(deletedAtDate) : null;
  const spamBlockExpiration = spamBlockExpirationDate
    ? formatDateParts(spamBlockExpirationDate)
    : null;

  const status: LiveMerchantStatus = deletedAtDate ? "DELETED" : raw.status;

  return {
    id: raw.id,
    name: raw.name || "Unnamed Merchant",
    role: raw.role,
    status: status,
    trafficType: raw.traffic_type,
    balanceType: raw.balance_type,
    spamBlockExpiration,
    spamBlockExpirationValue: spamBlockExpirationDate ? spamBlockExpirationDate.getTime() : null,
    createdAt,
    createdAtValue: createdAtDate ? createdAtDate.getTime() : 0,
    updatedAt,
    updatedAtValue: updatedAtDate ? updatedAtDate.getTime() : 0,
    deletedAt,
    deletedAtValue: deletedAtDate ? deletedAtDate.getTime() : null,
    searchText: `${raw.id} ${raw.name}`.toLowerCase(),
  };
}

export function getMerchantSortValue(
  merchant: LiveMerchantViewModel,
  columnId: string,
): string | number {
  switch (columnId) {
    case "status":
      return merchant.status;
    case "merchantName":
      return merchant.name;
    case "merchantId":
      return merchant.id;
    case "traffic":
      return merchant.trafficType;
    case "balance":
      return merchant.balanceType;
    case "createdAt":
      return merchant.createdAtValue;
    case "updatedAt":
      return merchant.updatedAtValue;
    case "spamBlock":
      return merchant.spamBlockExpirationValue ?? 0;
    default:
      return merchant.name;
  }
}

export const statusBadgeVariants: Record<LiveMerchantStatus, BadgeVariant> = {
  ACTIVE: "success",
  BLOCKED: "danger",
  DELETED: "neutral",
};

export const trafficBadgeVariants: Record<LiveMerchantTrafficType, BadgeVariant> = {
  TRAFFIC_LOW_RISK: "info",
  TRAFFIC_MEDIUM_RISK: "warning",
  TRAFFIC_HIGH_RISK: "danger",
};

export const balanceBadgeVariants: Record<LiveMerchantBalanceType, BadgeVariant> = {
  BALANCE_CRYPTO: "neutral",
  BALANCE_FIAT: "warning",
  BALANCE_CRYPTO_DEPOSIT: "info",
  BALANCE_FIAT_DEPOSIT: "success",
};

export function matchesColumnFilter(
  merchant: LiveMerchantViewModel,
  filter: ActiveFilter,
): boolean {
  const { columnId, value } = filter;

  switch (columnId) {
    case "merchant": {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const compound = value as Record<string, import("../../../components/data-table/filter-types").ActiveFilterValue>;
        const nameVal = compound.name;
        const idVal = compound.id;
        if (Array.isArray(nameVal) && nameVal.length > 0) {
          if (!nameVal.some((v) => merchant.name.toLowerCase().includes(v.toLowerCase())))
            return false;
        }
        if (Array.isArray(idVal) && idVal.length > 0) {
          if (!idVal.some((v) => merchant.id.toLowerCase().includes(v.toLowerCase()))) return false;
        }
      }
      return true;
    }

    case "status":
      return Array.isArray(value) && value.length > 0 ? value.includes(merchant.status) : true;

    case "traffic":
      return Array.isArray(value) && value.length > 0 ? value.includes(merchant.trafficType) : true;

    case "balance":
      return Array.isArray(value) && value.length > 0 ? value.includes(merchant.balanceType) : true;

    case "createdAt":
    case "updatedAt":
    case "spamBlock": {
      const dateValue =
        columnId === "createdAt"
          ? merchant.createdAtValue
          : columnId === "updatedAt"
            ? merchant.updatedAtValue
            : merchant.spamBlockExpirationValue;

      // spamBlockExpirationValue can be null (when spam_block_expiration is "0")
      if (dateValue === null) return true;

      if (typeof value === "object" && !Array.isArray(value)) {
        const { from, to } = value as { from?: string; to?: string };
        const fromTs = from ? new Date(from).getTime() : null;
        const toTs = to ? new Date(to).setHours(23, 59, 59, 999) : null;

        if (fromTs && dateValue < fromTs) return false;
        if (toTs && dateValue > toTs) return false;
      }
      return true;
    }

    default:
      return true;
  }
}
