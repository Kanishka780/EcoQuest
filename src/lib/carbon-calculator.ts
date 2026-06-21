/**
 * Carbon footprint calculation logic.
 * All emission factors are sourced from IPCC AR6 and UK DEFRA 2023 guidelines.
 *
 * Units: kg CO₂e per year unless otherwise noted.
 */
 
export type DietType = "vegan" | "vegetarian" | "omnivore" | "heavy-meat";
export type CarType = "electric" | "hybrid" | "petrol" | "diesel" | "none";
 
/** Emission factor: kg CO₂e per km */
export const TRANSPORT_FACTORS: Record<CarType, number> = {
  electric: 0.053,
  hybrid: 0.105,
  petrol: 0.192,
  diesel: 0.171,
  none: 0,
};
 
/** Emission factor: kg CO₂e per kWh (world average grid) */
export const ELECTRICITY_FACTOR = 0.475;
 
/** Emission factor: kg CO₂e per year for diet */
export const DIET_FACTORS: Record<DietType, number> = {
  vegan: 1_500,
  vegetarian: 1_700,
  omnivore: 2_500,
  "heavy-meat": 3_300,
};
 
/** Emission factor: kg CO₂e per short-haul flight (avg 1,500 km round trip) */
export const FLIGHT_FACTOR = 255;
 
export interface CarbonBreakdown {
  /** Transport emissions in kg CO₂e / year */
  transport: number;
  /** Electricity emissions in kg CO₂e / year */
  electricity: number;
  /** Diet emissions in kg CO₂e / year */
  diet: number;
  /** Flight emissions in kg CO₂e / year */
  flights: number;
  /** Total emissions in kg CO₂e / year */
  total: number;
  /** Total emissions in tonnes CO₂e / year */
  totalTonnes: number;
}
 
export interface CarbonInputParams {
  /** Weekly driving distance in km */
  weeklyKm: number;
  carType: CarType;
  /** Monthly electricity consumption in kWh */
  monthlyKwh: number;
  diet: DietType;
  /** Number of flights per year */
  flightsPerYear: number;
}
 
/**
 * Calculate annual carbon footprint from lifestyle parameters.
 */
export function calculateCarbonFootprint(
  params: CarbonInputParams
): CarbonBreakdown {
  const { weeklyKm, carType, monthlyKwh, diet, flightsPerYear } = params;
 
  const annualKm = weeklyKm * 52;
  const annualKwh = monthlyKwh * 12;
 
  const transportEmissions =
    annualKm * (TRANSPORT_FACTORS[carType] ?? TRANSPORT_FACTORS.petrol);
  const electricityEmissions = annualKwh * ELECTRICITY_FACTOR;
  const dietEmissions = DIET_FACTORS[diet];
  const flightEmissions = flightsPerYear * FLIGHT_FACTOR;
 
  const total =
    transportEmissions + electricityEmissions + dietEmissions + flightEmissions;
 
  return {
    transport: Math.round(transportEmissions),
    electricity: Math.round(electricityEmissions),
    diet: Math.round(dietEmissions),
    flights: Math.round(flightEmissions),
    total: Math.round(total),
    totalTonnes: parseFloat((total / 1000).toFixed(2)),
  };
}
 
/**
 * Estimate percentage reduction if user switches to a given car type.
 */
export function simulateCarSwitch(
  params: CarbonInputParams,
  newCarType: CarType
): { savings: number; savingsPercent: number } {
  const current = calculateCarbonFootprint(params);
  const simulated = calculateCarbonFootprint({ ...params, carType: newCarType });
  const savings = current.total - simulated.total;
  const savingsPercent = current.total > 0 ? (savings / current.total) * 100 : 0;
  return {
    savings: Math.round(savings),
    savingsPercent: parseFloat(savingsPercent.toFixed(1)),
  };
}
 
/**
 * Estimate percentage reduction if user changes diet.
 */
export function simulateDietChange(
  params: CarbonInputParams,
  newDiet: DietType
): { savings: number; savingsPercent: number } {
  const current = calculateCarbonFootprint(params);
  const simulated = calculateCarbonFootprint({ ...params, diet: newDiet });
  const savings = current.total - simulated.total;
  const savingsPercent = current.total > 0 ? (savings / current.total) * 100 : 0;
  return {
    savings: Math.round(savings),
    savingsPercent: parseFloat(savingsPercent.toFixed(1)),
  };
}
