import { AuditForm } from "@/components/audit-form";

const valuePoints = [
  "Detects GTM, GA4, and Meta Pixel from public HTML.",
  "Checks whether the page has a title tag and meta description.",
  "Adds a plain-English summary with business-focused next steps.",
];

const trustPoints = [
  "Built for zero-maintenance Vercel deployment.",
  "No authentication, no database, no CRM dependency.",
  "Resend integration included with a mock fallback for local dev.",
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8%] top-24 h-72 w-72 rounded-full bg-[rgba(214,165,69,0.18)] blur-3xl" />
        <div className="absolute right-[-5%] top-16 h-80 w-80 rounded-full bg-[rgba(15,95,143,0.16)] blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-[linear-gradient(180deg,transparent_0%,rgba(19,32,51,0.06)_100%)]" />
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10 lg:py-12">
        <div className="rounded-[2rem] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:p-10">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                Chicago Web Lead Gen
              </p>
              <h1 className="mt-5 font-heading text-5xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
                Free Website Audit for Chicago Businesses
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Turn a cold website visit into a warm sales conversation. This MVP audits the essentials,
                generates a plain-English report, and emails the full write-up without any manual follow-up.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                {valuePoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.55)]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <AuditForm />
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.4)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">How It Works</p>
            <ol className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              <li>
                1. A visitor submits their website and email on the landing page.
              </li>
              <li>
                2. A serverless route fetches the public HTML, checks tracking tags, and verifies SEO basics.
              </li>
              <li>
                3. The app creates an AI-enhanced explanation, emails the full report, and shows a teaser preview.
              </li>
            </ol>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 text-slate-100 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.65)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Deployment Notes</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-300">
                  {point}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              This audit reads publicly available HTML only, so tags injected after login or by advanced bot
              protections may not show up in the results.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
