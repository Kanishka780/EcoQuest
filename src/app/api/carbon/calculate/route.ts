import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { validateCarbonInput } from "@/lib/validation";
import { calculateCarbonFootprint, simulateCarSwitch, simulateDietChange } from "@/lib/carbon-calculator";
 
export async function POST(req: NextRequest) {
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
    let validatedData;
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
    console.error("API Error in /api/carbon/calculate:", error);
    const err = error as Error | null;
    return NextResponse.json(
      { error: err?.message || "An error occurred during carbon calculations." },
      { status: 500 }
    );
  }
}
