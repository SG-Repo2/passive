"use client";

import { useState, useTransition } from "react";

import { ResultsPanel } from "@/components/results-panel";
import type { AuditApiResponse } from "@/lib/types";

export function AuditForm() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditApiResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/audit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: websiteUrl,
              email,
            }),
          });

          const payload = (await response.json()) as unknown;

          if (!response.ok) {
            const message =
              typeof payload === "object" &&
              payload !== null &&
              "error" in payload &&
              typeof payload.error === "string"
                ? payload.error
                : "Something went wrong while running the audit.";

            throw new Error(message);
          }

          setResult(payload as AuditApiResponse);
          document.getElementById("audit-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (submissionError) {
          setResult(null);
          setError(
            submissionError instanceof Error
              ? submissionError.message
              : "Something went wrong while running the audit.",
          );
        }
      })();
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_28px_65px_-40px_var(--shadow)] xl:p-8"
      >
        <div className="mb-6 border-b border-[var(--line)] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Free Chicago Audit
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.02em] text-[var(--ink-strong)]">
            Get your website report
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--muted)]">
            Enter your homepage and where to send the results. We will review the basics that help people
            find you, trust you, and contact you.
          </p>
        </div>

        <div className="grid gap-5">
          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="website-url" className="text-sm font-semibold text-[var(--ink-strong)]">
                Business website
              </label>
              <span className="text-xs font-medium text-[var(--muted)]">Public homepage works best</span>
            </div>
            <input
              id="website-url"
              name="website-url"
              type="text"
              placeholder="https://example.com"
              autoComplete="url"
              inputMode="url"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              className="mt-2 w-full rounded-[1.25rem] border border-[rgba(16,38,59,0.16)] bg-white px-4 py-3.5 text-base text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(65,164,220,0.16)]"
              required
            />
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use the page you want customers landing on first.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="email" className="text-sm font-semibold text-[var(--ink-strong)]">
                Work email
              </label>
              <span className="text-xs font-medium text-[var(--muted)]">Where we send the full report</span>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-[1.25rem] border border-[rgba(16,38,59,0.16)] bg-white px-4 py-3.5 text-base text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(65,164,220,0.16)]"
              required
            />
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              We only use this address to deliver your audit and follow-up if you reply.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent-strong)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(30,127,182,0.9)] transition hover:bg-[#176a96] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Running your audit..." : "Email my free audit"}
          </button>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-[rgba(65,164,220,0.16)] bg-[rgba(65,164,220,0.08)] px-4 py-4">
          <p className="text-sm font-medium text-[var(--ink-strong)]">What happens after you submit</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            We email the full report first, then unlock a short preview below. No login or setup required.
          </p>
        </div>

        {error ? (
          <div className="mt-4 rounded-[1.25rem] border border-[rgba(214,66,76,0.24)] bg-[rgba(214,66,76,0.08)] px-4 py-3 text-sm text-[var(--ink-strong)]">
            {error}
          </div>
        ) : null}
      </form>

      {result ? <ResultsPanel result={result} /> : null}
    </div>
  );
}
