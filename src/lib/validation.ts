/**
 * @fileoverview Input validation and sanitization utilities for EcoQuest.
 * Used in API routes and form handlers to prevent injection attacks.
 */
 
/** Strip HTML tags and dangerous characters from a string */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>&"'`]/g, (char) => {
      const escapeMap: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;",
      };
      return escapeMap[char] ?? char;
    })
    .trim()
    .slice(0, 2000); // Enforce max length
}
 
/** Validate that a value is a finite number within optional bounds */
export function validateNumber(
  value: unknown,
  { min = -Infinity, max = Infinity }: { min?: number; max?: number } = {}
): number {
  const num = Number(value);
  if (!isFinite(num)) {
    throw new ValidationError(`Expected a finite number, got: ${value}`);
  }
  if (num < min || num > max) {
    throw new ValidationError(`Value ${num} is out of range [${min}, ${max}]`);
  }
  return num;
}
 
/** Validated carbon footprint inputs. */
export interface CarbonInputData {
  /** Weekly driving distance in kilometers. */
  transport: number;
  /** Monthly utility electricity consumption in kWh. */
  electricity: number;
  /** User's primary dietary categorization. */
  diet: "vegan" | "vegetarian" | "omnivore" | "heavy-meat";
  /** Number of flights taken per year. */
  flights: number;
  /** Optional type of vehicle fuel used. */
  carType?: "electric" | "hybrid" | "petrol" | "diesel" | "none";
}
 
/** Helper type guard to check if an unknown value is a record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateCarbonInput(raw: unknown): CarbonInputData {
  if (!isRecord(raw)) {
    throw new ValidationError("Input must be an object");
  }

  const obj = raw;

  const validDiets = ["vegan", "vegetarian", "omnivore", "heavy-meat"] as const;
  const validCarTypes = ["electric", "hybrid", "petrol", "diesel", "none"] as const;

  const diet = obj["diet"] as string;
  if (!validDiets.includes(diet as (typeof validDiets)[number])) {
    throw new ValidationError(`Invalid diet type: ${diet}`);
  }

  const carType = obj["carType"] as string | undefined;
  if (carType && !validCarTypes.includes(carType as (typeof validCarTypes)[number])) {
    throw new ValidationError(`Invalid car type: ${carType}`);
  }

  return {
    transport: validateNumber(obj["transport"], { min: 0, max: 10_000 }),
    electricity: validateNumber(obj["electricity"], { min: 0, max: 100_000 }),
    diet: diet as CarbonInputData["diet"],
    flights: validateNumber(obj["flights"], { min: 0, max: 500 }),
    carType: carType as CarbonInputData["carType"],
  };
}
 
/** Custom validation error */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
 
/** Validate prompt strings sent to Gemini */
export function validateAiPrompt(prompt: unknown): string {
  if (typeof prompt !== "string") {
    throw new ValidationError("Prompt must be a string");
  }
  const cleaned = sanitizeString(prompt);
  if (cleaned.length < 2) {
    throw new ValidationError("Prompt is too short");
  }
  if (cleaned.length > 1500) {
    throw new ValidationError("Prompt exceeds maximum length of 1500 characters");
  }
  return cleaned;
}
