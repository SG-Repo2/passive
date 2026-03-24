import OpenAI from "openai";

import type { AuditEnhancement, AuditFindings } from "@/lib/types";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const AUDIT_ENHANCEMENT_SCHEMA = {
  type: "object",
  properties: {
    simpleExplanation: {
      type: "string",
    },
    actionableFixes: {
      type: "array",
      items: {
        type: "string",
      },
    },
    businessImpact: {
      type: "string",
    },
  },
  required: ["simpleExplanation", "actionableFixes", "businessImpact"],
  additionalProperties: false,
} as const;

function buildFallbackActions(findings: AuditFindings): string[] {
  const actions: string[] = [];

  if (!findings.tracking.gtm.detected) {
    actions.push("Install Google Tag Manager so future marketing, analytics, and conversion tags can be managed without code changes.");
  }

  if (!findings.tracking.ga4.detected) {
    actions.push("Add GA4 and confirm page views plus lead-form submissions are tracked as conversions.");
  }

  if (!findings.tracking.metaPixel.detected) {
    actions.push("Install Meta Pixel if you plan to run Facebook or Instagram ads and want reliable remarketing data.");
  }

  if (!findings.seo.titleTag.passed) {
    actions.push("Add a clear title tag that mentions the business, service, and Chicago market to improve search relevance.");
  }

  if (!findings.seo.metaDescription.passed) {
    actions.push("Write a meta description with a clear offer and call to action so more searchers click through.");
  }

  if (actions.length < 3) {
    actions.push("Set up monthly checks so broken tags or missing metadata are caught before they affect leads.");
  }

  return actions.slice(0, 5);
}

function buildFallbackEnhancement(findings: AuditFindings): AuditEnhancement {
  const missingTracking = Object.values(findings.tracking).filter((item) => !item.detected).length;
  const missingSeo = Object.values(findings.seo).filter((item) => !item.passed).length;

  const simpleExplanation =
    missingTracking === 0 && missingSeo === 0
      ? "The site already covers the core tracking and SEO basics from this quick HTML audit, which is a strong starting point."
      : `This audit found ${missingTracking} tracking gap${missingTracking === 1 ? "" : "s"} and ${missingSeo} SEO gap${missingSeo === 1 ? "" : "s"} in the public page HTML.`;

  const businessImpact =
    missingTracking > 0
      ? "Missing analytics or ad pixels make it harder to prove which channels are generating leads, which usually leads to slower decisions and wasted spend."
      : "With tracking in place, the bigger opportunity is tightening the site's messaging and metadata so more qualified visitors convert.";

  return {
    simpleExplanation,
    actionableFixes: buildFallbackActions(findings),
    businessImpact,
  };
}

export async function generateAuditEnhancement(findings: AuditFindings): Promise<AuditEnhancement> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackEnhancement(findings);
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content:
            "You are a practical website consultant for small and midsize businesses. Explain findings in plain English, avoid jargon, and focus on revenue, lead quality, and visibility.",
        },
        {
          role: "user",
          content: `Turn these raw website audit findings into a concise client-ready report:\n${JSON.stringify(findings, null, 2)}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "website_audit_report",
          strict: true,
          schema: AUDIT_ENHANCEMENT_SCHEMA,
        },
      },
      max_output_tokens: 700,
    });

    const parsed = JSON.parse(response.output_text) as AuditEnhancement;

    if (
      !parsed.simpleExplanation ||
      !Array.isArray(parsed.actionableFixes) ||
      parsed.actionableFixes.length === 0 ||
      !parsed.businessImpact
    ) {
      throw new Error("LLM response did not match the expected shape.");
    }

    return {
      simpleExplanation: parsed.simpleExplanation.trim(),
      actionableFixes: parsed.actionableFixes.map((item) => item.trim()).filter(Boolean).slice(0, 5),
      businessImpact: parsed.businessImpact.trim(),
    };
  } catch (error) {
    console.error("OpenAI enhancement failed, falling back to rules-based copy.", error);
    return buildFallbackEnhancement(findings);
  }
}
