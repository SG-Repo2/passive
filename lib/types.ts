export type DeliveryMode = "mock" | "resend";

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

export interface AuditReport extends AuditFindings {
  enhancement: AuditEnhancement;
}

export interface AuditPreview {
  simpleExplanation: string;
  actionableFixes: string[];
  businessImpact: string;
}

export interface AuditDelivery {
  mode: DeliveryMode;
  sent: boolean;
  message: string;
}

export interface AuditApiResponse extends AuditFindings {
  teaser: AuditPreview;
  delivery: AuditDelivery;
}

export interface AuditRequestBody {
  url: string;
  email: string;
}
