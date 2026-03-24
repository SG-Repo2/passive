import { NextResponse } from "next/server";

import { auditWebsite } from "@/lib/audit";
import { sendAuditReportEmail } from "@/lib/email";
import { generateAuditEnhancement } from "@/lib/llm";
import { buildAuditPreview } from "@/lib/report";
import type { AuditApiResponse, AuditRequestBody, AuditReport } from "@/lib/types";
import { UserFacingError, validateEmailAddress } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    let body: Partial<AuditRequestBody>;

    try {
      body = (await request.json()) as Partial<AuditRequestBody>;
    } catch {
      throw new UserFacingError("Please submit a valid JSON request body.");
    }

    const email = validateEmailAddress(body.email ?? "");
    const findings = await auditWebsite(body.url ?? "");
    const enhancement = await generateAuditEnhancement(findings);

    const fullReport: AuditReport = {
      ...findings,
      enhancement,
    };

    const delivery = await sendAuditReportEmail({
      to: email,
      report: fullReport,
    });

    const responseBody: AuditApiResponse = {
      ...findings,
      teaser: buildAuditPreview(fullReport),
      delivery,
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Audit request failed.", error);

    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "The website took too long to respond. Please try another URL." },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        error: "We couldn't complete the audit right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
