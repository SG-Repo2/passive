import { randomUUID } from "node:crypto";

import { auditWebsite, type AuditExecutionOptions } from "@/lib/audit";
import {
  sendAuditLeadNotificationEmail,
  type AuditEmailOptions,
} from "@/lib/email";
import { logAuditEvent } from "@/lib/logging";
import {
  checkAuditSubmissionRateLimit,
  type RateLimitResult,
} from "@/lib/rate-limit";
import type {
  AuditDelivery,
  AuditErrorResponse,
  AuditLeadNotification,
  AuditSubmissionResponse,
} from "@/lib/types";
import {
  UserFacingError,
  validateEmailAddress,
  validateSubmittedUrl,
} from "@/lib/validators";

const MAX_REQUEST_BYTES = 4_096;
const ALLOW_HEADER = "POST, OPTIONS";

const SUCCESS_RESPONSE: AuditSubmissionResponse = {
  submitted: true,
  message: "Thanks. Your website has been submitted for review.",
  followUp: "We'll take a look and follow up by email if the site appears reachable.",
};

export interface AuditSubmissionDependencies {
  auditWebsite: (rawInput: string, options?: AuditExecutionOptions) => Promise<AuditLeadNotification["findings"]>;
  sendAuditLeadNotificationEmail: (
    notification: AuditLeadNotification,
    options?: AuditEmailOptions,
  ) => Promise<AuditDelivery>;
  createRequestId: () => string;
  now: () => Date;
  checkRateLimit: (key: string) => RateLimitResult;
}

const defaultDependencies: AuditSubmissionDependencies = {
  auditWebsite,
  sendAuditLeadNotificationEmail,
  createRequestId: () => randomUUID(),
  now: () => new Date(),
  checkRateLimit: (key) => checkAuditSubmissionRateLimit(key),
};

function jsonResponse(body: AuditSubmissionResponse | AuditErrorResponse, status = 200, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function getRateLimitKey(request: Request): string {
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get("user-agent")?.trim() ?? "unknown";

  return `${clientIp}:${userAgent.slice(0, 80)}`;
}

async function readRequestBodyAsText(request: Request, requestId: string): Promise<string> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    const error = new UserFacingError(
      "Please submit the form as JSON.",
      415,
      "invalid_content_type",
    );

    logAuditEvent("warn", "audit_request_parse_failed", {
      requestId,
      contentType,
      error,
    });

    throw error;
  }

  const contentLength = request.headers.get("content-length");

  if (contentLength) {
    const parsedLength = Number.parseInt(contentLength, 10);

    if (Number.isFinite(parsedLength) && parsedLength > MAX_REQUEST_BYTES) {
      const error = new UserFacingError(
        "The request body is too large.",
        413,
        "payload_too_large",
      );

      logAuditEvent("warn", "audit_request_parse_failed", {
        requestId,
        contentLength: parsedLength,
        error,
      });

      throw error;
    }
  }

  if (!request.body) {
    const error = new UserFacingError(
      "Please submit a valid JSON request body.",
      400,
      "missing_body",
    );

    logAuditEvent("warn", "audit_request_parse_failed", {
      requestId,
      error,
    });

    throw error;
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    totalBytes += value.byteLength;

    if (totalBytes > MAX_REQUEST_BYTES) {
      const error = new UserFacingError(
        "The request body is too large.",
        413,
        "payload_too_large",
      );

      logAuditEvent("warn", "audit_request_parse_failed", {
        requestId,
        contentLength: totalBytes,
        error,
      });

      throw error;
    }

    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();

  if (!body.trim()) {
    const error = new UserFacingError(
      "Please submit a valid JSON request body.",
      400,
      "invalid_json",
    );

    logAuditEvent("warn", "audit_request_parse_failed", {
      requestId,
      error,
    });

    throw error;
  }

  return body;
}

async function parseAuditRequestBody(request: Request, requestId: string): Promise<Record<string, unknown>> {
  const rawBody = await readRequestBodyAsText(request, requestId);

  try {
    const parsed = JSON.parse(rawBody) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new UserFacingError(
        "Please submit a valid JSON request body.",
        400,
        "invalid_json",
      );
    }

    return parsed as Record<string, unknown>;
  } catch (error) {
    const normalizedError =
      error instanceof UserFacingError
        ? error
        : new UserFacingError("Please submit a valid JSON request body.", 400, "invalid_json");

    logAuditEvent("warn", "audit_request_parse_failed", {
      requestId,
      error: normalizedError,
    });

    throw normalizedError;
  }
}

function buildDeliveryFailureMessage(delivery: AuditDelivery): string {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const fallback = "We couldn't submit the site for follow-up right now. Please try again in a few minutes.";

  if (delivery.failureReason === "config_missing") {
    return contactEmail
      ? `Website review submissions are temporarily unavailable. Please try again later or email ${contactEmail} directly.`
      : fallback;
  }

  return contactEmail
    ? `We couldn't notify the team about your request right now. Please try again in a few minutes or email ${contactEmail} directly.`
    : fallback;
}

function successResponse() {
  return jsonResponse(SUCCESS_RESPONSE);
}

export function methodNotAllowedResponse(method = "GET") {
  return jsonResponse(
    { error: `Method ${method} is not allowed.` },
    405,
    { Allow: ALLOW_HEADER },
  );
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: ALLOW_HEADER,
      "Cache-Control": "no-store",
    },
  });
}

export async function handleAuditSubmissionRequest(
  request: Request,
  dependencies: AuditSubmissionDependencies = defaultDependencies,
) {
  const requestId = dependencies.createRequestId();
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  logAuditEvent("info", "audit_request_received", {
    requestId,
    method: request.method,
    clientIp,
    userAgent,
  });

  if (request.method !== "POST") {
    logAuditEvent("warn", "audit_request_method_not_allowed", {
      requestId,
      method: request.method,
      clientIp,
    });

    return methodNotAllowedResponse(request.method);
  }

  const rateLimit = dependencies.checkRateLimit(getRateLimitKey(request));

  if (!rateLimit.allowed) {
    logAuditEvent("warn", "audit_request_rate_limited", {
      requestId,
      clientIp,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });

    return jsonResponse(
      {
        error: "Too many audit requests came from this network. Please wait a few minutes and try again.",
      },
      429,
      {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    );
  }

  try {
    const body = await parseAuditRequestBody(request, requestId);
    const honeypotValue = typeof body.company === "string" ? body.company.trim() : "";

    if (honeypotValue) {
      logAuditEvent("warn", "audit_request_honeypot_triggered", {
        requestId,
        clientIp,
      });

      return successResponse();
    }

    let submitterEmail: string;
    let submittedUrl: string;

    try {
      submitterEmail = validateEmailAddress(typeof body.email === "string" ? body.email : "");
      submittedUrl = validateSubmittedUrl(typeof body.url === "string" ? body.url : "");
    } catch (error) {
      if (error instanceof UserFacingError) {
        logAuditEvent("warn", "audit_request_validation_failed", {
          requestId,
          clientIp,
          error,
        });

        return jsonResponse({ error: error.message }, error.statusCode);
      }

      throw error;
    }

    logAuditEvent("info", "audit_request_validated", {
      requestId,
      submittedUrl,
      submitterEmail,
    });

    const findings = await dependencies.auditWebsite(submittedUrl, { requestId });
    const delivery = await dependencies.sendAuditLeadNotificationEmail(
      {
        submitterEmail,
        submittedUrl,
        findings,
        submittedAt: dependencies.now().toISOString(),
      },
      { requestId },
    );

    if (!delivery.sent) {
      logAuditEvent("error", "audit_request_delivery_failed", {
        requestId,
        submittedUrl,
        submitterEmail,
        failureReason: delivery.failureReason,
        missingEnv: delivery.missingEnv,
        providerErrorCode: delivery.providerErrorCode,
      });

      return jsonResponse(
        { error: buildDeliveryFailureMessage(delivery) },
        503,
      );
    }

    logAuditEvent("info", "audit_request_completed", {
      requestId,
      submittedUrl,
      submitterEmail,
      finalUrl: findings.finalUrl,
      httpStatus: findings.httpStatus,
    });

    return successResponse();
  } catch (error) {
    if (error instanceof UserFacingError) {
      logAuditEvent("warn", "audit_request_failed", {
        requestId,
        clientIp,
        error,
      });

      return jsonResponse({ error: error.message }, error.statusCode);
    }

    logAuditEvent("error", "audit_request_failed", {
      requestId,
      clientIp,
      error,
    });

    return jsonResponse(
      {
        error: "We couldn't complete the audit right now. Please try again in a moment.",
      },
      500,
    );
  }
}
