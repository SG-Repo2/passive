import { Resend } from "resend";

import { buildAuditReportHtml, buildAuditReportText, buildDeliveryMessage } from "@/lib/report";
import type { AuditDelivery, AuditReport } from "@/lib/types";

interface SendAuditReportEmailArgs {
  to: string;
  report: AuditReport;
}

function getContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@chiwebdev.com";
}

export async function sendAuditReportEmail({
  to,
  report,
}: SendAuditReportEmailArgs): Promise<AuditDelivery> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.AUDIT_REPORT_FROM_EMAIL;
  const contactEmail = getContactEmail();

  if (!apiKey || !fromEmail) {
    console.info("Audit email mock delivery", {
      to,
      report: buildAuditReportText(report, contactEmail),
    });

    return {
      mode: "mock",
      sent: false,
      message: buildDeliveryMessage("mock", false, to),
    };
  }

  try {
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your chiwebdev.com audit for ${new URL(report.finalUrl).hostname}`,
      html: buildAuditReportHtml(report, contactEmail),
      text: buildAuditReportText(report, contactEmail),
      replyTo: contactEmail,
    });

    return {
      mode: "resend",
      sent: true,
      message: buildDeliveryMessage("resend", true, to),
    };
  } catch (error) {
    console.error("Resend email delivery failed.", error);

    return {
      mode: "resend",
      sent: false,
      message: buildDeliveryMessage("resend", false, to),
    };
  }
}
