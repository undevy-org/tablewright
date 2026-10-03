const URGENCY_HIDE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // hide "Expired" after 24h

function splitTimestamp(value: string | null) {
  if (!value) return { date: "\u2014", time: "" };
  const [date, time] = value.split(" ");
  return { date: date ?? "\u2014", time: time ?? "" };
}

type Urgency = "expired" | "danger" | "warning" | "ok";

function getUrgency(timestampMs: number): Urgency {
  const diff = timestampMs - Date.now();
  if (diff <= 0) return "expired";
  if (diff < 5 * 60 * 1000) return "danger";
  if (diff < 30 * 60 * 1000) return "warning";
  return "ok";
}

function formatRelative(timestampMs: number): string | null {
  const diff = timestampMs - Date.now();
  if (diff <= -URGENCY_HIDE_THRESHOLD_MS) return null; // expired long ago — no label
  if (diff <= 0) return "Expired";
  const totalMinutes = Math.ceil(diff / 60_000);
  if (totalMinutes < 60) return `in ${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  return `in ${hours} h`;
}

const urgencyClass: Record<Urgency, string> = {
  expired: "text-red-600",
  danger: "text-red-600",
  warning: "text-[var(--tag-orange-text)]",
  ok: "text-[var(--text-secondary)]",
};

interface ExpiryTimestampCellProps {
  value: string | null;
  timestampMs?: number;
}

export function ExpiryTimestampCell({ value, timestampMs }: ExpiryTimestampCellProps) {
  const { date, time } = splitTimestamp(value);

  const showUrgency = timestampMs !== undefined && timestampMs > 0;
  const ts = timestampMs ?? 0;
  const urgency = showUrgency ? getUrgency(ts) : "ok";
  const relativeLabel = showUrgency ? formatRelative(ts) : null;

  return (
    <div className="space-y-1 text-left font-mono">
      <div className="text-[13px] font-medium text-[var(--text-primary)]">{date}</div>
      {time ? <div className="text-[12px] text-[var(--text-secondary)]">{time}</div> : null}
      {relativeLabel && (
        <div className={`text-[11px] ${urgencyClass[urgency]}`}>{relativeLabel}</div>
      )}
    </div>
  );
}
