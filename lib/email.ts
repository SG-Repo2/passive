import { Resend } from "resend";

import { logAuditEvent } from "@/lib/logging";
import {
  buildAuditLeadNotificationHtml,
  buildAuditLeadNotificationText,
  buildDeliveryMessage,
} from "@/lib/report";
import type { AuditDelivery, AuditLeadNotification } from "@/lib/types";

export interface AuditEmailOptions {
  requestId?: string;
}

function getLeadNotificationEmail(): string {
  return process.env.LEAD_NOTIFICATION_EMAIL?.trim() ?? "";
}

function getMissingEmailConfiguration(
  apiKey: string | undefined,
  fromEmail: string | undefined,
  ownerEmail: string,
): string[] {
  const missing: string[] = [];

  if (!apiKey) {
    missing.push("RESEND_API_KEY");
  }

  if (!fromEmail) {
    missing.push("AUDIT_REPORT_FROM_EMAIL");
  }

  if (!ownerEmail) {
    missing.push("LEAD_NOTIFICATION_EMAIL");
  }

  return missing;
}

function captureLeadRecoveryLog(
  notification: AuditLeadNotification,
  options: AuditEmailOptions,
  details: Record<string, unknown>,
) {
  // Preserve enough information to recover the lead if the downstream mailer is unavailable.
  console.error("[audit][lead_recovery_capture]", {
    requestId: options.requestId,
    submittedAt: notification.submittedAt,
    submittedUrl: notification.submittedUrl,
    submitterEmail: notification.submitterEmail,
    finalUrl: notification.findings.finalUrl,
    httpStatus: notification.findings.httpStatus,
    summary: notification.findings.summary,
    ...details,
  });
}

export async function sendAuditLeadNotificationEmail(
  notification: AuditLeadNotification,
  options: AuditEmailOptions = {},
): Promise<AuditDelivery> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.AUDIT_REPORT_FROM_EMAIL;
  const ownerEmail = getLeadNotificationEmail();
  const hostname = new URL(notification.findings.finalUrl).hostname;
  const text = buildAuditLeadNotificationText(notification);
  const missingEnv = getMissingEmailConfiguration(apiKey, fromEmail, ownerEmail);

  if (missingEnv.length > 0) {
    logAuditEvent("warn", "audit_email_config_missing", {
      requestId: options.requestId,
      hostname,
      submittedUrl: notification.submittedUrl,
      submitterEmail: notification.submitterEmail,
      missingEnv,
    });

    if (process.env.NODE_ENV !== "production") {
      return {
        mode: "mock",
        sent: true,
        failureReason: "config_missing",
        missingEnv,
        message: buildDeliveryMessage("mock", true, ownerEmail || "local-dev"),
      };
    }

    captureLeadRecoveryLog(notification, options, {
      failureReason: "config_missing",
      missingEnv,
    });

    return {
      mode: "mock",
      sent: false,
      failureReason: "config_missing",
      missingEnv,
      message: buildDeliveryMessage("mock", false, ownerEmail || "missing-owner-email"),
    };
  }

  try {
    const configuredFromEmail = fromEmail!;
    const configuredOwnerEmail = ownerEmail;
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: configuredFromEmail,
      to: configuredOwnerEmail,
      subject: `New chiwebdev audit lead: ${hostname}`,
      html: buildAuditLeadNotificationHtml(notification),
      text,
      replyTo: notification.submitterEmail,
    });

    if (result.error) {
      logAuditEvent("error", "audit_email_provider_failed", {
        requestId: options.requestId,
        hostname,
        submittedUrl: notification.submittedUrl,
        submitterEmail: notification.submitterEmail,
        providerErrorCode: result.error.name,
      });

      captureLeadRecoveryLog(notification, options, {
        failureReason: "provider_error",
        providerErrorCode: result.error.name,
      });

      return {
        mode: "resend",
        sent: false,
        failureReason: "provider_error",
        providerErrorCode: result.error.name,
        message: buildDeliveryMessage("resend", false, ownerEmail),
      };
    }

    logAuditEvent("info", "audit_email_sent", {
      requestId: options.requestId,
      hostname,
      submittedUrl: notification.submittedUrl,
      submitterEmail: notification.submitterEmail,
      providerMessageId: result.data?.id,
    });

    return {
      mode: "resend",
      sent: true,
      message: buildDeliveryMessage("resend", true, ownerEmail),
    };
  } catch (error) {
    logAuditEvent("error", "audit_email_provider_failed", {
      requestId: options.requestId,
      hostname,
      submittedUrl: notification.submittedUrl,
      submitterEmail: notification.submitterEmail,
      error,
    });

    captureLeadRecoveryLog(notification, options, {
      failureReason: "provider_error",
      providerErrorCode:
        error instanceof Error && error.name ? error.name : "unknown_provider_error",
    });

    return {
      mode: "resend",
      sent: false,
      failureReason: "provider_error",
      message: buildDeliveryMessage("resend", false, ownerEmail),
    };
  }
}
