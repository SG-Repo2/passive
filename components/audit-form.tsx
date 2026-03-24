"use client";

import { useState, useTransition } from "react";

import type { AuditSubmissionResponse } from "@/lib/types";

export function AuditForm() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditSubmissionResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

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

          setResult(payload as AuditSubmissionResponse);
          setWebsiteUrl("");
          setEmail("");
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
      <form onSubmit={handleSubmit} className="border-2 border-[var(--ink-strong)] bg-[var(--surface-strong)]">
        <div className="border-b-2 border-[var(--ink-strong)] bg-white px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Run the audit
            </p>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-strong)]">
              2 inputs
            </span>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
            Submit the homepage.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--muted)]">
            Add the public homepage and the best email for follow-up. We review visible tracking and
            search essentials only.
          </p>
        </div>

        <div className="grid gap-5 bg-[var(--surface-muted)] px-5 py-5">
          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="website-url" className="text-sm font-semibold text-[var(--ink-strong)]">
                Business website
              </label>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                Public homepage
              </span>
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
              className="mt-2 w-full border-2 border-[var(--ink-strong)] bg-white px-4 py-4 text-base text-[var(--ink-strong)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent-red)] focus-visible:outline-none"
              required
            />
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use the page you want customers landing on first.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="email" className="text-sm font-semibold text-[var(--ink-strong)]">
                Best email
              </label>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                Follow-up
              </span>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full border-2 border-[var(--ink-strong)] bg-white px-4 py-4 text-base text-[var(--ink-strong)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent-red)] focus-visible:outline-none"
              required
            />
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              We use this to follow up after we review the submission.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center border-2 border-[var(--ink-strong)] bg-[var(--accent-red)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--ink-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Submitting site" : "Submit for review"}
          </button>
        </div>

        <div className="border-t-2 border-[var(--ink-strong)] bg-white px-5 py-4">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--ink-strong)]">
            After submission
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            We review the audit internally and follow up by email if the site appears reachable.
          </p>
        </div>

        {error ? (
          <div className="border-t-2 border-[var(--accent-red)] bg-[var(--accent-red-soft)] px-5 py-3 text-sm font-medium text-[var(--accent-red)]">
            {error}
          </div>
        ) : null}
      </form>

      {result ? (
        <section
          id="audit-confirmation"
          className="border-2 border-[var(--ink-strong)] bg-[var(--surface-strong)]"
        >
          <div className="border-b-2 border-[var(--ink-strong)] bg-white px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Submission received
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
              {result.message}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{result.followUp}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
