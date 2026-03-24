const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserFacingError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "UserFacingError";
    this.statusCode = statusCode;
  }
}

export function normalizeWebsiteUrl(input: string): string {
  const value = input.trim();

  if (!value) {
    throw new UserFacingError("Please enter a website URL.");
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

  if (!SIMPLE_EMAIL_PATTERN.test(value)) {
    throw new UserFacingError("Please enter a valid email address.");
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
