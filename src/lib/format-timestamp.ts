export const displayTimeZone = "UTC";

export function formatDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: displayTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

export function parsePossibleTimestamp(value: string | null | undefined): Date | null {
  if (!value || value === "0") return null;

  if (/^\d+$/.test(value)) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    const milliseconds = value.length > 10 ? numeric : numeric * 1000;
    const numericDate = new Date(milliseconds);
    return Number.isNaN(numericDate.getTime()) ? null : numericDate;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatLiveTimestamp(value: string | null | undefined): string | null {
  const date = parsePossibleTimestamp(value);
  return date ? formatDateParts(date) : null;
}
