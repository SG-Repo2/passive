const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/;
const MAX_EMAIL_LENGTH = 320;
const MAX_URL_LENGTH = 2_048;

export class UserFacingError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = "bad_request") {
    super(message);
    this.name = "UserFacingError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function normalizeWebsiteUrl(input: string): string {
  const value = input.trim();

  if (!value) {
    throw new UserFacingError("Please enter a website URL.");
  }

  if (value.length > MAX_URL_LENGTH) {
    throw new UserFacingError("Please enter a shorter website URL.", 400, "url_too_long");
  }

  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    throw new UserFacingError("Please enter a valid website URL.", 400, "invalid_url");
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

export function validateEmailAddress(input: string): string {
  const value = input.trim().toLowerCase();

  if (!value) {
    throw new UserFacingError("Please enter an email address.");
  }

  if (value.length > MAX_EMAIL_LENGTH) {
    throw new UserFacingError("Please enter a shorter email address.", 400, "email_too_long");
  }

  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    throw new UserFacingError("Please enter a valid email address.", 400, "invalid_email");
  }

  if (!SIMPLE_EMAIL_PATTERN.test(value)) {
    throw new UserFacingError("Please enter a valid email address.");
  }

  return value;
}

export function validateSubmittedUrl(input: string): string {
  const value = input.trim();

  if (!value) {
    throw new UserFacingError("Please enter a website URL.", 400, "missing_url");
  }

  if (value.length > MAX_URL_LENGTH) {
    throw new UserFacingError("Please enter a shorter website URL.", 400, "url_too_long");
  }

  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    throw new UserFacingError("Please enter a valid website URL.", 400, "invalid_url");
  }

  return value;
}

export function maskEmailAddress(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - visible.length, 2))}@${domain}`;
}
