import { RefreshCw, AlertTriangle, ScrollText, Webhook, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RowActionSection } from "../../../components/data-table/types";
import type { TransactionViewModel } from "./types";

const actionIconMap: Record<string, LucideIcon> = {
  "Update Status": RefreshCw,
  "Create Dispute": AlertTriangle,
  "Callback Logs": ScrollText,
  Webhooks: Webhook,
  "Send Last Webhook": Send,
};

const transactionActionGroups = [
  {
    label: "Status & Disputes",
    actions: ["Update Status", "Create Dispute"],
  },
  {
    label: "Logs",
    actions: ["Callback Logs", "Webhooks"],
  },
  {
    label: "Quick Actions",
    actions: ["Send Last Webhook"],
  },
] as const;

type ActionLabel = (typeof transactionActionGroups)[number]["actions"][number];

function isActionDisabled(action: ActionLabel, status: TransactionViewModel["status"]): boolean {
  switch (action) {
    case "Update Status":
      return status === "TX_SUCCESS";
    case "Create Dispute":
      return status === "TX_CANCELLED" || status === "TX_EXPIRED";
    case "Send Last Webhook":
      return status === "TX_SUCCESS" || status === "TX_CANCELLED";
    default:
      return false;
  }
}

export function buildRowActionSections(
  tx: TransactionViewModel,
  onAction: (tx: TransactionViewModel, action: string) => void,
): RowActionSection[] {
  return transactionActionGroups.map((group) => ({
    label: group.label,
    actions: group.actions.map((action) => ({
      label: action,
      icon: actionIconMap[action],
      onClick: () => onAction(tx, action),
      disabled: isActionDisabled(action, tx.status),
    })),
  }));
}
