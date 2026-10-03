function splitTimestamp(value: string | null) {
  if (!value) return { date: "\u2014", time: "" };
  const [date, time] = value.split(" ");
  return { date: date ?? "\u2014", time: time ?? "" };
}

export function TimestampCell({ value }: { value: string | null }) {
  const { date, time } = splitTimestamp(value);

  return (
    <div className="space-y-1 text-left font-mono">
      <div className="text-[13px] font-medium text-[var(--text-primary)]">{date}</div>
      {time ? <div className="text-[12px] text-[var(--text-secondary)]">{time}</div> : null}
    </div>
  );
}
