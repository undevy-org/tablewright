import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { DrawerSection } from "../../../../components/data-table/DrawerSection";
import { DrawerField } from "../../../../components/data-table/DrawerField";
import { DrawerSummaryCard } from "../../../../components/data-table/DrawerSummaryCard";
import { DrawerActionGroup } from "../../../../components/data-table/DrawerActionGroup";
import { DrawerEntityCard } from "../../../../components/data-table/DrawerEntityCard";
import { DrawerFlagItem, DrawerFlagGrid } from "../../../../components/data-table/DrawerFlagItem";
import { CopyableText } from "../../../../components/data-table/CopyableText";
import { formatEnumLabel } from "../../../../lib/format-enum";
import { useDrawerExpanded } from "../../../../context/drawer-expand-context";
import type { TransactionViewModel } from "../types";
import { buildRowActionSections } from "../action-model";

interface TransactionDrawerContentProps {
  transaction: TransactionViewModel;
  onAction: (tx: TransactionViewModel, action: string) => void;
}

function OverviewTabContent({ tx }: { tx: TransactionViewModel }) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <DrawerSummaryCard
          label="Amount"
          value={
            <>
              {tx.inAmount.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)] font-normal">{tx.inCurrency}</span>
            </>
          }
          sub={
            <>
              → {tx.merchantOutAmount.toLocaleString("en-US")} <span>{tx.outCurrency}</span>
            </>
          }
        />
        <DrawerSummaryCard
          label="Fee"
          value={
            <>
              {tx.feeAmount.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)] font-normal">{tx.feeCurrency}</span>
            </>
          }
          sub={`${tx.merchantFeePct}%`}
        />
        <DrawerSummaryCard label="Geo" value={tx.geo} sub={formatEnumLabel(tx.paymentMethod)} />
      </div>

      {/* Key Details */}
      <DrawerSection title="KEY DETAILS" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="Direction">{formatEnumLabel(tx.direction)}</DrawerField>
          <DrawerField label="Merchant">
            <CopyableText value={tx.merchantName}>{tx.merchantName}</CopyableText>
          </DrawerField>
          <DrawerField label="Provider">
            <CopyableText value={tx.provider}>{tx.provider}</CopyableText>
          </DrawerField>
          <DrawerField label="Payment Method">{formatEnumLabel(tx.paymentMethod)}</DrawerField>
          <DrawerField label="Created">
            <CopyableText value={tx.createdAt}>{tx.createdAt}</CopyableText>
          </DrawerField>
          <DrawerField label="Completed">
            <CopyableText value={tx.completedAt}>{tx.completedAt}</CopyableText>
          </DrawerField>
        </div>
      </DrawerSection>
    </div>
  );
}

function MoneyTabContent({ tx }: { tx: TransactionViewModel }) {
  return (
    <div className="space-y-6">
      {/* Rates */}
      <div className="grid grid-cols-3 gap-2">
        <DrawerSummaryCard
          label="Merchant Rate"
          value={tx.merchantRate.toLocaleString("en-US")}
          sub={`${tx.inCurrency} → ${tx.outCurrency}`}
        />
        <DrawerSummaryCard
          label="Provider Rate"
          value={tx.providerRate.toLocaleString("en-US")}
          sub={`${tx.inCurrency} → ${tx.outCurrency}`}
        />
        <DrawerSummaryCard
          label="Base Rate"
          value={tx.baseRate.toLocaleString("en-US")}
          sub={tx.baseRateType}
        />
      </div>

      {/* Incoming */}
      <DrawerSection title="INCOMING" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="In Amount">
            <CopyableText value={String(tx.inAmount)}>
              {tx.inAmount.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.inCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="In Amount Confirmed">
            <CopyableText value={String(tx.inAmountConfirmed)}>
              {tx.inAmountConfirmed.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.inCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="In Amount Initial">
            <CopyableText value={String(tx.inAmountInitial)}>
              {tx.inAmountInitial.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.inCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="Variable Amount">{tx.isVariableAmount ? "Yes" : "No"}</DrawerField>
        </div>
      </DrawerSection>

      {/* Outgoing */}
      <DrawerSection title="OUTGOING" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="Merchant Out Amount">
            <CopyableText value={String(tx.merchantOutAmount)}>
              {tx.merchantOutAmount.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="Merchant Out Confirmed">
            <CopyableText value={String(tx.merchantOutAmountConfirmed)}>
              {tx.merchantOutAmountConfirmed.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="Provider Out Amount">
            <CopyableText value={String(tx.providerOutAmount)}>
              {tx.providerOutAmount.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="Provider Out Confirmed">
            <CopyableText value={String(tx.providerOutAmountConfirmed)}>
              {tx.providerOutAmountConfirmed.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
            </CopyableText>
          </DrawerField>
        </div>
      </DrawerSection>

      {/* Fees */}
      <DrawerSection title="FEES" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="Fee Amount">
            <CopyableText value={String(tx.feeAmount)}>
              {tx.feeAmount.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.feeCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="Fee Confirmed">
            <CopyableText value={String(tx.feeAmountConfirmed)}>
              {tx.feeAmountConfirmed.toLocaleString("en-US")}{" "}
              <span className="text-[var(--text-secondary)]">{tx.feeCurrency}</span>
            </CopyableText>
          </DrawerField>
          <DrawerField label="Merchant Fee %">{tx.merchantFeePct}%</DrawerField>
          <DrawerField label="Provider Fee %">{tx.providerFeePct}%</DrawerField>
        </div>
      </DrawerSection>
    </div>
  );
}

function RoutingTabContent({ tx }: { tx: TransactionViewModel }) {
  return (
    <div className="space-y-6">
      <DrawerEntityCard name={tx.merchantName} id={tx.merchantId}>
        <DrawerField label="Merchant Tx ID">
          <CopyableText value={tx.merchantTxId} textClassName="font-mono text-xs" />
        </DrawerField>
        <DrawerField label="Client ID">
          <CopyableText value={tx.merchantClientId} textClassName="font-mono text-xs" />
        </DrawerField>
      </DrawerEntityCard>

      <DrawerEntityCard name={tx.provider}>
        <DrawerField label="Provider Tx ID">
          <CopyableText value={tx.providerTxId} textClassName="font-mono text-xs" />
        </DrawerField>
        <DrawerField label="Base Rate Type">{tx.baseRateType}</DrawerField>
      </DrawerEntityCard>

      {/* Payment */}
      <DrawerSection title="PAYMENT" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="Payment Method">{formatEnumLabel(tx.paymentMethod)}</DrawerField>
          <DrawerField label="Payment System">{tx.paymentSystem}</DrawerField>
          <DrawerField label="Payment Requisite">
            <CopyableText value={tx.paymentRequisite}>{tx.paymentRequisite}</CopyableText>
          </DrawerField>
          <DrawerField label="Requisite Full Name">
            <CopyableText value={tx.paymentRequisiteFullName}>
              {tx.paymentRequisiteFullName}
            </CopyableText>
          </DrawerField>
          <DrawerField label="Payment Expires">{tx.paymentExpiresAt}</DrawerField>
          <DrawerField label="Widget ID">
            <CopyableText value={tx.widgetId}>{tx.widgetId}</CopyableText>
          </DrawerField>
          <DrawerField label="Bank Requested">{tx.bankNameRequested}</DrawerField>
        </div>
      </DrawerSection>
    </div>
  );
}

function MetaTabContent({ tx }: { tx: TransactionViewModel }) {
  return (
    <div className="space-y-6">
      {/* Flags */}
      <DrawerSection title="FLAGS" card>
        <DrawerFlagGrid>
          <DrawerFlagItem label="Balance Released" value={tx.isBalanceReleased} />
          <DrawerFlagItem label="Balance Reserved" value={tx.isBalanceReserved} />
          <DrawerFlagItem label="Manual Confirmed" value={tx.isManualConfirmed} />
          <DrawerFlagItem label="Requisite Pool" value={tx.isRequisitePool} />
          <DrawerFlagItem label="Variable on Create" value={tx.allowVariableAmountOnCreation} />
        </DrawerFlagGrid>
      </DrawerSection>

      {/* Links */}
      <DrawerSection title="LINKS" card>
        <div className="space-y-3">
          <DrawerField label="QR National Link">
            {tx.paymentLinkQrNational ? (
              <CopyableText value={tx.paymentLinkQrNational}>{tx.paymentLinkQrNational}</CopyableText>
            ) : (
              "—"
            )}
          </DrawerField>
          <DrawerField label="Bank Direct Link">
            {tx.paymentLinkBankDirect ? (
              <CopyableText value={tx.paymentLinkBankDirect}>{tx.paymentLinkBankDirect}</CopyableText>
            ) : (
              "—"
            )}
          </DrawerField>
        </div>
      </DrawerSection>

      {/* Timestamps */}
      <DrawerSection title="TIMESTAMPS" card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DrawerField label="Created At">
            <CopyableText value={tx.createdAt}>{tx.createdAt}</CopyableText>
          </DrawerField>
          <DrawerField label="Updated At">
            <CopyableText value={tx.updatedAt}>{tx.updatedAt}</CopyableText>
          </DrawerField>
          <DrawerField label="Completed At">
            <CopyableText value={tx.completedAt}>{tx.completedAt}</CopyableText>
          </DrawerField>
        </div>
      </DrawerSection>
    </div>
  );
}

function TransactionExpandedContent({
  tx,
  onAction,
}: {
  tx: TransactionViewModel;
  onAction: (tx: TransactionViewModel, action: string) => void;
}) {
  return (
    <div className="[container-type:inline-size] h-full overflow-y-auto space-y-3">
      {/* ── Top row: Overview+Actions | Money ─────────────────── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "2fr 3fr" }}>
        {/* ── Left column: Overview + Actions stacked ─────────── */}
        <div className="flex flex-col gap-3">
          {/* Overview card */}
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Overview
            </p>

            {/* Summary cards */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              <DrawerSummaryCard
                label="Amount"
                value={
                  <>
                    {tx.inAmount.toLocaleString("en-US")}{" "}
                    <span className="text-[var(--text-secondary)] font-normal">
                      {tx.inCurrency}
                    </span>
                  </>
                }
                sub={
                  <>
                    → {tx.merchantOutAmount.toLocaleString("en-US")} <span>{tx.outCurrency}</span>
                  </>
                }
              />
              <DrawerSummaryCard
                label="Fee"
                value={
                  <>
                    {tx.feeAmount.toLocaleString("en-US")}{" "}
                    <span className="text-[var(--text-secondary)] font-normal">
                      {tx.feeCurrency}
                    </span>
                  </>
                }
                sub={`${tx.merchantFeePct}%`}
              />
              <DrawerSummaryCard
                label="Geo"
                value={tx.geo}
                sub={formatEnumLabel(tx.paymentMethod)}
              />
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <DrawerField label="Direction">{formatEnumLabel(tx.direction)}</DrawerField>
              <DrawerField label="Merchant">
                <CopyableText value={tx.merchantName}>{tx.merchantName}</CopyableText>
              </DrawerField>
              <DrawerField label="Provider">
                <CopyableText value={tx.provider}>{tx.provider}</CopyableText>
              </DrawerField>
              <DrawerField label="Payment Method">{formatEnumLabel(tx.paymentMethod)}</DrawerField>
              <DrawerField label="Created">
                <CopyableText value={tx.createdAt}>{tx.createdAt}</CopyableText>
              </DrawerField>
              <DrawerField label="Completed">
                <CopyableText value={tx.completedAt}>{tx.completedAt}</CopyableText>
              </DrawerField>
            </div>
          </div>

          {/* Actions card */}
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Actions
            </p>
            <DrawerActionGroup variant="flat" sections={buildRowActionSections(tx, onAction)} />
          </div>
        </div>

        {/* ── Money (right column, row 1) ────────────────────── */}
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Money
          </p>

          {/* Rates */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <DrawerSummaryCard
              label="Merchant Rate"
              value={tx.merchantRate.toLocaleString("en-US")}
              sub={`${tx.inCurrency} → ${tx.outCurrency}`}
            />
            <DrawerSummaryCard
              label="Provider Rate"
              value={tx.providerRate.toLocaleString("en-US")}
              sub={`${tx.inCurrency} → ${tx.outCurrency}`}
            />
            <DrawerSummaryCard
              label="Base Rate"
              value={tx.baseRate.toLocaleString("en-US")}
              sub={tx.baseRateType}
            />
          </div>

          <DrawerSection title="INCOMING">
            <div className="grid grid-cols-4 gap-x-4 gap-y-3">
              <DrawerField label="In Amount">
                <CopyableText value={String(tx.inAmount)}>
                  {tx.inAmount.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.inCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="In Confirmed">
                <CopyableText value={String(tx.inAmountConfirmed)}>
                  {tx.inAmountConfirmed.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.inCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="In Initial">
                <CopyableText value={String(tx.inAmountInitial)}>
                  {tx.inAmountInitial.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.inCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="Variable Amount">
                {tx.isVariableAmount ? "Yes" : "No"}
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="OUTGOING">
            <div className="grid grid-cols-4 gap-x-4 gap-y-3">
              <DrawerField label="Merchant Out">
                <CopyableText value={String(tx.merchantOutAmount)}>
                  {tx.merchantOutAmount.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="Merch. Confirmed">
                <CopyableText value={String(tx.merchantOutAmountConfirmed)}>
                  {tx.merchantOutAmountConfirmed.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="Provider Out">
                <CopyableText value={String(tx.providerOutAmount)}>
                  {tx.providerOutAmount.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="Prov. Confirmed">
                <CopyableText value={String(tx.providerOutAmountConfirmed)}>
                  {tx.providerOutAmountConfirmed.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.outCurrency}</span>
                </CopyableText>
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="FEES">
            <div className="grid grid-cols-4 gap-x-4 gap-y-3">
              <DrawerField label="Fee Amount">
                <CopyableText value={String(tx.feeAmount)}>
                  {tx.feeAmount.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.feeCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="Fee Confirmed">
                <CopyableText value={String(tx.feeAmountConfirmed)}>
                  {tx.feeAmountConfirmed.toLocaleString("en-US")}{" "}
                  <span className="text-[var(--text-secondary)]">{tx.feeCurrency}</span>
                </CopyableText>
              </DrawerField>
              <DrawerField label="Merchant Fee %">{tx.merchantFeePct}%</DrawerField>
              <DrawerField label="Provider Fee %">{tx.providerFeePct}%</DrawerField>
            </div>
          </DrawerSection>
        </div>
      </div>

      {/* ── Bottom row: Routing (2/3) | Meta (1/3) ────────────── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* ── Routing ───────────────────────────────────────── */}
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Routing
          </p>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <DrawerEntityCard name={tx.merchantName} id={tx.merchantId}>
              <DrawerField label="Merchant Tx ID">
                <CopyableText value={tx.merchantTxId} textClassName="font-mono text-xs" />
              </DrawerField>
              <DrawerField label="Client ID">
                <CopyableText value={tx.merchantClientId} textClassName="font-mono text-xs" />
              </DrawerField>
            </DrawerEntityCard>

            <DrawerEntityCard name={tx.provider} id={tx.providerTxId}>
              <DrawerField label="Provider Tx ID">
                <CopyableText value={tx.providerTxId} textClassName="font-mono text-xs" />
              </DrawerField>
              <DrawerField label="Base Rate Type">{tx.baseRateType}</DrawerField>
            </DrawerEntityCard>
          </div>

          <DrawerSection title="PAYMENT">
            <div className="grid grid-cols-4 gap-x-4 gap-y-5">
              <DrawerField label="Payment Method">{formatEnumLabel(tx.paymentMethod)}</DrawerField>
              <DrawerField label="Payment System">{tx.paymentSystem}</DrawerField>
              <DrawerField label="Requisite">
                <CopyableText value={tx.paymentRequisite}>{tx.paymentRequisite}</CopyableText>
              </DrawerField>
              <DrawerField label="Full Name">
                <CopyableText value={tx.paymentRequisiteFullName}>
                  {tx.paymentRequisiteFullName}
                </CopyableText>
              </DrawerField>
              <DrawerField label="Expires">{tx.paymentExpiresAt}</DrawerField>
              <DrawerField label="Widget ID">
                <CopyableText value={tx.widgetId}>{tx.widgetId}</CopyableText>
              </DrawerField>
              <DrawerField label="Bank Requested">{tx.bankNameRequested}</DrawerField>
            </div>
          </DrawerSection>
        </div>

        {/* ── Meta ──────────────────────────────────────────── */}
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Meta
          </p>

          <DrawerSection title="FLAGS">
            <DrawerFlagGrid>
              <DrawerFlagItem label="Balance Released" value={tx.isBalanceReleased} />
              <DrawerFlagItem label="Balance Reserved" value={tx.isBalanceReserved} />
              <DrawerFlagItem label="Manual Confirmed" value={tx.isManualConfirmed} />
              <DrawerFlagItem label="Requisite Pool" value={tx.isRequisitePool} />
              <DrawerFlagItem label="Variable on Create" value={tx.allowVariableAmountOnCreation} />
            </DrawerFlagGrid>
          </DrawerSection>

          <DrawerSection title="LINKS">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DrawerField label="QR National Link">
                {tx.paymentLinkQrNational ? (
                  <CopyableText value={tx.paymentLinkQrNational}>{tx.paymentLinkQrNational}</CopyableText>
                ) : (
                  "—"
                )}
              </DrawerField>
              <DrawerField label="Bank Direct Link">
                {tx.paymentLinkBankDirect ? (
                  <CopyableText value={tx.paymentLinkBankDirect}>{tx.paymentLinkBankDirect}</CopyableText>
                ) : (
                  "—"
                )}
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="TIMESTAMPS">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DrawerField label="Created At">
                <CopyableText value={tx.createdAt}>{tx.createdAt}</CopyableText>
              </DrawerField>
              <DrawerField label="Updated At">
                <CopyableText value={tx.updatedAt}>{tx.updatedAt}</CopyableText>
              </DrawerField>
              <DrawerField label="Completed At">
                <CopyableText value={tx.completedAt}>{tx.completedAt}</CopyableText>
              </DrawerField>
            </div>
          </DrawerSection>
        </div>
      </div>
    </div>
  );
}

export function TransactionDrawerContent({
  transaction: tx,
  onAction,
}: TransactionDrawerContentProps) {
  const isExpanded = useDrawerExpanded();

  if (isExpanded) {
    return <TransactionExpandedContent tx={tx} onAction={onAction} />;
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* Actions — always visible above tabs */}
      <DrawerActionGroup variant="flat" sections={buildRowActionSections(tx, onAction)} />

      <TabsList className="w-full grid grid-cols-5 mt-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="money">Money</TabsTrigger>
        <TabsTrigger value="routing">Routing</TabsTrigger>
        <TabsTrigger value="meta">Meta</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="pt-4">
        <OverviewTabContent tx={tx} />
      </TabsContent>

      <TabsContent value="money" className="pt-4">
        <MoneyTabContent tx={tx} />
      </TabsContent>

      <TabsContent value="routing" className="pt-4">
        <RoutingTabContent tx={tx} />
      </TabsContent>

      <TabsContent value="meta" className="pt-4">
        <MetaTabContent tx={tx} />
      </TabsContent>

      <TabsContent value="all" className="pt-4 space-y-6">
        <OverviewTabContent tx={tx} />
        <MoneyTabContent tx={tx} />
        <RoutingTabContent tx={tx} />
        <MetaTabContent tx={tx} />
      </TabsContent>
    </Tabs>
  );
}
