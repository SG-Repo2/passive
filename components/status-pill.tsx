interface StatusPillProps {
  label: string;
  passed: boolean;
}

export function StatusPill({ label, passed }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        passed
          ? "bg-[rgba(65,164,220,0.14)] text-[var(--ink-strong)] ring-1 ring-[rgba(65,164,220,0.26)]"
          : "bg-[rgba(214,66,76,0.1)] text-[var(--ink-strong)] ring-1 ring-[rgba(214,66,76,0.22)]"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${passed ? "bg-[var(--accent-strong)]" : "bg-[var(--accent-red)]"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
