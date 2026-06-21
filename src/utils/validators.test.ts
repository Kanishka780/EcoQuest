import { describe, it, expect } from 'vitest';
import { TransportInputSchema, DietInputSchema, GeminiCoachInputSchema } from './validators';

describe('Zod Validators', () => {
  
  describe('TransportInputSchema', () => {
    it('rejects negative car distance values', () => {
      const result = TransportInputSchema.safeParse({
        carKmPerDay: -5,
        carFuelType: 'petrol',
        publicTransportKmPerDay: 10,
        flightsPerYear: 0,
        flightType: 'domestic',
        bikeOrWalkKmPerDay: 0
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid transport data', () => {
      const result = TransportInputSchema.safeParse({
        carKmPerDay: 20,
        carFuelType: 'petrol',
        publicTransportKmPerDay: 15,
        flightsPerYear: 2,
        flightType: 'domestic',
        bikeOrWalkKmPerDay: 1
      });
      expect(result.success).toBe(true);
    });
  });

  describe('DietInputSchema', () => {
    it('rejects beef meals exceeding total meat meals', () => {
      const result = DietInputSchema.safeParse({
        meatMealsPerWeek: 3,
        beefMealsPerWeek: 5,
        dairyServingsPerDay: 1,
        foodWastePercent: 10
      });
      expect(result.success).toBe(false);
    });

    it('accepts beef meals within total meat meals', () => {
      const result = DietInputSchema.safeParse({
        meatMealsPerWeek: 5,
        beefMealsPerWeek: 2,
        dairyServingsPerDay: 1,
        foodWastePercent: 10
      });
      expect(result.success).toBe(true);
    });
  });

  describe('GeminiCoachInputSchema', () => {
    it('strips HTML script tags from Gemini prompts to prevent XSS injection', () => {
      const result = GeminiCoachInputSchema.safeParse({
        prompt: '<script>alert("xss")</script>How do I cut down transport emissions?',
        userId: 'u-123'
      });
      expect(result.success).toBe(true);
      expect(result.data?.prompt).not.toContain('<script>');
      expect(result.data?.prompt).toBe('alert("xss")How do I cut down transport emissions?');
    });

    it('rejects prompts longer than 500 characters', () => {
      const longPrompt = 'a'.repeat(505);
      const result = GeminiCoachInputSchema.safeParse({
        prompt: longPrompt,
        userId: 'u-123'
      });
      expect(result.success).toBe(false);
    });
  });

});
