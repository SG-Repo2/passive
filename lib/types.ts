export type DeliveryMode = "mock" | "resend";
export type DeliveryFailureReason = "config_missing" | "provider_error";

export interface TrackingCheck {
  label: string;
  detected: boolean;
  details: string;
}

export interface SeoCheck {
  label: string;
  passed: boolean;
  details: string;
}

export interface AuditFindings {
  auditedUrl: string;
  finalUrl: string;
  httpStatus: number;
  contentType: string | null;
  tracking: {
    gtm: TrackingCheck;
    ga4: TrackingCheck;
    metaPixel: TrackingCheck;
  };
  seo: {
    titleTag: SeoCheck;
    metaDescription: SeoCheck;
  };
  summary: string;
}

export interface AuditEnhancement {
  simpleExplanation: string;
  actionableFixes: string[];
  businessImpact: string;
}

export interface AuditDelivery {
  mode: DeliveryMode;
  sent: boolean;
  message: string;
  failureReason?: DeliveryFailureReason;
  missingEnv?: string[];
  providerErrorCode?: string;
}

export interface AuditLeadNotification {
  submitterEmail: string;
  submittedUrl: string;
  findings: AuditFindings;
  submittedAt: string;
}

export interface AuditSubmissionResponse {
  submitted: true;
  message: string;
  followUp: string;
}

export interface AuditErrorResponse {
  error: string;
}

export interface AuditRequestBody {
  url: string;
  email: string;
}
