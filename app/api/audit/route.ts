import { NextResponse } from "next/server";

import { auditWebsite } from "@/lib/audit";
import { sendAuditLeadNotificationEmail } from "@/lib/email";
import type { AuditRequestBody, AuditSubmissionResponse } from "@/lib/types";
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

    const submitterEmail = validateEmailAddress(typeof body.email === "string" ? body.email : "");
    const submittedUrl = typeof body.url === "string" ? body.url.trim() : "";
    const findings = await auditWebsite(submittedUrl);
    const delivery = await sendAuditLeadNotificationEmail({
      submitterEmail,
      submittedUrl,
      findings,
      submittedAt: new Date().toISOString(),
    });

    if (delivery.mode === "resend" && !delivery.sent) {
      throw new UserFacingError(
        "We reviewed the site, but couldn't send the submission for follow-up right now. Please try again in a moment.",
        500,
      );
    }

    const responseBody: AuditSubmissionResponse = {
      submitted: true,
      message: "Thanks. Your website has been submitted for review.",
      followUp: "We'll take a look and follow up by email if the site appears reachable.",
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
