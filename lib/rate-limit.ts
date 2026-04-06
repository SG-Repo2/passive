const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

const submissionBuckets = new Map<string, RateLimitEntry>();

function cleanupExpiredBuckets(now: number) {
  for (const [key, entry] of submissionBuckets.entries()) {
    if (entry.resetAt <= now) {
      submissionBuckets.delete(key);
    }
  }
}

export function checkAuditSubmissionRateLimit(key: string, now = Date.now()): RateLimitResult {
  cleanupExpiredBuckets(now);

  const bucketKey = key || "anonymous";
  const current = submissionBuckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    submissionBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
    };
  }

  current.count += 1;
  submissionBuckets.set(bucketKey, current);

  if (current.count > MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - current.count),
  };
}
