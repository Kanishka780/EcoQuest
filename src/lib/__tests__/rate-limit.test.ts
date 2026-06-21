import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";
 
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
});
