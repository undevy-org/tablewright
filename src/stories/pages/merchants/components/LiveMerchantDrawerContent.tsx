import { Badge } from "../../../../components/ui/badge";
import { CopyableText } from "../../../../components/data-table/CopyableText";
import { DrawerField } from "../../../../components/data-table/DrawerField";
import { DrawerSection } from "../../../../components/data-table/DrawerSection";
import { DrawerActionGroup } from "../../../../components/data-table/DrawerActionGroup";
import { useDrawerExpanded } from "../../../../context/drawer-expand-context";
import type { RowActionSection } from "../../../../components/data-table/types";
import {
  balanceBadgeVariants,
  formatEnumLabel,
  statusBadgeVariants,
  trafficBadgeVariants,
} from "../adapters";
import type { LiveMerchantViewModel } from "../types";

interface LiveMerchantDrawerContentProps {
  merchant: LiveMerchantViewModel;
  actionSections: RowActionSection[];
}

function LiveMerchantExpandedContent({ merchant, actionSections }: LiveMerchantDrawerContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {/* Overview card */}
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Overview
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <DrawerField label="Name">
              <CopyableText value={merchant.name} textClassName="font-semibold" />
            </DrawerField>
            <DrawerField label="ID">
              <CopyableText value={merchant.id} textClassName="font-mono text-[12px]" />
            </DrawerField>
            <DrawerField label="Status">
              <Badge variant={statusBadgeVariants[merchant.status]}>{merchant.status}</Badge>
            </DrawerField>
            <DrawerField label="Role">{merchant.role}</DrawerField>
            <DrawerField label="Traffic Type">
              <Badge variant={trafficBadgeVariants[merchant.trafficType]}>
                {formatEnumLabel(merchant.trafficType)}
              </Badge>
            </DrawerField>
            <DrawerField label="Balance Type">
              <Badge variant={balanceBadgeVariants[merchant.balanceType]}>
                {formatEnumLabel(merchant.balanceType)}
              </Badge>
            </DrawerField>
          </div>
        </div>

        {/* Dates card */}
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Dates
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <DrawerField label="Created">{merchant.createdAt}</DrawerField>
            <DrawerField label="Updated">{merchant.updatedAt}</DrawerField>
            <DrawerField label="Deleted">{merchant.deletedAt ?? "—"}</DrawerField>
            <DrawerField label="Spam Block">{merchant.spamBlockExpiration ?? "—"}</DrawerField>
          </div>
        </div>
      </div>

      <DrawerSection title="Available Actions" className="mb-0">
        <DrawerActionGroup variant="grouped" sections={actionSections} columns={4} />
      </DrawerSection>
    </div>
  );
}

export function LiveMerchantDrawerContent({
  merchant,
  actionSections,
}: LiveMerchantDrawerContentProps) {
  const isExpanded = useDrawerExpanded();

  if (isExpanded) {
    return <LiveMerchantExpandedContent merchant={merchant} actionSections={actionSections} />;
  }

  return (
    <div className="space-y-8">
      <DrawerSection title="Overview" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="Name">
            <CopyableText value={merchant.name} textClassName="font-semibold" />
          </DrawerField>
          <DrawerField label="ID">
            <CopyableText value={merchant.id} textClassName="font-mono text-[12px]" />
          </DrawerField>
          <DrawerField label="Status">
            <Badge variant={statusBadgeVariants[merchant.status]}>{merchant.status}</Badge>
          </DrawerField>
          <DrawerField label="Role">{merchant.role}</DrawerField>
          <DrawerField label="Traffic Type">
            <Badge variant={trafficBadgeVariants[merchant.trafficType]}>
              {formatEnumLabel(merchant.trafficType)}
            </Badge>
          </DrawerField>
          <DrawerField label="Balance Type">
            <Badge variant={balanceBadgeVariants[merchant.balanceType]}>
              {formatEnumLabel(merchant.balanceType)}
            </Badge>
          </DrawerField>
        </div>
      </DrawerSection>

      <DrawerSection title="Dates" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="Created">{merchant.createdAt}</DrawerField>
          <DrawerField label="Updated">{merchant.updatedAt}</DrawerField>
          <DrawerField label="Deleted">{merchant.deletedAt ?? "—"}</DrawerField>
          <DrawerField label="Spam Block">{merchant.spamBlockExpiration ?? "—"}</DrawerField>
        </div>
      </DrawerSection>

      <DrawerSection title="Available Actions" className="mb-0">
        <DrawerActionGroup variant="grouped" sections={actionSections} />
      </DrawerSection>
    </div>
  );
}
