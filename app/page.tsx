import { AuditForm } from "@/components/audit-form";

const valuePoints = [
  {
    title: "Tracking basics",
    description: "Checks for common tags like GTM, GA4, and Meta Pixel on your public-facing page.",
  },
  {
    title: "SEO essentials",
    description: "Reviews the title tag and meta description so you can spot easy search visibility gaps.",
  },
  {
    title: "Clear next steps",
    description: "Emails a plain-English summary with practical fixes you can act on right away.",
  },
];

const workflowPoints = [
  "Enter your website and email address.",
  "We scan the public page for tracking and SEO basics.",
  "You get a quick preview on-screen and the full report by email.",
];

const trustPoints = [
  "No login, setup, or long questionnaire.",
  "Reads public-facing HTML only, so the check stays lightweight.",
  "Written for business owners, not just marketers or developers.",
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8%] top-24 h-72 w-72 rounded-full bg-[rgba(65,164,220,0.18)] blur-3xl" />
        <div className="absolute right-[-5%] top-16 h-80 w-80 rounded-full bg-[rgba(214,66,76,0.1)] blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-[linear-gradient(180deg,transparent_0%,rgba(16,38,59,0.06)_100%)]" />
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10 lg:py-12">
        <div className="rounded-[2rem] border border-white/80 bg-[var(--surface)] p-6 shadow-[0_32px_80px_-48px_var(--shadow)] backdrop-blur-xl lg:p-10">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                Chicago Website Audit
              </p>
              <h1 className="mt-5 max-w-3xl font-heading text-5xl font-semibold tracking-[-0.03em] text-[var(--ink-strong)] md:text-6xl">
                See what your website is missing before leads slip away.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Get a free website audit built for Chicago businesses. We check tracking and SEO basics,
                then email a clear summary you can actually use.
              </p>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
                No login. No setup. Just a quick read on the essentials that help people find you and
                follow up with you.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--ink)]">
                <span className="rounded-full border border-[rgba(65,164,220,0.24)] bg-[rgba(65,164,220,0.08)] px-4 py-2 font-medium">
                  Free to run
                </span>
                <span className="rounded-full border border-[rgba(16,38,59,0.1)] bg-white px-4 py-2 font-medium">
                  Plain-English report
                </span>
                <span className="rounded-full border border-[rgba(214,66,76,0.18)] bg-[rgba(214,66,76,0.06)] px-4 py-2 font-medium">
                  Built for small business owners
                </span>
              </div>

              <div className="mt-8 grid gap-4 text-sm text-[var(--ink)] sm:grid-cols-2">
                {valuePoints.map((point) => (
                  <div
                    key={point.title}
                    className="rounded-[1.5rem] border border-[var(--line)] bg-white px-5 py-5 shadow-[0_18px_40px_-34px_var(--shadow)]"
                  >
                    <p className="text-sm font-semibold text-[var(--ink-strong)]">{point.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{point.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <AuditForm />
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_20px_50px_-42px_var(--shadow)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
              What Happens Next
            </p>
            <ol className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)]">
              {workflowPoints.map((point, index) => (
                <li key={point} className="flex gap-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-strong)]">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[2rem] border border-[rgba(16,38,59,0.08)] bg-[linear-gradient(135deg,rgba(65,164,220,0.08)_0%,rgba(255,255,255,0.96)_55%,rgba(214,66,76,0.06)_100%)] p-6 shadow-[0_20px_55px_-38px_var(--shadow)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
              Why It Feels Straightforward
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.5rem] border border-white/80 bg-white/90 px-4 py-4 text-sm leading-7 text-[var(--muted)] shadow-[0_18px_40px_-34px_var(--shadow)]"
                >
                  {point}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              Technical note: this audit reads publicly available HTML. Tags that load only after login,
              cookie consent, or heavy bot protection may not appear in the results.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
