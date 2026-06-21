/**
 * @fileoverview API Route for Carbon Footprint Calculation.
 *
 * Receives daily habits data, performs sanitization, calculates annual footprint breakdowns,
 * and generates simulated reductions for vehicle and dietary switches.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { validateCarbonInput, type CarbonInputData } from "@/lib/validation";
import { calculateCarbonFootprint, simulateCarSwitch, simulateDietChange } from "@/lib/carbon-calculator";

/**
 * Handles carbon calculation requests.
 *
 * @param req - The NextRequest object.
 * @returns A Promise resolving to a NextResponse containing the carbon footprint breakdown and simulations.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. IP-based rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const limitRes = rateLimit(ip, { maxRequests: 30, windowMs: 60000 }); // 30 requests per minute
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. INPUT VALIDATION & SANITIZATION
    let validatedData: CarbonInputData;
    try {
      validatedData = validateCarbonInput(body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const params = {
      weeklyKm: validatedData.transport,
      carType: validatedData.carType || "none",
      monthlyKwh: validatedData.electricity,
      diet: validatedData.diet,
      flightsPerYear: validatedData.flights,
    };

    // 3. PERFORM CALCULATIONS
    const footprint = calculateCarbonFootprint(params);

    // 4. RUN SIMULATIONS (Shows how to reduce footprint directly from server)
    const electricSwitch = simulateCarSwitch(params, "electric");
    const veganSwitch = simulateDietChange(params, "vegan");

    return NextResponse.json({
      footprint,
      simulations: {
        switchToElectric: {
          savingsKg: electricSwitch.savings,
          savingsPercent: electricSwitch.savingsPercent,
        },
        switchToVegan: {
          savingsKg: veganSwitch.savings,
          savingsPercent: veganSwitch.savingsPercent,
        }
      }
    });

  } catch (error: unknown) {
    console.warn("API Error in /api/carbon/calculate:", error);
    const message = error instanceof Error ? error.message : "An error occurred during carbon calculations.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
