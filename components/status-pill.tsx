interface StatusPillProps {
  label: string;
  passed: boolean;
}

export function StatusPill({ label, passed }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
        passed
          ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200"
          : "bg-amber-100 text-amber-950 ring-1 ring-amber-200"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${passed ? "bg-emerald-600" : "bg-amber-600"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
