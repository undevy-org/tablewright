interface EmptyStateProps {
  message: string;
  colSpan: number;
}

export function EmptyState({ message, colSpan }: EmptyStateProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-16 text-center text-[13px] text-[var(--text-secondary)]"
      >
        {message}
      </td>
    </tr>
  );
}
