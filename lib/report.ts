import type {
  AuditPreview,
  AuditReport,
  DeliveryMode,
  SeoCheck,
  TrackingCheck,
} from "@/lib/types";

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(maxLength - 1, 0)).trimEnd()}…`;
}

function renderBooleanLabel(value: boolean): string {
  return value ? "Pass" : "Needs attention";
}

function renderTrackingRow(label: string, check: TrackingCheck): string {
  return `- ${label}: ${check.detected ? "Detected" : "Not detected"} (${check.details})`;
}

function renderSeoRow(label: string, check: SeoCheck): string {
  return `- ${label}: ${renderBooleanLabel(check.passed)} (${check.details})`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildAuditPreview(report: AuditReport): AuditPreview {
  return {
    simpleExplanation: truncate(report.enhancement.simpleExplanation, 240),
    actionableFixes: report.enhancement.actionableFixes.slice(0, 2),
    businessImpact: truncate(report.enhancement.businessImpact, 220),
  };
}

export function buildAuditReportText(report: AuditReport, contactEmail: string): string {
  const fixes = report.enhancement.actionableFixes.map((item, index) => `${index + 1}. ${item}`).join("\n");

  return [
    `Website audit for ${report.finalUrl}`,
    "",
    "Quick summary",
    report.summary,
    "",
    "Plain-English explanation",
    report.enhancement.simpleExplanation,
    "",
    "Recommended fixes",
    fixes,
    "",
    "Business impact",
    report.enhancement.businessImpact,
    "",
    "Tracking checks",
    renderTrackingRow("Google Tag Manager", report.tracking.gtm),
    renderTrackingRow("GA4", report.tracking.ga4),
    renderTrackingRow("Meta Pixel", report.tracking.metaPixel),
    "",
    "SEO checks",
    renderSeoRow("Title tag", report.seo.titleTag),
    renderSeoRow("Meta description", report.seo.metaDescription),
    "",
    `Want this fixed for you? Reply to this email or contact ${contactEmail}.`,
  ].join("\n");
}

export function buildAuditReportHtml(report: AuditReport, contactEmail: string): string {
  const actionItems = report.enhancement.actionableFixes
    .map((item) => `<li style="margin-bottom:10px;">${escapeHtml(item)}</li>`)
    .join("");

  const trackingRows = [
    report.tracking.gtm,
    report.tracking.ga4,
    report.tracking.metaPixel,
  ]
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${escapeHtml(item.label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.detected ? "Detected" : "Not detected"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.details)}</td>
        </tr>`,
    )
    .join("");

  const seoRows = [report.seo.titleTag, report.seo.metaDescription]
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${escapeHtml(item.label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.passed ? "Pass" : "Needs attention"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.details)}</td>
        </tr>`,
    )
    .join("");

  const mailtoHref = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent("Website audit follow-up")}`;

  return `
    <div style="margin:0;padding:32px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:20px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#0f5f8f 0%,#153046 100%);color:#ffffff;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">chiwebdev.com</p>
          <h1 style="margin:0;font-size:28px;line-height:1.15;">Your Website Audit Is Ready</h1>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.82);">
            Website reviewed: ${escapeHtml(report.finalUrl)}
          </p>
        </div>

        <div style="padding:32px;">
          <h2 style="margin:0 0 10px;font-size:20px;">Quick summary</h2>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(report.summary)}</p>

          <h2 style="margin:0 0 10px;font-size:20px;">Plain-English explanation</h2>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(report.enhancement.simpleExplanation)}</p>

          <h2 style="margin:0 0 10px;font-size:20px;">Recommended fixes</h2>
          <ol style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.7;color:#334155;">
            ${actionItems}
          </ol>

          <h2 style="margin:0 0 10px;font-size:20px;">Business impact</h2>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(report.enhancement.businessImpact)}</p>

          <h2 style="margin:0 0 10px;font-size:20px;">Tracking checks</h2>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px;color:#334155;">
            <tbody>${trackingRows}</tbody>
          </table>

          <h2 style="margin:0 0 10px;font-size:20px;">SEO checks</h2>
          <table style="width:100%;border-collapse:collapse;margin:0 0 32px;font-size:14px;color:#334155;">
            <tbody>${seoRows}</tbody>
          </table>

          <a
            href="${mailtoHref}"
            style="display:inline-block;padding:14px 22px;border-radius:999px;background:#d6a545;color:#132033;font-size:14px;font-weight:700;text-decoration:none;"
          >
            Want this fixed for you?
          </a>
        </div>
      </div>
    </div>
  `;
}

export function buildDeliveryMessage(mode: DeliveryMode, sent: boolean, email: string): string {
  if (mode === "resend" && sent) {
    return `Full report sent to ${email}.`;
  }

  if (mode === "resend" && !sent) {
    return "We generated the report, but email delivery failed. Check your Resend sender settings and try again.";
  }

  return "Email delivery is running in mock mode. Configure Resend to send the full report.";
}
