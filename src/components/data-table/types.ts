import type { CSSProperties } from "react";

// ─── Core Types ──────────────────────────────────────────

export type SortDirection = "asc" | "desc" | false;
export type ViewMode = "list" | "grid";
export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "purple"
  | "sky"
  | "indigo";

// ─── Column Metadata ─────────────────────────────────────

export interface ColumnMetaDef {
  minW: number;
  sticky?: "left" | "right";
  stickyOffset?: number;
  borderEdge?: "right" | "left" | null;
  variant?: "control";
}

// ─── Bulk Actions ────────────────────────────────────────

export interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

// ─── Row Actions Menu ────────────────────────────────────

export type RowActionVariant = "default" | "danger" | "accent";

export interface RowActionItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: RowActionVariant;
  disabled?: boolean;
}

export interface RowActionSection {
  label: string;
  actions: RowActionItem[];
}

// ─── Status Config (generic) ─────────────────────────────

export interface StatusConfigEntry {
  label: string;
  variant: BadgeVariant;
}

// ─── Sticky helpers return type ──────────────────────────

export type StickyStyleResult = CSSProperties | undefined;
