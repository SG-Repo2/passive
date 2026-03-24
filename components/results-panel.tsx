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
      className={`rounded-[1.5rem] border p-5 shadow-[0_18px_40px_-32px_var(--shadow)] ${
        passed
          ? "border-[rgba(65,164,220,0.2)] bg-[rgba(65,164,220,0.06)]"
          : "border-[rgba(214,66,76,0.2)] bg-[rgba(214,66,76,0.05)]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-strong)]">{label}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{details}</p>
        </div>
        <StatusPill label={passed ? "Pass" : "Fail"} passed={passed} />
      </div>
    </div>
  );
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@chiwebdev.com";
  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent("Want this fixed for me")}&body=${encodeURIComponent(`I saw the chiwebdev.com audit preview for ${result.finalUrl} and would like help fixing it.`)}`;

  return (
    <section
      id="audit-results"
      className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.94)] p-6 shadow-[0_24px_60px_-40px_var(--shadow)] xl:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Audit Preview
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
            Snapshot for {new URL(result.finalUrl).hostname}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{result.summary}</p>
        </div>
        <div className="rounded-[1.5rem] border border-[rgba(65,164,220,0.18)] bg-[rgba(65,164,220,0.08)] px-4 py-3 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--ink-strong)]">Delivery</p>
          <p className="mt-1 leading-6">{result.delivery.message}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ResultRow
          label={result.tracking.gtm.label}
          passed={result.tracking.gtm.detected}
          details={result.tracking.gtm.details}
        />
        <ResultRow
          label={result.tracking.ga4.label}
          passed={result.tracking.ga4.detected}
          details={result.tracking.ga4.details}
        />
        <ResultRow
          label={result.tracking.metaPixel.label}
          passed={result.tracking.metaPixel.detected}
          details={result.tracking.metaPixel.details}
        />
        <ResultRow
          label={result.seo.titleTag.label}
          passed={result.seo.titleTag.passed}
          details={result.seo.titleTag.details}
        />
        <ResultRow
          label={result.seo.metaDescription.label}
          passed={result.seo.metaDescription.passed}
          details={result.seo.metaDescription.details}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] bg-[linear-gradient(145deg,#10263b_0%,#163b58_100%)] px-6 py-6 text-slate-100 shadow-[0_24px_55px_-38px_rgba(8,24,40,0.75)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.7)]">
            Plain-English Readout
          </p>
          <p className="mt-4 text-base leading-8 text-white">{result.teaser.simpleExplanation}</p>
          <p className="mt-4 text-sm leading-7 text-[rgba(255,255,255,0.78)]">{result.teaser.businessImpact}</p>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,rgba(247,250,252,0.96)_100%)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            First Fixes
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
            {result.teaser.actionableFixes.map((fix, index) => (
              <li key={`${index}-${fix}`} className="flex gap-3">
                <span
                  className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent-red)]"
                  aria-hidden="true"
                />
                <span>{fix}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            Want help making the changes? Reply to the emailed report or use the button below.
          </p>

          <a
            href={mailtoHref}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(30,127,182,0.9)] transition hover:bg-[#176a96]"
          >
            Want this fixed for you?
          </a>
        </div>
      </div>
    </section>
  );
}
