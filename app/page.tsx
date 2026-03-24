import { AuditForm } from "@/components/audit-form";

function FlagStar({ className = "h-12 w-12 text-[var(--accent-red)]" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <polygon points="12,1 14.9,6.5 21,6 16.8,10.8 18.7,17 12,13.8 5.3,17 7.2,10.8 3,6 9.1,6.5" />
      <polygon points="12,23 9.1,17.5 3,18 7.2,13.2 5.3,7 12,10.2 18.7,7 16.8,13.2 21,18 14.9,17.5" />
    </svg>
  );
}

const trustPoints = [
  {
    title: "Chicago-based",
    description: "Built for local firms that want facts quickly, without agency theater or inflated claims.",
  },
  {
    title: "Public-page only",
    description: "The audit checks what customers can actually see on the homepage, nothing behind a login.",
  },
  {
    title: "Plain-English report",
    description: "You get a short email with the first fixes worth making, written for owners and operators.",
  },
];

const coveragePoints = [
  {
    title: "Tracking setup",
    description: "GTM, GA4, and Meta Pixel are checked directly from the public page source.",
  },
  {
    title: "Search basics",
    description: "Title tags and meta descriptions are reviewed for obvious missed signals.",
  },
  {
    title: "First fixes",
    description: "The report explains what matters, what does not, and what to fix first.",
  },
];

const workflowPoints = [
  "Send the homepage URL and the email where the report should land.",
  "The audit checks visible tracking and search signals on the public homepage.",
  "You see a short preview on the page and the full report arrives by email.",
];

const guardrails = [
  "No credit card. No login. No fake score.",
  "Grounded recommendations based on what is visible in public HTML.",
  "Useful before a redesign, campaign launch, or paid traffic push.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl overflow-hidden border-2 border-[var(--ink-strong)] bg-[var(--surface)] [box-shadow:12px_12px_0_0_var(--ink-strong)]">
        <div className="h-5 border-b-2 border-[var(--ink-strong)] bg-[var(--background)]" />

        <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--ink-strong)] bg-white px-6 py-4 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Chicago Website Audit
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Clear website checks for Chicago businesses that need trust fast.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-strong)]">
            Chicago, Illinois
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
          <div className="border-b-2 border-[var(--ink-strong)] px-6 py-10 lg:px-10 lg:py-14">
            <div className="flex items-center gap-4">
              <span className="h-[2px] flex-1 bg-[var(--ink-strong)]" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-strong)]">
                Built for local credibility
              </p>
            </div>

            <h1 className="mt-8 max-w-4xl font-heading text-[3.2rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--ink-strong)] sm:text-[4.25rem]">
              See what your website is missing before it costs you leads.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              We review the public homepage for tracking setup, search basics, and obvious missed
              signals, then email a short report with the first fixes worth making.
            </p>
            <p className="mt-5 max-w-2xl text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-strong)]">
              No login. No credit card. No padded language.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustPoints.map((point) => (
                <div
                  key={point.title}
                  className="border-2 border-[var(--ink-strong)] bg-[var(--surface-muted)] px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                    {point.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{point.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b-2 border-[var(--ink-strong)] bg-[var(--background)] px-6 py-10 lg:border-b-0 lg:border-l-2 lg:px-8 lg:py-14">
            <AuditForm />
          </div>
        </div>

        <div className="grid border-y-2 border-[var(--ink-strong)] lg:grid-cols-[1.12fr_0.88fr]">
          <div className="px-6 py-5 lg:px-10">
            <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-6">
              <FlagStar className="h-10 w-10 text-[var(--accent-red)] sm:h-14 sm:w-14" />
              <FlagStar className="h-10 w-10 text-[var(--accent-red)] sm:h-14 sm:w-14" />
              <FlagStar className="h-10 w-10 text-[var(--accent-red)] sm:h-14 sm:w-14" />
              <FlagStar className="h-10 w-10 text-[var(--accent-red)] sm:h-14 sm:w-14" />
            </div>
          </div>
          <div className="border-t-2 border-[var(--ink-strong)] bg-white px-6 py-5 lg:border-l-2 lg:border-t-0 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Why this converts
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              The page leads with scope, not hype. Business owners can see exactly what gets checked,
              how the audit works, and why the output is useful before they submit.
            </p>
          </div>
        </div>

        <section className="grid lg:grid-cols-[1.12fr_0.88fr]">
          <div className="border-b-2 border-[var(--ink-strong)] px-6 py-8 lg:border-b-0 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent-strong)]">
              What gets checked
            </p>
            <div className="mt-6 grid gap-4">
              {coveragePoints.map((point) => (
                <div
                  key={point.title}
                  className="grid gap-3 border-2 border-[var(--ink-strong)] bg-white px-5 py-5 md:grid-cols-[12rem_1fr] md:items-start"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-strong)]">
                    {point.title}
                  </p>
                  <p className="text-sm leading-7 text-[var(--muted)]">{point.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface-muted)] px-6 py-8 lg:border-l-2 lg:border-[var(--ink-strong)] lg:px-8 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent-strong)]">
              How it works
            </p>
            <ol className="mt-6 space-y-4">
              {workflowPoints.map((point, index) => (
                <li key={point} className="flex gap-4 border-b border-[var(--line)] pb-4 last:border-b-0 last:pb-0">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[var(--ink-strong)] bg-[var(--accent-red)] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-[var(--muted)]">{point}</p>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--accent-strong)]">
              Guardrails
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
              {guardrails.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 bg-[var(--accent-red)]" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
              The audit reads public HTML only. Content hidden behind login, cookie consent, or strict bot
              protection may not appear in the output.
            </p>
          </div>
        </section>

        <div className="h-5 border-t-2 border-[var(--ink-strong)] bg-[var(--background)]" />
      </section>
    </main>
  );
}
