import type { AuditApiResponse } from "@/lib/types";

import { StatusPill } from "@/components/status-pill";

interface ResultsPanelProps {
  result: AuditApiResponse;
}

function ResultRow({
  label,
  passed,
  details,
}: {
  label: string;
  passed: boolean;
  details: string;
}) {
  return (
    <div
      className={`border-2 p-5 ${
        passed
          ? "border-[var(--ink-strong)] bg-white"
          : "border-[var(--accent-red)] bg-[var(--accent-red-soft)]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ink-strong)]">{label}</p>
          <p className={`mt-2 text-sm leading-6 ${passed ? "text-[var(--muted)]" : "text-[var(--accent-red)]"}`}>
            {details}
          </p>
        </div>
        <StatusPill label={passed ? "Pass" : "Fail"} passed={passed} />
      </div>
    </div>
  );
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@chiwebdev.com";
  const hostname = new URL(result.finalUrl).hostname;
  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent("Want this fixed for me")}&body=${encodeURIComponent(`I saw the chiwebdev.com audit preview for ${result.finalUrl} and would like help fixing it.`)}`;
  const checks = [
    {
      label: result.tracking.gtm.label,
      passed: result.tracking.gtm.detected,
      details: result.tracking.gtm.details,
    },
    {
      label: result.tracking.ga4.label,
      passed: result.tracking.ga4.detected,
      details: result.tracking.ga4.details,
    },
    {
      label: result.tracking.metaPixel.label,
      passed: result.tracking.metaPixel.detected,
      details: result.tracking.metaPixel.details,
    },
    {
      label: result.seo.titleTag.label,
      passed: result.seo.titleTag.passed,
      details: result.seo.titleTag.details,
    },
    {
      label: result.seo.metaDescription.label,
      passed: result.seo.metaDescription.passed,
      details: result.seo.metaDescription.details,
    },
  ];

  return (
    <section id="audit-results" className="border-2 border-[var(--ink-strong)] bg-[var(--surface-strong)]">
      <div className="h-4 border-b-2 border-[var(--ink-strong)] bg-[var(--background)]" />

      <div className="grid gap-4 border-b-2 border-[var(--ink-strong)] px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Audit preview
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
            Snapshot for {hostname}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{result.summary}</p>
        </div>
        <div className="border-2 border-[var(--ink-strong)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--muted)]">
          <p className="font-medium uppercase tracking-[0.14em] text-[var(--ink-strong)]">Delivery</p>
          <p className="mt-1 leading-6">{result.delivery.message}</p>
        </div>
      </div>

      <div className="grid gap-0 border-b-2 border-[var(--ink-strong)] md:grid-cols-2 xl:grid-cols-3">
        {checks.map((check) => (
          <ResultRow key={check.label} label={check.label} passed={check.passed} details={check.details} />
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-[var(--ink-strong)] px-5 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.72)]">
            Plain-English summary
          </p>
          <p className="mt-4 text-base leading-8 text-white">{result.teaser.simpleExplanation}</p>
          <p className="mt-4 text-sm leading-7 text-[rgba(255,255,255,0.78)]">{result.teaser.businessImpact}</p>
        </div>

        <div className="border-t-2 border-[var(--ink-strong)] bg-white px-5 py-5 lg:border-l-2 lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            First fixes
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
            {result.teaser.actionableFixes.map((fix, index) => (
              <li key={`${index}-${fix}`} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 bg-[var(--accent-red)]" aria-hidden="true" />
                <span>{fix}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            Want help making the changes? Reply to the emailed report or use the button below.
          </p>

          <a
            href={mailtoHref}
            className="mt-6 inline-flex items-center justify-center border-2 border-[var(--ink-strong)] bg-[var(--accent-red)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--ink-strong)]"
          >
            Fix this
          </a>
        </div>
      </div>
    </section>
  );
}
