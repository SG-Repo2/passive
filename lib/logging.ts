import { maskEmailAddress } from "@/lib/validators";

const SECRET_KEY_PATTERN = /(authorization|api[-_]?key|token|secret|password)/i;

function truncate(value: string, maxLength = 160): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

export function sanitizeUrlForLogs(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";

    return truncate(`${url.origin}${url.pathname}`, 180);
  } catch {
    return truncate(value.replace(/[?#].*$/, ""), 180);
  }
}

export function maskIpAddress(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value === "::1") {
    return "::1";
  }

  if (value.includes(".")) {
    const parts = value.split(".");

    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
    }
  }

  if (value.includes(":")) {
    const parts = value.split(":").filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}::`;
    }

    return `${truncate(value, 12)}::`;
  }

  return truncate(value, 32);
}

export function serializeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return {
      type: typeof error,
      value: String(error),
    };
  }

  const cause = "cause" in error ? (error.cause as { code?: string; message?: string; name?: string } | undefined) : undefined;
  const appCode =
    "code" in error && typeof error.code === "string" ? error.code : undefined;
  const statusCode =
    "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : undefined;

  return {
    name: error.name,
    message: truncate(error.message, 220),
    appCode,
    statusCode,
    causeCode: cause?.code,
    causeName: cause?.name,
    causeMessage: cause?.message ? truncate(cause.message, 220) : undefined,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  };
}

function sanitizeContextValue(key: string, value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (SECRET_KEY_PATTERN.test(key)) {
    return "[redacted]";
  }

  if (key.toLowerCase().includes("email") && typeof value === "string") {
    return maskEmailAddress(value);
  }

  if (key.toLowerCase().includes("url") && typeof value === "string") {
    return sanitizeUrlForLogs(value);
  }

  if (key.toLowerCase().includes("ip") && typeof value === "string") {
    return maskIpAddress(value);
  }

  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeContextValue(key, item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([nestedKey, nestedValue]) => [
        nestedKey,
        sanitizeContextValue(nestedKey, nestedValue),
      ]),
    );
  }

  if (typeof value === "string") {
    return truncate(value, 220);
  }

  return value;
}

export function logAuditEvent(
  level: "info" | "warn" | "error",
  event: string,
  context: Record<string, unknown> = {},
) {
  const sanitizedContext = Object.fromEntries(
    Object.entries(context)
      .map(([key, value]) => [key, sanitizeContextValue(key, value)])
      .filter(([, value]) => value !== undefined),
  );

  console[level]("[audit]", {
    event,
    at: new Date().toISOString(),
    ...sanitizedContext,
  });
}
