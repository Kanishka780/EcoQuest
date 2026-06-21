import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  validateNumber,
  validateCarbonInput,
  validateAiPrompt,
  ValidationError,
} from "@/lib/validation";
 
describe("sanitizeString", () => {
  it("removes HTML tags", () => {
    // Tags are stripped first, then remaining content chars are escaped
    const result = sanitizeString("<script>alert('xss')</script>");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("</script>");
    // The text content "alert('xss')" remains with quotes escaped
    expect(result).toContain("alert(");
    expect(result).toContain("&#x27;xss&#x27;");
  });
 
  it("escapes dangerous characters", () => {
    const result = sanitizeString('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("<img");
    expect(result).not.toContain("onerror");
  });
 
  it("trims whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });
 
  it("enforces max length of 2000 characters", () => {
    const long = "a".repeat(3000);
    expect(sanitizeString(long).length).toBe(2000);
  });
 
  it("handles empty string", () => {
    expect(sanitizeString("")).toBe("");
  });
});
 
describe("validateNumber", () => {
  it("returns the number if valid", () => {
    expect(validateNumber(42)).toBe(42);
  });
 
  it("throws on non-finite values", () => {
    expect(() => validateNumber(Infinity)).toThrow(ValidationError);
    expect(() => validateNumber(NaN)).toThrow(ValidationError);
  });
 
  it("throws when below minimum", () => {
    expect(() => validateNumber(-5, { min: 0 })).toThrow(ValidationError);
  });
 
  it("throws when above maximum", () => {
    expect(() => validateNumber(200, { max: 100 })).toThrow(ValidationError);
  });
 
  it("coerces string numbers", () => {
    expect(validateNumber("10")).toBe(10);
  });
});
 
describe("validateCarbonInput", () => {
  const validInput = {
    transport: 100,
    electricity: 200,
    diet: "vegan",
    flights: 2,
    carType: "electric",
  };
 
  it("accepts valid input", () => {
    const result = validateCarbonInput(validInput);
    expect(result.diet).toBe("vegan");
    expect(result.transport).toBe(100);
  });
 
  it("throws for invalid diet", () => {
    expect(() =>
      validateCarbonInput({ ...validInput, diet: "fruitarian" })
    ).toThrow(ValidationError);
  });
 
  it("throws for invalid carType", () => {
    expect(() =>
      validateCarbonInput({ ...validInput, carType: "rocket" })
    ).toThrow(ValidationError);
  });
 
  it("throws for transport out of range", () => {
    expect(() =>
      validateCarbonInput({ ...validInput, transport: -10 })
    ).toThrow(ValidationError);
  });
 
  it("throws for non-object input", () => {
    expect(() => validateCarbonInput("not an object")).toThrow(ValidationError);
    expect(() => validateCarbonInput(null)).toThrow(ValidationError);
  });
});
 
describe("validateAiPrompt", () => {
  it("accepts a valid prompt", () => {
    const prompt = "How can I reduce my carbon footprint?";
    expect(validateAiPrompt(prompt)).toBe(prompt);
  });
 
  it("throws for non-string input", () => {
    expect(() => validateAiPrompt(123)).toThrow(ValidationError);
  });
 
  it("throws for empty prompt", () => {
    expect(() => validateAiPrompt("")).toThrow(ValidationError);
    expect(() => validateAiPrompt(" ")).toThrow(ValidationError);
  });
 
  it("throws for prompt over 1500 characters", () => {
    expect(() => validateAiPrompt("a".repeat(1501))).toThrow(ValidationError);
  });
 
  it("sanitizes HTML in prompts", () => {
    const result = validateAiPrompt("Hello <b>world</b>");
    expect(result).not.toContain("<b>");
  });
});
