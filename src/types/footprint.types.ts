export interface TransportInputs {
  carKmPerDay: number;
  carFuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'none';
  publicTransportKmPerDay: number;
  flightsPerYear: number;
  flightType: 'domestic' | 'shortHaul' | 'longHaul' | 'mixed';
  bikeOrWalkKmPerDay: number;
}

export interface EnergyInputs {
  electricityKwhPerMonth: number;
  electricitySource: 'grid' | 'solar' | 'wind' | 'mixed';
  naturalGasUnitsPerMonth: number;
  coalUsageKgPerMonth: number;
  householdSize: number;
}

export interface DietInputs {
  meatMealsPerWeek: number;
  beefMealsPerWeek: number;
  dairyServingsPerDay: number;
  foodWastePercent: number;
}

export interface ShoppingInputs {
  clothingItemsPerMonth: number;
  electronicsPerYear: number;
  onlineOrdersPerWeek: number;
}

export interface FootprintInputs {
  transport: TransportInputs;
  energy: EnergyInputs;
  diet: DietInputs;
  shopping: ShoppingInputs;
}

export interface FootprintResults {
  monthly: number; // kg CO2e
  annual: number;  // kg CO2e
  breakdown: {
    transport: number;
    energy: number;
    diet: number;
    shopping: number;
  };
  nationalAverage: number;
  globalAverage: number;
  percentileRank: number;
}

export interface FootprintRecord {
  id: string;
  calculatedAt: string;
  version: string; // e.g. "IPCC2023v1"
  inputs: FootprintInputs;
  results: FootprintResults;
  isActive: boolean;
}
