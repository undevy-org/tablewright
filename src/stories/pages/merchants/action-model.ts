import type { LucideIcon } from "lucide-react";
import {
  ArrowRightCircle,
  Bot,
  Box,
  FileDown,
  KeyRound,
  Landmark,
  MonitorSmartphone,
  Percent,
  Route,
  Settings2,
  ShieldBan,
  ShieldCheck,
  Sparkles,
  UserCog,
  Wallet,
} from "lucide-react";

import type { RowActionSection, RowActionVariant } from "../../../components/data-table/types";

import type { LiveMerchantViewModel } from "./types";

export const actionIconMap: Record<string, LucideIcon> = {
  "Create Widget": Sparkles,
  "Get Widgets": Box,
  "Active Sessions": MonitorSmartphone,
  "Block User": ShieldBan,
  Permissions: ShieldCheck,
  "Reset 2FA": KeyRound,
  "Update Username": UserCog,
  "Withdraw Methods": Wallet,
  "Routing Rule": Route,
  "Fee Rule": Percent,
  "Bank Block Lists": Landmark,
  "Account Settings": Settings2,
  "Export CSV": FileDown,
  "Bot Chat ID": Bot,
  "Create Rate Settings": Sparkles,
  "Go To Merchant Rate Settings": ArrowRightCircle,
};

export const merchantActionGroups = [
  {
    label: "Widgets & Sessions",
    actions: ["Create Widget", "Get Widgets", "Active Sessions"],
  },
  {
    label: "Access & Security",
    actions: [
      "Block User",
      "Permissions",
      "Reset 2FA",
      "Update Username",
      "Bot Chat ID",
      "Account Settings",
    ],
  },
  {
    label: "Routing & Fees",
    actions: [
      "Withdraw Methods",
      "Routing Rule",
      "Fee Rule",
      "Create Rate Settings",
      "Go To Merchant Rate Settings",
    ],
  },
  {
    label: "Operations",
    actions: ["Bank Block Lists", "Export CSV"],
  },
] as const;

export function buildRowActionSections(
  merchant: LiveMerchantViewModel,
  onPreview: (merchant: LiveMerchantViewModel, label: string) => void,
): RowActionSection[] {
  return merchantActionGroups.map((section) => ({
    label: section.label,
    actions: section.actions.map((label) => {
      let variant: RowActionVariant | undefined;
      if (label === "Block User") variant = "danger";
      if (label === "Export CSV" || label === "Go To Merchant Rate Settings") {
        variant = "accent";
      }

      return {
        icon: actionIconMap[label] ?? Settings2,
        label,
        variant,
        onClick: () => onPreview(merchant, label),
      };
    }),
  }));
}
