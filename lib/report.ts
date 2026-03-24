import type {
  AuditLeadNotification,
  DeliveryMode,
  SeoCheck,
  TrackingCheck,
} from "@/lib/types";

function renderSeoStatus(value: boolean): string {
  return value ? "Pass" : "Needs attention";
}

function renderTrackingStatus(value: boolean): string {
  return value ? "Detected" : "Not detected";
}

function renderTrackingRow(label: string, check: TrackingCheck): string {
  return `- ${label}: ${renderTrackingStatus(check.detected)}`;
}

function renderTrackingDetail(label: string, check: TrackingCheck): string {
  return `- ${label}: ${check.details}`;
}

function renderSeoRow(label: string, check: SeoCheck): string {
  return `- ${label}: ${renderSeoStatus(check.passed)}`;
}

function renderSeoDetail(label: string, check: SeoCheck): string {
  return `- ${label}: ${check.details}`;
}

function renderContentType(contentType: string | null): string {
  return contentType ?? "Unknown";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildAuditLeadNotificationText(notification: AuditLeadNotification): string {
  const { findings, submitterEmail, submittedAt, submittedUrl } = notification;

  return [
    "New audit submission",
    "",
    "Lead email:",
    submitterEmail,
    "",
    "Submitted URL:",
    submittedUrl,
    "",
    "Normalized URL:",
    findings.auditedUrl,
    "",
    "Final URL:",
    findings.finalUrl,
    "",
    "HTTP status:",
    String(findings.httpStatus),
    "",
    "Content type:",
    renderContentType(findings.contentType),
    "",
    "Summary:",
    findings.summary,
    "",
    "Tracking checks",
    renderTrackingRow("Google Tag Manager", findings.tracking.gtm),
    renderTrackingRow("GA4", findings.tracking.ga4),
    renderTrackingRow("Meta Pixel", findings.tracking.metaPixel),
    "",
    "Tracking details",
    renderTrackingDetail("GTM", findings.tracking.gtm),
    renderTrackingDetail("GA4", findings.tracking.ga4),
    renderTrackingDetail("Meta Pixel", findings.tracking.metaPixel),
    "",
    "SEO checks",
    renderSeoRow("Title tag", findings.seo.titleTag),
    renderSeoRow("Meta description", findings.seo.metaDescription),
    "",
    "SEO details",
    renderSeoDetail("Title tag", findings.seo.titleTag),
    renderSeoDetail("Meta description", findings.seo.metaDescription),
    "",
    "Submitted at:",
    submittedAt,
    "",
    "Follow-up note:",
    "Reach out manually to this lead if the submission looks valid.",
  ].join("\n");
}

export function buildAuditLeadNotificationHtml(notification: AuditLeadNotification): string {
  const { findings, submitterEmail, submittedAt, submittedUrl } = notification;

  return `
    <div style="margin:0;padding:24px;background:#f5f1ea;font-family:Arial,sans-serif;color:#10263b;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #10263b;">
        <div style="padding:24px 28px;border-bottom:1px solid #10263b;background:#fdf8f2;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8f342e;">
            chiwebdev audit lead
          </p>
          <h1 style="margin:0;font-size:28px;line-height:1.15;">New audit submission</h1>
        </div>

        <div style="padding:28px;">
          <p style="margin:0 0 12px;"><strong>Lead email:</strong> ${escapeHtml(submitterEmail)}</p>
          <p style="margin:0 0 12px;"><strong>Submitted URL:</strong> ${escapeHtml(submittedUrl)}</p>
          <p style="margin:0 0 12px;"><strong>Normalized URL:</strong> ${escapeHtml(findings.auditedUrl)}</p>
          <p style="margin:0 0 12px;"><strong>Final URL:</strong> ${escapeHtml(findings.finalUrl)}</p>
          <p style="margin:0 0 12px;"><strong>HTTP status:</strong> ${findings.httpStatus}</p>
          <p style="margin:0 0 12px;"><strong>Content type:</strong> ${escapeHtml(renderContentType(findings.contentType))}</p>
          <p style="margin:0 0 24px;"><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>

          <h2 style="margin:0 0 10px;font-size:18px;">Summary</h2>
          <p style="margin:0 0 24px;line-height:1.7;color:#425466;">${escapeHtml(findings.summary)}</p>

          <h2 style="margin:0 0 10px;font-size:18px;">Tracking checks</h2>
          <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8;color:#425466;">
            <li>Google Tag Manager: ${renderTrackingStatus(findings.tracking.gtm.detected)}</li>
            <li>GA4: ${renderTrackingStatus(findings.tracking.ga4.detected)}</li>
            <li>Meta Pixel: ${renderTrackingStatus(findings.tracking.metaPixel.detected)}</li>
          </ul>

          <h2 style="margin:0 0 10px;font-size:18px;">Tracking details</h2>
          <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8;color:#425466;">
            <li>GTM: ${escapeHtml(findings.tracking.gtm.details)}</li>
            <li>GA4: ${escapeHtml(findings.tracking.ga4.details)}</li>
            <li>Meta Pixel: ${escapeHtml(findings.tracking.metaPixel.details)}</li>
          </ul>

          <h2 style="margin:0 0 10px;font-size:18px;">SEO checks</h2>
          <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8;color:#425466;">
            <li>Title tag: ${renderSeoStatus(findings.seo.titleTag.passed)}</li>
            <li>Meta description: ${renderSeoStatus(findings.seo.metaDescription.passed)}</li>
          </ul>

          <h2 style="margin:0 0 10px;font-size:18px;">SEO details</h2>
          <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8;color:#425466;">
            <li>Title tag: ${escapeHtml(findings.seo.titleTag.details)}</li>
            <li>Meta description: ${escapeHtml(findings.seo.metaDescription.details)}</li>
          </ul>

          <p style="margin:0;line-height:1.7;color:#425466;">
            <strong>Follow-up note:</strong> Reach out manually to this lead if the submission looks valid.
          </p>
        </div>
      </div>
    </div>
  `;
}

export function buildDeliveryMessage(mode: DeliveryMode, sent: boolean, email: string): string {
  if (mode === "resend" && sent) {
    return `Lead notification sent to ${email}.`;
  }

  if (mode === "resend" && !sent) {
    return "We completed the audit, but the internal lead notification email failed to send.";
  }

  return "Lead notification email is running in mock mode. Configure LEAD_NOTIFICATION_EMAIL, RESEND_API_KEY, and AUDIT_REPORT_FROM_EMAIL to send real emails.";
}
