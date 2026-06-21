import { describe, it, expect } from "vitest";
import {
  calculateCarbonFootprint,
  simulateCarSwitch,
  simulateDietChange,
  TRANSPORT_FACTORS,
  ELECTRICITY_FACTOR,
  DIET_FACTORS,
  FLIGHT_FACTOR,
} from "@/lib/carbon-calculator";
 
const baseParams = {
  weeklyKm: 100,
  carType: "petrol" as const,
  monthlyKwh: 300,
  diet: "omnivore" as const,
  flightsPerYear: 2,
};
 
describe("calculateCarbonFootprint", () => {
  it("returns non-negative values for all fields", () => {
    const result = calculateCarbonFootprint(baseParams);
    expect(result.transport).toBeGreaterThanOrEqual(0);
    expect(result.electricity).toBeGreaterThanOrEqual(0);
    expect(result.diet).toBeGreaterThanOrEqual(0);
    expect(result.flights).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
 
  it("calculates transport correctly", () => {
    const result = calculateCarbonFootprint({ ...baseParams, weeklyKm: 100, carType: "petrol" });
    const expected = Math.round(100 * 52 * TRANSPORT_FACTORS.petrol);
    expect(result.transport).toBe(expected);
  });
 
  it("calculates electricity correctly", () => {
    const result = calculateCarbonFootprint({ ...baseParams, monthlyKwh: 300 });
    const expected = Math.round(300 * 12 * ELECTRICITY_FACTOR);
    expect(result.electricity).toBe(expected);
  });
 
  it("uses correct diet emission factor", () => {
    const result = calculateCarbonFootprint({ ...baseParams, diet: "vegan" });
    expect(result.diet).toBe(DIET_FACTORS.vegan);
  });
 
  it("calculates flights correctly", () => {
    const result = calculateCarbonFootprint({ ...baseParams, flightsPerYear: 4 });
    expect(result.flights).toBe(4 * FLIGHT_FACTOR);
  });
 
  it("total equals sum of components", () => {
    const result = calculateCarbonFootprint(baseParams);
    const sum = result.transport + result.electricity + result.diet + result.flights;
    expect(result.total).toBe(sum);
  });
 
  it("converts total to tonnes correctly", () => {
    const result = calculateCarbonFootprint(baseParams);
    expect(result.totalTonnes).toBeCloseTo(result.total / 1000, 1);
  });
 
  it("electric car produces fewer emissions than petrol", () => {
    const petrol = calculateCarbonFootprint({ ...baseParams, carType: "petrol" });
    const electric = calculateCarbonFootprint({ ...baseParams, carType: "electric" });
    expect(electric.transport).toBeLessThan(petrol.transport);
  });
 
  it("vegan diet produces fewer emissions than heavy-meat", () => {
    const vegan = calculateCarbonFootprint({ ...baseParams, diet: "vegan" });
    const meat = calculateCarbonFootprint({ ...baseParams, diet: "heavy-meat" });
    expect(vegan.diet).toBeLessThan(meat.diet);
  });
 
  it("zero km per week gives zero transport emissions", () => {
    const result = calculateCarbonFootprint({ ...baseParams, weeklyKm: 0 });
    expect(result.transport).toBe(0);
  });
 
  it("carType none gives zero transport emissions", () => {
    const result = calculateCarbonFootprint({ ...baseParams, carType: "none" });
    expect(result.transport).toBe(0);
  });
});
 
describe("simulateCarSwitch", () => {
  it("switching to electric shows positive savings vs petrol", () => {
    const result = simulateCarSwitch(baseParams, "electric");
    expect(result.savings).toBeGreaterThan(0);
    expect(result.savingsPercent).toBeGreaterThan(0);
  });
 
  it("switching to same car type gives zero savings", () => {
    const result = simulateCarSwitch(baseParams, "petrol");
    expect(result.savings).toBe(0);
    expect(result.savingsPercent).toBe(0);
  });
 
  it("savingsPercent is between 0 and 100", () => {
    const result = simulateCarSwitch(baseParams, "electric");
    expect(result.savingsPercent).toBeGreaterThanOrEqual(0);
    expect(result.savingsPercent).toBeLessThanOrEqual(100);
  });
});
 
describe("simulateDietChange", () => {
  it("switching from heavy-meat to vegan shows savings", () => {
    const meatParams = { ...baseParams, diet: "heavy-meat" as const };
    const result = simulateDietChange(meatParams, "vegan");
    expect(result.savings).toBeGreaterThan(0);
  });
 
  it("switching to heavier diet shows negative savings", () => {
    const veganParams = { ...baseParams, diet: "vegan" as const };
    const result = simulateDietChange(veganParams, "heavy-meat");
    expect(result.savings).toBeLessThan(0);
  });
});
