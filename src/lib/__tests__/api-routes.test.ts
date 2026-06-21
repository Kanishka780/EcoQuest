/**
 * @fileoverview Unit tests for /api/ai/chat and /api/carbon/calculate route logic.
 * Tests are exercised against the underlying lib functions since Next.js route
 * handlers can't be unit-tested without a full server context.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";
import { validateAiPrompt, validateCarbonInput, ValidationError, sanitizeString } from "@/lib/validation";
import { calculateCarbonFootprint, simulateCarSwitch, simulateDietChange } from "@/lib/carbon-calculator";

// ─── Rate limit + AI route logic ────────────────────────────────────────────

describe("API /api/ai/chat — rate limit + prompt validation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows first 15 requests within a window", () => {
    const ip = `chat-ip-${Date.now()}`;
    for (let i = 0; i < 15; i++) {
      const result = rateLimit(ip, { maxRequests: 15, windowMs: 60_000 });
      expect(result.success).toBe(true);
    }
  });

  it("blocks the 16th request in the same window", () => {
    const ip = `chat-block-${Date.now()}`;
    for (let i = 0; i < 15; i++) {
      rateLimit(ip, { maxRequests: 15, windowMs: 60_000 });
    }
    const result = rateLimit(ip, { maxRequests: 15, windowMs: 60_000 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("validates a well-formed prompt successfully", () => {
    const prompt = "How can I reduce my car emissions?";
    expect(() => validateAiPrompt(prompt)).not.toThrow();
    expect(validateAiPrompt(prompt)).toBe(prompt);
  });

  it("rejects empty prompt", () => {
    expect(() => validateAiPrompt("")).toThrow(ValidationError);
  });

  it("rejects prompt over 1500 characters", () => {
    expect(() => validateAiPrompt("x".repeat(1501))).toThrow(ValidationError);
  });

  it("rejects non-string prompt", () => {
    expect(() => validateAiPrompt(42)).toThrow(ValidationError);
    expect(() => validateAiPrompt(null)).toThrow(ValidationError);
    expect(() => validateAiPrompt(undefined)).toThrow(ValidationError);
  });

  it("sanitizes XSS attempts in prompts before processing", () => {
    const xss = "Hello <script>alert('xss')</script>";
    const result = validateAiPrompt(xss);
    expect(result).not.toContain("<script>");
  });

  it("strips HTML tags from prompt strings", () => {
    const html = "<b>bold</b> text";
    const cleaned = sanitizeString(html);
    expect(cleaned).not.toContain("<b>");
    expect(cleaned).toContain("bold");
  });
});

// ─── Carbon calculate route logic ───────────────────────────────────────────

describe("API /api/carbon/calculate — validation + calculation", () => {
  const validPayload = {
    transport: 100,
    electricity: 300,
    diet: "omnivore" as const,
    flights: 2,
    carType: "petrol" as const,
  };

  it("accepts a valid carbon input payload", () => {
    expect(() => validateCarbonInput(validPayload)).not.toThrow();
  });

  it("rejects null payload", () => {
    expect(() => validateCarbonInput(null)).toThrow(ValidationError);
  });

  it("rejects non-object payload", () => {
    expect(() => validateCarbonInput("string")).toThrow(ValidationError);
    expect(() => validateCarbonInput(42)).toThrow(ValidationError);
  });

  it("rejects invalid diet value", () => {
    expect(() => validateCarbonInput({ ...validPayload, diet: "carnivore" })).toThrow(ValidationError);
  });

  it("rejects invalid carType value", () => {
    expect(() => validateCarbonInput({ ...validPayload, carType: "nuclear" })).toThrow(ValidationError);
  });

  it("rejects transport out of range (negative)", () => {
    expect(() => validateCarbonInput({ ...validPayload, transport: -1 })).toThrow(ValidationError);
  });

  it("rejects transport out of range (too high)", () => {
    expect(() => validateCarbonInput({ ...validPayload, transport: 99999 })).toThrow(ValidationError);
  });

  it("rejects flights out of range", () => {
    expect(() => validateCarbonInput({ ...validPayload, flights: 600 })).toThrow(ValidationError);
  });

  it("calculates a non-zero breakdown for valid input", () => {
    const breakdown = calculateCarbonFootprint({
      weeklyKm: 100,
      carType: "petrol",
      monthlyKwh: 300,
      diet: "omnivore",
      flightsPerYear: 2,
    });
    expect(breakdown.total).toBeGreaterThan(0);
    expect(breakdown.totalTonnes).toBeGreaterThan(0);
  });

  it("electric car simulation always shows savings vs petrol", () => {
    const params = { weeklyKm: 200, carType: "petrol" as const, monthlyKwh: 300, diet: "omnivore" as const, flightsPerYear: 1 };
    const { savings } = simulateCarSwitch(params, "electric");
    expect(savings).toBeGreaterThan(0);
  });

  it("vegan diet simulation shows savings vs heavy-meat", () => {
    const params = { weeklyKm: 100, carType: "petrol" as const, monthlyKwh: 200, diet: "heavy-meat" as const, flightsPerYear: 0 };
    const { savings } = simulateDietChange(params, "vegan");
    expect(savings).toBeGreaterThan(0);
  });

  it("simulation savingsPercent is bounded [0, 100] for car switch", () => {
    const params = { weeklyKm: 100, carType: "diesel" as const, monthlyKwh: 200, diet: "omnivore" as const, flightsPerYear: 1 };
    const result = simulateCarSwitch(params, "electric");
    expect(result.savingsPercent).toBeGreaterThanOrEqual(0);
    expect(result.savingsPercent).toBeLessThanOrEqual(100);
  });

  it("totalTonnes is total / 1000 within 2 decimal places", () => {
    const result = calculateCarbonFootprint({
      weeklyKm: 150, carType: "petrol", monthlyKwh: 350, diet: "omnivore", flightsPerYear: 3,
    });
    expect(result.totalTonnes).toBeCloseTo(result.total / 1000, 2);
  });

  it("zero input gives only diet emissions (min floor)", () => {
    const result = calculateCarbonFootprint({
      weeklyKm: 0, carType: "none", monthlyKwh: 0, diet: "vegan", flightsPerYear: 0,
    });
    expect(result.transport).toBe(0);
    expect(result.electricity).toBe(0);
    expect(result.flights).toBe(0);
    expect(result.diet).toBeGreaterThan(0); // vegan diet still has some emissions
  });
});

// ─── Sanitization edge cases ─────────────────────────────────────────────────

describe("sanitizeString — edge cases", () => {
  it("handles ampersand escaping", () => {
    expect(sanitizeString("A & B")).toContain("&amp;");
  });

  it("handles double-quote escaping", () => {
    expect(sanitizeString('say "hello"')).toContain("&quot;");
  });

  it("handles single-quote escaping", () => {
    expect(sanitizeString("it's")).toContain("&#x27;");
  });

  it("handles backtick escaping", () => {
    expect(sanitizeString("`code`")).toContain("&#x60;");
  });

  it("truncates at exactly 2000 characters", () => {
    const long = "a".repeat(2500);
    expect(sanitizeString(long).length).toBe(2000);
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeString("")).toBe("");
  });

  it("strips nested HTML tags", () => {
    const nested = "<div><p>hello</p></div>";
    const result = sanitizeString(nested);
    expect(result).not.toContain("<div>");
    expect(result).not.toContain("<p>");
  });
});
