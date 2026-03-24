import { Resend } from "resend";

import {
  buildAuditLeadNotificationHtml,
  buildAuditLeadNotificationText,
  buildDeliveryMessage,
} from "@/lib/report";
import type { AuditDelivery, AuditLeadNotification } from "@/lib/types";

function getLeadNotificationEmail(): string {
  return process.env.LEAD_NOTIFICATION_EMAIL?.trim() ?? "";
}

export async function sendAuditLeadNotificationEmail(
  notification: AuditLeadNotification,
): Promise<AuditDelivery> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.AUDIT_REPORT_FROM_EMAIL;
  const ownerEmail = getLeadNotificationEmail();
  const hostname = new URL(notification.findings.finalUrl).hostname;
  const text = buildAuditLeadNotificationText(notification);

  if (!apiKey || !fromEmail || !ownerEmail) {
    console.info("Audit lead notification mock delivery", {
      to: ownerEmail || "missing-owner-email",
      notification: text,
    });

    return {
      mode: "mock",
      sent: false,
      message: buildDeliveryMessage("mock", false, ownerEmail || "missing-owner-email"),
    };
  }

  try {
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject: `New chiwebdev audit lead: ${hostname}`,
      html: buildAuditLeadNotificationHtml(notification),
      text,
      replyTo: notification.submitterEmail,
    });

    return {
      mode: "resend",
      sent: true,
      message: buildDeliveryMessage("resend", true, ownerEmail),
    };
  } catch (error) {
    console.error("Resend lead notification delivery failed.", error);

    return {
      mode: "resend",
      sent: false,
      message: buildDeliveryMessage("resend", false, ownerEmail),
    };
  }
}
