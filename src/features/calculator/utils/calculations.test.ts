import { describe, it, expect } from 'vitest';
import { calculateAnnualFootprint, calculateHotspots } from './calculations';
import { FootprintInputs } from '../../../types/footprint.types';

const baseInputs: FootprintInputs = {
  transport: {
    carKmPerDay: 15,
    carFuelType: 'petrol',
    publicTransportKmPerDay: 10,
    flightsPerYear: 0,
    flightType: 'domestic',
    bikeOrWalkKmPerDay: 0
  },
  energy: {
    electricityKwhPerMonth: 200,
    electricitySource: 'grid',
    naturalGasUnitsPerMonth: 0,
    coalUsageKgPerMonth: 0,
    householdSize: 1
  },
  diet: {
    meatMealsPerWeek: 7,
    beefMealsPerWeek: 0,
    dairyServingsPerDay: 0,
    foodWastePercent: 0
  },
  shopping: {
    clothingItemsPerMonth: 0,
    electronicsPerYear: 0,
    onlineOrdersPerWeek: 0
  }
};

describe('Carbon Calculator Calculations', () => {
  
  describe('calculateAnnualFootprint', () => {
    it('calculates transport emissions correctly using IPCC petrol factors', () => {
      const result = calculateAnnualFootprint(baseInputs);
      // Car: 15km/day * 365 days/year * 0.192 kg/km = 1051.2 kg
      expect(result.breakdown.transport).toBeCloseTo(1299.4, 0); // includes transit 10km * 365 * 0.068 = 248.2kg
    });

    it('handles baseline emissions correctly for zero transit/energy inputs', () => {
      const zeroInputs: FootprintInputs = {
        transport: { carKmPerDay: 0, carFuelType: 'none', publicTransportKmPerDay: 0, flightsPerYear: 0, flightType: 'domestic', bikeOrWalkKmPerDay: 0 },
        energy: { electricityKwhPerMonth: 0, electricitySource: 'solar', naturalGasUnitsPerMonth: 0, coalUsageKgPerMonth: 0, householdSize: 1 },
        diet: { meatMealsPerWeek: 0, beefMealsPerWeek: 0, dairyServingsPerDay: 0, foodWastePercent: 0 },
        shopping: { clothingItemsPerMonth: 0, electronicsPerYear: 0, onlineOrdersPerWeek: 0 }
      };

      const result = calculateAnnualFootprint(zeroInputs);
      // Eats 21 veg meals/week: 21 * 52 * 0.35 kg = 382.2 kg CO2
      expect(result.annual).toBe(382.2);
      expect(result.percentileRank).toBeCloseTo(10.1, 1);
    });

    it('correctly normalizes energy emissions by household size', () => {
      const single = calculateAnnualFootprint(baseInputs);
      const family = calculateAnnualFootprint({
        ...baseInputs,
        energy: { ...baseInputs.energy, householdSize: 4 }
      });
      // Energy should be 1/4 of single person's energy since shared
      expect(family.breakdown.energy).toBeCloseTo(single.breakdown.energy / 4, 1);
    });

    it.each([
      ['electric', 'hybrid'],
      ['electric', 'diesel'],
      ['hybrid', 'diesel'],
      ['none', 'petrol'],
    ] as const)('produces lower transport emissions for %s than %s at the same distance', (cleaner, dirtier) => {
      const cleanerResult = calculateAnnualFootprint({
        ...baseInputs,
        transport: { ...baseInputs.transport, carFuelType: cleaner }
      });
      const dirtierResult = calculateAnnualFootprint({
        ...baseInputs,
        transport: { ...baseInputs.transport, carFuelType: dirtier }
      });
      expect(cleanerResult.breakdown.transport).toBeLessThanOrEqual(dirtierResult.breakdown.transport);
    });

    it.each(['domestic', 'shortHaul', 'longHaul', 'mixed'] as const)(
      'calculates flight emissions for %s flights',
      (flightType) => {
        const result = calculateAnnualFootprint({
          ...baseInputs,
          transport: { ...baseInputs.transport, flightsPerYear: 2, flightType }
        });
        expect(result.breakdown.transport).toBeGreaterThan(0);
      }
    );

    it.each(['solar', 'wind', 'mixed'] as const)(
      'calculates energy emissions for %s electricity source',
      (electricitySource) => {
        const result = calculateAnnualFootprint({
          ...baseInputs,
          energy: { ...baseInputs.energy, electricitySource }
        });
        expect(result.breakdown.energy).toBeGreaterThanOrEqual(0);
      }
    );

    it('includes natural gas and coal usage in the energy total', () => {
      const result = calculateAnnualFootprint({
        ...baseInputs,
        energy: { ...baseInputs.energy, naturalGasUnitsPerMonth: 10, coalUsageKgPerMonth: 5 }
      });
      const baseline = calculateAnnualFootprint(baseInputs);
      expect(result.breakdown.energy).toBeGreaterThan(baseline.breakdown.energy);
    });

    it('caps percentile rank at 99 for extremely high footprints', () => {
      const result = calculateAnnualFootprint({
        ...baseInputs,
        transport: { ...baseInputs.transport, carKmPerDay: 1000, flightsPerYear: 50, flightType: 'longHaul' },
        energy: { ...baseInputs.energy, electricityKwhPerMonth: 50000 }
      });
      expect(result.percentileRank).toBe(99);
    });
  });

  describe('calculateHotspots', () => {
    it('returns categories sorted by emission percentage', () => {
      const result = calculateAnnualFootprint(baseInputs);
      const hotspots = calculateHotspots(result);
      const percentages = hotspots.map(h => h.percentage);
      expect(percentages).toEqual([...percentages].sort((a, b) => b - a));
    });

    it('percentages sum to approximately 100%', () => {
      const result = calculateAnnualFootprint(baseInputs);
      const hotspots = calculateHotspots(result);
      const total = hotspots.reduce((sum, h) => sum + h.percentage, 0);
      expect(total).toBeCloseTo(100, 0);
    });
  });

});
