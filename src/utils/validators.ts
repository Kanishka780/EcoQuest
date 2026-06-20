import { z } from 'zod';

export const TransportInputSchema = z.object({
  carKmPerDay: z.coerce.number().min(0, "Distance must be 0 or positive").max(2000, "Distance exceeds maximum limit"),
  carFuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'none']),
  publicTransportKmPerDay: z.coerce.number().min(0, "Distance must be 0 or positive").max(500, "Distance exceeds maximum limit"),
  flightsPerYear: z.coerce.number().int("Flights must be an integer").min(0, "Flights must be 0 or positive").max(100, "Flights exceed maximum limit"),
  flightType: z.enum(['domestic', 'shortHaul', 'longHaul', 'mixed']),
  bikeOrWalkKmPerDay: z.coerce.number().min(0, "Distance must be 0 or positive").max(200, "Distance exceeds maximum limit"),
});

export const EnergyInputSchema = z.object({
  electricityKwhPerMonth: z.coerce.number().min(0, "Usage must be 0 or positive").max(50000, "Usage exceeds maximum limit"),
  electricitySource: z.enum(['grid', 'solar', 'wind', 'mixed']),
  naturalGasUnitsPerMonth: z.coerce.number().min(0, "Usage must be 0 or positive").max(10000, "Usage exceeds maximum limit"),
  coalUsageKgPerMonth: z.coerce.number().min(0, "Usage must be 0 or positive").max(5000, "Usage exceeds maximum limit"),
  householdSize: z.coerce.number().int("Size must be an integer").min(1, "Household size must be at least 1").max(20, "Household size exceeds limit"),
});

export const DietInputSchema = z.object({
  meatMealsPerWeek: z.coerce.number().int("Meals must be an integer").min(0, "Meals must be 0 or positive").max(21, "Meals cannot exceed 21 meals per week"),
  beefMealsPerWeek: z.coerce.number().int("Meals must be an integer").min(0, "Meals must be 0 or positive").max(21, "Meals cannot exceed 21 meals per week"),
  dairyServingsPerDay: z.coerce.number().min(0, "Servings must be 0 or positive").max(10, "Servings exceed maximum limit"),
  foodWastePercent: z.coerce.number().min(0, "Percent must be 0 or positive").max(100, "Percent cannot exceed 100%"),
}).refine(data => data.beefMealsPerWeek <= data.meatMealsPerWeek, {
  message: "Beef meals cannot exceed total meat meals",
  path: ["beefMealsPerWeek"]
});

export const ShoppingInputSchema = z.object({
  clothingItemsPerMonth: z.coerce.number().int("Items must be an integer").min(0, "Items must be 0 or positive").max(100, "Items exceed maximum limit"),
  electronicsPerYear: z.coerce.number().int("Devices must be an integer").min(0, "Devices must be 0 or positive").max(50, "Devices exceed maximum limit"),
  onlineOrdersPerWeek: z.coerce.number().min(0, "Orders must be 0 or positive").max(100, "Orders exceed maximum limit"),
});

export const FullCalculatorSchema = z.object({
  transport: TransportInputSchema,
  energy: EnergyInputSchema,
  diet: DietInputSchema,
  shopping: ShoppingInputSchema,
});

export const GeminiCoachInputSchema = z.object({
  prompt: z.string()
    .min(5, 'Please enter at least 5 characters')
    .max(500, 'Message too long — please keep it under 500 characters')
    .trim()
    // HTML Sanitization block (removes `<` tags to prevent raw HTML/script injection)
    .transform(val => val.replace(/<[^>]*>/g, '')),
  userId: z.string()
});
