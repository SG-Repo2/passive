interface StatusPillProps {
  label: string;
  passed: boolean;
}

export function StatusPill({ label, passed }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 border-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        passed
          ? "border-[var(--ink-strong)] bg-[var(--surface-muted)] text-[var(--ink-strong)]"
          : "border-[var(--accent-red)] bg-[var(--accent-red-soft)] text-[var(--accent-red)]"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 ${passed ? "bg-[var(--accent)]" : "bg-[var(--accent-red)]"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
