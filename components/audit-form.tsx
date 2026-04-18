"use client";

import { useState } from "react";

import type { AuditSubmissionResponse } from "@/lib/types";

function isAuditSubmissionResponse(payload: unknown): payload is AuditSubmissionResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "submitted" in payload &&
    payload.submitted === true &&
    "message" in payload &&
    typeof payload.message === "string" &&
    "followUp" in payload &&
    typeof payload.followUp === "string" &&
    "deliveryState" in payload &&
    (payload.deliveryState === "confirmed" || payload.deliveryState === "degraded")
  );
}

export function AuditForm() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditSubmissionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function readSubmissionPayload(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("application/json")) {
      try {
        return (await response.json()) as unknown;
      } catch {
        return null;
      }
    }

    const text = await response.text();
    return text ? { error: text } : null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: websiteUrl.trim(),
          email: email.trim(),
          company,
        }),
      });

      const payload = await readSubmissionPayload(response);

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

      if (!isAuditSubmissionResponse(payload)) {
        throw new Error("We received an unexpected response. Please try again.");
      }

      setResult(payload);
      setWebsiteUrl("");
      setEmail("");
      setCompany("");
    } catch (submissionError) {
      setResult(null);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while running the audit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasDegradedDelivery = result?.deliveryState === "degraded";
  const backupContactHref = result?.backupContactEmail
    ? `mailto:${result.backupContactEmail}`
    : null;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        aria-busy={isSubmitting}
        className="border-2 border-[var(--ink-strong)] bg-[var(--surface-strong)] [box-shadow:8px_8px_0_0_var(--ink-strong)] sm:[box-shadow:12px_12px_0_0_var(--ink-strong)]"
      >
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
          <div className="hidden" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </div>

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
            disabled={isSubmitting}
            className="inline-flex items-center justify-center border-2 border-[var(--ink-strong)] bg-[var(--accent-red)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--ink-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Submitting site" : "Submit for review"}
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
          <div
            aria-live="polite"
            className="border-t-2 border-[var(--accent-red)] bg-[var(--accent-red-soft)] px-5 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-red)]">
              Submission issue
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[var(--accent-red)]">{error}</p>
          </div>
        ) : null}
      </form>

      {result ? (
        <section
          id="audit-confirmation"
          aria-live="polite"
          className="border-2 border-[var(--ink-strong)] bg-[var(--surface-strong)] [box-shadow:8px_8px_0_0_var(--ink-strong)] sm:[box-shadow:12px_12px_0_0_var(--ink-strong)]"
        >
          <div className="border-b-2 border-[var(--ink-strong)] bg-white px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              {hasDegradedDelivery ? "Submission captured" : "Submission received"}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
              {result.message}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{result.followUp}</p>
          </div>

          {hasDegradedDelivery ? (
            <div className="border-t-2 border-[var(--accent-red)] bg-[var(--accent-red-soft)] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-red)]">
                Backup step recommended
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-strong)]">
                The audit completed, but our internal routing did not fully confirm. A direct email keeps
                the lead from getting stuck.
              </p>
              {backupContactHref ? (
                <a
                  href={backupContactHref}
                  className="mt-3 inline-flex items-center justify-center border-2 border-[var(--ink-strong)] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-strong)] transition hover:bg-[var(--surface-muted)]"
                >
                  Email {result.backupContactEmail}
                </a>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
