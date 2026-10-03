import type { MerchantViewPreset } from "./types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const merchantViewPresets: MerchantViewPreset[] = [
  {
    key: "all",
    label: "All Merchants",
    filters: [],
    sort: null,
  },
  {
    key: "active",
    label: "Active",
    filters: [{ columnId: "status", value: ["ACTIVE"] }],
    sort: null,
  },
  {
    key: "blocked",
    label: "Blocked",
    filters: [{ columnId: "status", value: ["BLOCKED"] }],
    sort: null,
  },
  {
    key: "expiring-soon",
    label: "Block Expiring Soon",
    filters: [],
    sort: { columnId: "spamBlock", direction: "asc" },
    customFilter: (merchant) => {
      if (merchant.spamBlockExpirationValue === null) return false;
      const now = Date.now();
      return (
        merchant.spamBlockExpirationValue > now &&
        merchant.spamBlockExpirationValue <= now + THIRTY_DAYS_MS
      );
    },
    customFilterChip: { label: "Block expires", value: "Next 30 days" },
  },
  {
    key: "recently-created",
    label: "Recently Created",
    filters: [],
    sort: { columnId: "createdAt", direction: "desc" },
  },
];
