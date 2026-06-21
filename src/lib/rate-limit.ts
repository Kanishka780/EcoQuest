/**
 * Simple in-memory rate limiter for API routes.
 * Limits each IP to `maxRequests` per `windowMs` milliseconds.
 */
 
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
 
const store = new Map<string, RateLimitEntry>();
 
interface RateLimitOptions {
  /** Window duration in milliseconds (default: 60_000) */
  windowMs?: number;
  /** Max requests allowed per window (default: 20) */
  maxRequests?: number;
}
 
interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}
 
/**
 * Check whether the given identifier (e.g. IP address) is within rate limits.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { windowMs = 60_000, maxRequests = 20 } = options;
  const now = Date.now();
 
  const entry = store.get(identifier);
 
  if (!entry || entry.resetAt < now) {
    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(identifier, newEntry);
    return { success: true, remaining: maxRequests - 1, resetAt: newEntry.resetAt };
  }
 
  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }
 
  entry.count += 1;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}
 
/**
 * Purge expired entries (call periodically or in a cron to prevent memory leaks).
 */
export function purgeExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}
