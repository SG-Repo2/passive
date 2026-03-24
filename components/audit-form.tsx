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
        className="rounded-[2rem] border border-slate-200/80 bg-[var(--surface-strong)] p-6 shadow-[0_28px_65px_-40px_rgba(15,23,42,0.4)] backdrop-blur xl:p-8"
      >
        <div className="grid gap-5">
          <div>
            <label htmlFor="website-url" className="text-sm font-semibold text-slate-900">
              Website URL
            </label>
            <input
              id="website-url"
              name="website-url"
              type="text"
              placeholder="example.com"
              autoComplete="url"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-[var(--accent)]"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-slate-900">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-[var(--accent)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Running audit..." : "Get My Free Audit"}
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          We email the full report first, then unlock a short on-page preview. No account. No database.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}
      </form>

      {result ? <ResultsPanel result={result} /> : null}
    </div>
  );
}
