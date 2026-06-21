import { FootprintInputs, FootprintResults } from '../../../types/footprint.types';
import { IPCC_2023_FACTORS } from './emissionFactors';

/**
 * Calculates the annual carbon footprint (in kg CO2e) and returns a detailed breakdown.
 * Uses IPCC 2023 AR6, CEA India, and DEFRA factors.
 * 
 * @param inputs Form inputs for transport, energy, diet, and shopping
 * @returns FootprintResults object containing annual, monthly, breakdown and percentile rankings
 */
export function calculateAnnualFootprint(inputs: FootprintInputs): FootprintResults {
  // 1. TRANSPORT CALCULATION
  const { transport, energy, diet, shopping } = inputs;
  
  // Car distance emissions
  let carFactor = 0;
  switch (transport.carFuelType) {
    case 'petrol':
      carFactor = IPCC_2023_FACTORS.transport.petrolCar.factor;
      break;
    case 'diesel':
      carFactor = IPCC_2023_FACTORS.transport.dieselCar.factor;
      break;
    case 'electric':
      carFactor = IPCC_2023_FACTORS.transport.electricCar.factor;
      break;
    case 'hybrid':
      carFactor = IPCC_2023_FACTORS.transport.hybridCar.factor;
      break;
    default:
      carFactor = 0;
  }
  
  const carEmissions = transport.carKmPerDay * 365 * carFactor;
  const transitEmissions = transport.publicTransportKmPerDay * 365 * IPCC_2023_FACTORS.transport.publicTransport.factor;
  
  // Flight emissions
  let flightDist = 0;
  let flightFactor = 0;
  switch (transport.flightType) {
    case 'domestic':
      flightDist = 800;
      flightFactor = IPCC_2023_FACTORS.transport.domesticFlight.factor;
      break;
    case 'shortHaul':
      flightDist = 2000;
      flightFactor = IPCC_2023_FACTORS.transport.shortHaulFlight.factor;
      break;
    case 'longHaul':
      flightDist = 6000;
      flightFactor = IPCC_2023_FACTORS.transport.longHaulFlight.factor;
      break;
    default:
      flightDist = 3000; // mixed
      flightFactor = IPCC_2023_FACTORS.transport.shortHaulFlight.factor; // average
  }
  
  const flightEmissions = transport.flightsPerYear * flightDist * flightFactor;
  const transportTotal = carEmissions + transitEmissions + flightEmissions;

  // 2. ENERGY CALCULATION
  let elecFactor = 0;
  switch (energy.electricitySource) {
    case 'grid':
      elecFactor = IPCC_2023_FACTORS.energy.gridElectricityIndia.factor;
      break;
    case 'solar':
      elecFactor = IPCC_2023_FACTORS.energy.solarElectricity.factor;
      break;
    case 'wind':
      elecFactor = IPCC_2023_FACTORS.energy.windElectricity.factor;
      break;
    case 'mixed':
      elecFactor = IPCC_2023_FACTORS.energy.mixedElectricity.factor;
      break;
    default:
      elecFactor = IPCC_2023_FACTORS.energy.gridElectricityIndia.factor;
  }
  
  const hhSize = Math.max(1, energy.householdSize);
  const electricityEmissions = ((energy.electricityKwhPerMonth * 12) * elecFactor) / hhSize;
  const gasEmissions = ((energy.naturalGasUnitsPerMonth * 12) * IPCC_2023_FACTORS.energy.naturalGas.factor) / hhSize;
  const coalEmissions = ((energy.coalUsageKgPerMonth * 12) * IPCC_2023_FACTORS.energy.coal.factor) / hhSize;
  const energyTotal = electricityEmissions + gasEmissions + coalEmissions;

  // 3. DIET CALCULATION
  const meatMeals = Math.min(21, Math.max(0, diet.meatMealsPerWeek));
  const beefMeals = Math.min(meatMeals, Math.max(0, diet.beefMealsPerWeek));
  const otherMeatMeals = Math.max(0, meatMeals - beefMeals);
  const vegMeals = Math.max(0, 21 - meatMeals);
  
  const beefEmissions = beefMeals * 52 * IPCC_2023_FACTORS.diet.beefMeal.factor;
  const otherMeatEmissions = otherMeatMeals * 52 * IPCC_2023_FACTORS.diet.otherMeatMeal.factor;
  const vegEmissions = vegMeals * 52 * IPCC_2023_FACTORS.diet.vegetarianMeal.factor;
  const dairyEmissions = diet.dairyServingsPerDay * 365 * IPCC_2023_FACTORS.diet.dairyServing.factor;
  
  const baseFoodEmissions = beefEmissions + otherMeatEmissions + vegEmissions + dairyEmissions;
  // Surcharge for food waste: each percent of food waste adds 0.25% to overall food footprint
  const foodWasteMultiplier = 1 + (diet.foodWastePercent / 100) * 0.25;
  const dietTotal = baseFoodEmissions * foodWasteMultiplier;

  // 4. SHOPPING CALCULATION
  const clothingEmissions = shopping.clothingItemsPerMonth * 12 * IPCC_2023_FACTORS.shopping.clothingItem.factor;
  const electronicsEmissions = shopping.electronicsPerYear * IPCC_2023_FACTORS.shopping.electronicsItem.factor;
  const onlineEmissions = shopping.onlineOrdersPerWeek * 52 * IPCC_2023_FACTORS.shopping.onlineOrder.factor;
  const shoppingTotal = clothingEmissions + electronicsEmissions + onlineEmissions;

  // 5. TOTALS AND RANKINGS
  const annualTotal = transportTotal + energyTotal + dietTotal + shoppingTotal;
  const monthlyTotal = annualTotal / 12;

  // Percentile Rank relative to India National Average
  const natAvg = IPCC_2023_FACTORS.averages.indiaNational;
  let percentile = 50;
  if (annualTotal === 0) {
    percentile = 0;
  } else if (annualTotal < natAvg) {
    // Under average: scale from 0 to 50
    percentile = (annualTotal / natAvg) * 50;
  } else {
    // Above average: scale from 50 to 99
    percentile = 50 + ((annualTotal - natAvg) / (natAvg * 3)) * 49;
    if (percentile > 99) {percentile = 99;}
  }

  return {
    annual: parseFloat(annualTotal.toFixed(1)),
    monthly: parseFloat(monthlyTotal.toFixed(1)),
    breakdown: {
      transport: parseFloat(transportTotal.toFixed(1)),
      energy: parseFloat(energyTotal.toFixed(1)),
      diet: parseFloat(dietTotal.toFixed(1)),
      shopping: parseFloat(shoppingTotal.toFixed(1))
    },
    nationalAverage: natAvg,
    globalAverage: IPCC_2023_FACTORS.averages.global,
    percentileRank: parseFloat(percentile.toFixed(1))
  };
}

/**
 * Generates sorted hotspots breakdown in percentage for dashboard charts.
 * 
 * @param results FootprintResults object
 * @returns Array of sorted categories with percentage and absolute values
 */
export function calculateHotspots(results: FootprintResults) {
  const { breakdown } = results;
  const total = results.annual || 1; // avoid division by zero
  
  const rawBreakdown = [
    { label: 'Transportation', value: breakdown.transport, unit: 'kg CO2e', percentage: (breakdown.transport / total) * 100 },
    { label: 'Energy Usage', value: breakdown.energy, unit: 'kg CO2e', percentage: (breakdown.energy / total) * 100 },
    { label: 'Diet & Food', value: breakdown.diet, unit: 'kg CO2e', percentage: (breakdown.diet / total) * 100 },
    { label: 'Shopping & Goods', value: breakdown.shopping, unit: 'kg CO2e', percentage: (breakdown.shopping / total) * 100 }
  ];

  return rawBreakdown.sort((a, b) => b.percentage - a.percentage);
}
