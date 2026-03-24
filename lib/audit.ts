import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import type { AuditFindings, SeoCheck, TrackingCheck } from "@/lib/types";
import { UserFacingError, normalizeWebsiteUrl } from "@/lib/validators";

const MAX_HTML_BYTES = 512_000;
const REQUEST_TIMEOUT_MS = 12_000;

function isPrivateHostname(hostname: string): boolean {
  const value = hostname.toLowerCase();

  return (
    value === "localhost" ||
    value.endsWith(".localhost") ||
    value.endsWith(".local") ||
    value.endsWith(".internal")
  );
}

function isReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => Number.parseInt(part, 10));

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isReservedIpv6(ip: string): boolean {
  const value = ip.toLowerCase();
  const mappedIpv4 = value.startsWith("::ffff:") ? value.replace("::ffff:", "") : null;

  if (mappedIpv4 && isIP(mappedIpv4) === 4) {
    return isReservedIpv4(mappedIpv4);
  }

  return (
    value === "::1" ||
    value === "::" ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe80:")
  );
}

function isReservedIp(ip: string): boolean {
  const version = isIP(ip);

  if (version === 4) {
    return isReservedIpv4(ip);
  }

  if (version === 6) {
    return isReservedIpv6(ip);
  }

  return true;
}

async function assertPublicUrl(rawInput: string): Promise<URL> {
  const normalized = normalizeWebsiteUrl(rawInput);
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new UserFacingError("Please enter a valid website URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new UserFacingError("Only http:// and https:// URLs are supported.");
  }

  if (!parsedUrl.hostname) {
    throw new UserFacingError("Please enter a valid website URL.");
  }

  if (isPrivateHostname(parsedUrl.hostname)) {
    throw new UserFacingError("Please use a public website URL.");
  }

  if (isIP(parsedUrl.hostname) && isReservedIp(parsedUrl.hostname)) {
    throw new UserFacingError("Please use a public website URL.");
  }

  try {
    const results = await lookup(parsedUrl.hostname, { all: true, verbatim: true });

    if (results.some((result) => isReservedIp(result.address))) {
      throw new UserFacingError("Please use a public website URL.");
    }
  } catch (error) {
    if (error instanceof UserFacingError) {
      throw error;
    }

    throw new UserFacingError("We couldn't verify that the website is publicly reachable.");
  }

  return parsedUrl;
}

async function readHtmlWithLimit(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) {
    return (await response.text()).slice(0, maxBytes);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      throw new UserFacingError("The page is too large to audit with this MVP.");
    }

    html += decoder.decode(value, { stream: true });
  }

  html += decoder.decode();
  return html;
}

function buildTrackingCheck(label: string, detected: boolean, details: string): TrackingCheck {
  return {
    label,
    detected,
    details,
  };
}

function buildSeoCheck(label: string, passed: boolean, details: string): SeoCheck {
  return {
    label,
    passed,
    details,
  };
}

function extractMatch(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[0]) {
      return match[0];
    }
  }

  return null;
}

function summarizeFindings(findings: Omit<AuditFindings, "summary">): string {
  const trackingDetections = Object.values(findings.tracking).filter((item) => item.detected).length;
  const seoPasses = Object.values(findings.seo).filter((item) => item.passed).length;

  const trackingSummary =
    trackingDetections === 0
      ? "We did not detect GTM, GA4, or Meta Pixel in the page HTML."
      : `We detected ${trackingDetections} of 3 tracking essentials in the page HTML.`;

  const seoSummary =
    seoPasses === 2
      ? "Both core SEO basics we checked are present."
      : seoPasses === 1
        ? "One of the two basic SEO checks is missing."
        : "Both SEO basics we checked are missing.";

  const statusSummary =
    findings.httpStatus >= 400
      ? `The site responded with HTTP ${findings.httpStatus}, so some findings may reflect a blocked or fallback page.`
      : "The page responded normally and was audited from public HTML.";

  return `${trackingSummary} ${seoSummary} ${statusSummary}`;
}

export async function auditWebsite(rawInput: string): Promise<AuditFindings> {
  const parsedUrl = await assertPublicUrl(rawInput);

  const response = await fetch(parsedUrl.toString(), {
    headers: {
      "user-agent": "chiwebdev-audit-bot/1.0 (+https://chiwebdev.com)",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");

  if (
    contentType &&
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml+xml")
  ) {
    throw new UserFacingError("That URL did not return an HTML page we can audit.");
  }

  const html = await readHtmlWithLimit(response, MAX_HTML_BYTES);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescriptionMatch = html.match(
    /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']+["'])[^>]*>/i,
  );

  const gtmMatch = extractMatch(html, [/googletagmanager\.com\/gtm\.js/i, /GTM-[A-Z0-9]+/i]);
  const ga4Match = extractMatch(html, [
    /googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9-]+/i,
    /gtag\s*\(\s*["']config["']\s*,\s*["']G-[A-Z0-9-]+["']/i,
    /["']G-[A-Z0-9-]{4,}["']/i,
  ]);
  const metaPixelMatch = extractMatch(html, [
    /connect\.facebook\.net\/.*\/fbevents\.js/i,
    /fbq\s*\(\s*["']init["']/i,
    /fbq\s*\(\s*["']track["']/i,
  ]);

  const findingsWithoutSummary: Omit<AuditFindings, "summary"> = {
    auditedUrl: parsedUrl.toString(),
    finalUrl: response.url,
    httpStatus: response.status,
    contentType,
    tracking: {
      gtm: buildTrackingCheck(
        "Google Tag Manager",
        Boolean(gtmMatch),
        gtmMatch ? `Found ${gtmMatch}.` : "No GTM script or container ID was detected in the HTML.",
      ),
      ga4: buildTrackingCheck(
        "GA4",
        Boolean(ga4Match),
        ga4Match ? `Found ${ga4Match}.` : "No GA4 script or G- measurement ID was detected in the HTML.",
      ),
      metaPixel: buildTrackingCheck(
        "Meta Pixel",
        Boolean(metaPixelMatch),
        metaPixelMatch
          ? `Found ${metaPixelMatch}.`
          : "No Meta Pixel script or fbq() call was detected in the HTML.",
      ),
    },
    seo: {
      titleTag: buildSeoCheck(
        "Title tag",
        Boolean(titleMatch?.[1]?.trim()),
        titleMatch?.[1]?.trim()
          ? `Title detected: ${titleMatch[1].trim().slice(0, 80)}`
          : "No <title> tag was found.",
      ),
      metaDescription: buildSeoCheck(
        "Meta description",
        Boolean(metaDescriptionMatch),
        metaDescriptionMatch
          ? "A meta description tag is present."
          : "No meta description tag was found.",
      ),
    },
  };

  return {
    ...findingsWithoutSummary,
    summary: summarizeFindings(findingsWithoutSummary),
  };
}
