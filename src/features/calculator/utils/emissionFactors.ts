export interface EmissionFactor {
  factor: number;
  unit: string;
  source: string;
  citation: string;
}

export interface EmissionFactorsTable {
  version: string;
  publishedAt: string;
  transport: {
    petrolCar: EmissionFactor;
    dieselCar: EmissionFactor;
    electricCar: EmissionFactor;
    hybridCar: EmissionFactor;
    publicTransport: EmissionFactor;
    domesticFlight: EmissionFactor;
    shortHaulFlight: EmissionFactor;
    longHaulFlight: EmissionFactor;
    bikeOrWalk: EmissionFactor;
  };
  energy: {
    gridElectricityIndia: EmissionFactor;
    solarElectricity: EmissionFactor;
    windElectricity: EmissionFactor;
    mixedElectricity: EmissionFactor;
    naturalGas: EmissionFactor;
    coal: EmissionFactor;
  };
  diet: {
    beefMeal: EmissionFactor;
    otherMeatMeal: EmissionFactor;
    vegetarianMeal: EmissionFactor;
    dairyServing: EmissionFactor;
    foodWastePerKg: EmissionFactor;
  };
  shopping: {
    clothingItem: EmissionFactor;
    electronicsItem: EmissionFactor;
    onlineOrder: EmissionFactor;
  };
  averages: {
    indiaNational: number; // tons CO2/year
    global: number;        // tons CO2/year
  };
}

export const IPCC_2023_FACTORS: EmissionFactorsTable = {
  version: 'IPCC2023v1.0.0',
  publishedAt: '2023-11-15T00:00:00Z',
  transport: {
    petrolCar: {
      factor: 0.192,
      unit: 'kg CO2e / km',
      source: 'IPCC AR6 WG3',
      citation: 'IPCC Sixth Assessment Report, Working Group III Annex I'
    },
    dieselCar: {
      factor: 0.171,
      unit: 'kg CO2e / km',
      source: 'IPCC AR6 WG3',
      citation: 'IPCC Sixth Assessment Report, Working Group III Annex I'
    },
    electricCar: {
      factor: 0.082,
      unit: 'kg CO2e / km',
      source: 'CEA India 2023',
      citation: 'Central Electricity Authority, CO2 Baseline Database for Indian Power Sector'
    },
    hybridCar: {
      factor: 0.115,
      unit: 'kg CO2e / km',
      source: 'DEFRA 2023',
      citation: 'UK Department for Environment, Food & Rural Affairs Greenhouse Gas Conversion Factors'
    },
    publicTransport: {
      factor: 0.068,
      unit: 'kg CO2e / km',
      source: 'DEFRA 2023',
      citation: 'UK DEFRA Passenger Transit Average Conversion Factors'
    },
    domesticFlight: {
      factor: 0.255,
      unit: 'kg CO2e / km',
      source: 'DEFRA 2023',
      citation: 'DEFRA Aviation Emission Factors (including radiative forcing)'
    },
    shortHaulFlight: {
      factor: 0.150,
      unit: 'kg CO2e / km',
      source: 'DEFRA 2023',
      citation: 'DEFRA Short-haul international aviation emission rates'
    },
    longHaulFlight: {
      factor: 0.195,
      unit: 'kg CO2e / km',
      source: 'DEFRA 2023',
      citation: 'DEFRA Long-haul international aviation emission rates'
    },
    bikeOrWalk: {
      factor: 0.0,
      unit: 'kg CO2e / km',
      source: 'IPCC AR6',
      citation: 'Active transit is considered net-zero direct emissions'
    }
  },
  energy: {
    gridElectricityIndia: {
      factor: 0.716, // kg CO2 per kWh
      unit: 'kg CO2e / kWh',
      source: 'CEA India 2023',
      citation: 'Central Electricity Authority, User Guide Version 19'
    },
    solarElectricity: {
      factor: 0.045, // lifecycle emissions
      unit: 'kg CO2e / kWh',
      source: 'NREL 2021',
      citation: 'National Renewable Energy Laboratory Lifecycle Greenhouse Gas Emissions'
    },
    windElectricity: {
      factor: 0.011, // lifecycle emissions
      unit: 'kg CO2e / kWh',
      source: 'NREL 2021',
      citation: 'NREL Lifecycle Assessments for Wind Generation'
    },
    mixedElectricity: {
      factor: 0.450,
      unit: 'kg CO2e / kWh',
      source: 'IEA 2023',
      citation: 'International Energy Agency Grid Intensity Averages'
    },
    naturalGas: {
      factor: 2.02, // per m3 or equivalent unit
      unit: 'kg CO2e / unit',
      source: 'IPCC AR6',
      citation: 'IPCC Fuel Emission Reference Guide'
    },
    coal: {
      factor: 2.42, // per kg
      unit: 'kg CO2e / kg',
      source: 'IPCC AR6',
      citation: 'IPCC Carbon Intensity Tables'
    }
  },
  diet: {
    beefMeal: {
      factor: 3.3, // average serving (~100g cooked beef)
      unit: 'kg CO2e / meal',
      source: 'Poore & Nemecek 2018',
      citation: 'Poore & Nemecek, Reducing food’s environmental impacts through producers and consumers (Science)'
    },
    otherMeatMeal: {
      factor: 0.69, // chicken/pork average
      unit: 'kg CO2e / meal',
      source: 'Poore & Nemecek 2018',
      citation: 'Poore & Nemecek Food Footprints Database'
    },
    vegetarianMeal: {
      factor: 0.35,
      unit: 'kg CO2e / meal',
      source: 'Poore & Nemecek 2018',
      citation: 'Vegetarian Meal Average lifecycle emissions'
    },
    dairyServing: {
      factor: 0.40, // 200ml milk or equivalent
      unit: 'kg CO2e / serving',
      source: 'Poore & Nemecek 2018',
      citation: 'Poore & Nemecek Dairy Footprint statistics'
    },
    foodWastePerKg: {
      factor: 2.5,
      unit: 'kg CO2e / kg wasted',
      source: 'FAO 2023',
      citation: 'FAO Food Waste and Loss Environmental footprint reports'
    }
  },
  shopping: {
    clothingItem: {
      factor: 9.0, // average piece of clothing
      unit: 'kg CO2e / item',
      source: 'WRAP 2022',
      citation: 'Waste & Resources Action Programme Clothing Impact Study'
    },
    electronicsItem: {
      factor: 70.0, // average smartphone life cycle
      unit: 'kg CO2e / device',
      source: 'Apple 2023 LCA',
      citation: 'Apple Product Environmental Reports Lifecycle Assessments'
    },
    onlineOrder: {
      factor: 0.5, // last-mile delivery average
      unit: 'kg CO2e / delivery',
      source: 'McKinsey 2020',
      citation: 'McKinsey & Co. Green Logistics last mile analysis'
    }
  },
  averages: {
    indiaNational: 1900.0, // 1.9 tons per capita per year
    global: 4700.0        // 4.7 tons per capita per year
  }
};
