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
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{details}</p>
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
      className="rounded-[2rem] border border-slate-200/70 bg-[rgba(255,255,255,0.9)] p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur xl:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Audit Preview</p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-slate-950">
            Snapshot for {new URL(result.finalUrl).hostname}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{result.summary}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Delivery</p>
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
        <div className="rounded-[1.75rem] bg-slate-950 px-6 py-6 text-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Teaser</p>
          <p className="mt-4 text-base leading-8 text-slate-100">{result.teaser.simpleExplanation}</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">{result.teaser.businessImpact}</p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">First Fixes</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            {result.teaser.actionableFixes.map((fix, index) => (
              <li key={`${index}-${fix}`} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--gold)]" aria-hidden="true" />
                <span>{fix}</span>
              </li>
            ))}
          </ul>

          <a
            href={mailtoHref}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Want this fixed for you?
          </a>
        </div>
      </div>
    </section>
  );
}
