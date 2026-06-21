import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit, purgeExpiredEntries } from "@/lib/rate-limit";
 
describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
 
  it("allows requests under the limit", () => {
    const result = rateLimit("ip-1", { maxRequests: 5, windowMs: 60_000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });
 
  it("blocks requests over the limit", () => {
    const id = `ip-block-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(id, { maxRequests: 3, windowMs: 60_000 });
    }
    const blocked = rateLimit(id, { maxRequests: 3, windowMs: 60_000 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
 
  it("resets after the window expires", () => {
    const id = `ip-reset-${Date.now()}`;
    const opts = { maxRequests: 2, windowMs: 1_000 };
 
    rateLimit(id, opts);
    rateLimit(id, opts);
    const blocked = rateLimit(id, opts);
    expect(blocked.success).toBe(false);
 
    // Advance past the window
    vi.advanceTimersByTime(1_001);
 
    const allowed = rateLimit(id, opts);
    expect(allowed.success).toBe(true);
  });
 
  it("tracks different IPs independently", () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };
    const r1 = rateLimit(`ip-a-${Date.now()}`, opts);
    const r2 = rateLimit(`ip-b-${Date.now()}`, opts);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
 
  it("returns resetAt as a future timestamp", () => {
    const now = Date.now();
    const result = rateLimit(`ip-ts-${now}`, { windowMs: 5_000 });
    expect(result.resetAt).toBeGreaterThan(now);
  });

  describe("purgeExpiredEntries", () => {
    it("removes entries whose window has expired", () => {
      const id = `ip-purge-expired-${Date.now()}`;
      rateLimit(id, { windowMs: 1_000 });

      vi.advanceTimersByTime(1_001);
      purgeExpiredEntries();

      // After purge, this identifier should be treated as a brand new window
      const result = rateLimit(id, { windowMs: 1_000, maxRequests: 5 });
      expect(result.remaining).toBe(4);
    });

    it("keeps entries whose window has not expired", () => {
      const id = `ip-purge-active-${Date.now()}`;
      rateLimit(id, { windowMs: 60_000, maxRequests: 5 });

      purgeExpiredEntries();

      // Still within the same window, so count should continue from where it left off
      const result = rateLimit(id, { windowMs: 60_000, maxRequests: 5 });
      expect(result.remaining).toBe(3);
    });
  });
});
