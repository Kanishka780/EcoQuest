import { NextRequest, NextResponse } from 'next/server';
import { GeminiCoachInputSchema } from '../../../utils/validators';

// Enforce server-side secret key protection
const getGeminiApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "" || key.includes("your_")) {
    return null;
  }
  return key;
};

// Simple rate limiter storage (in-memory mock for local dev)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const limit = 15; // 15 requests per hour
  const windowMs = 3600000; // 1 hour
  const now = Date.now();
  
  const record = rateLimitMap.get(userId);
  if (!record) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return false;
  }
  
  if (now > record.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return false;
  }
  
  if (record.count >= limit) {
    return true;
  }
  
  record.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. INPUT VALIDATION (Zod)
    const result = GeminiCoachInputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    
    const { prompt: userMessage, userId } = result.data;
    
    // 2. RATE LIMITING
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please limit coaching checks to 15 queries per hour." }, 
        { status: 429 }
      );
    }
    
    const apiKey = getGeminiApiKey();

    // 3. MOCK MODE FALLBACK (If API key is missing)
    if (!apiKey) {
      const text = userMessage.toLowerCase();
      interface CoachResponse {
        summary: string;
        topSources: { category: string; percentage: number; insight: string }[];
        recommendations: {
          action: string;
          co2SavedKgPerYear: number;
          difficulty: string;
          timeframe: string;
          reason: string;
        }[];
        motivationalMessage: string;
        nextCheckIn: string;
      }
      const responseJson: CoachResponse = {
        summary: "I've reviewed your carbon profile details. Currently, your daily commuting habits represent your most addressable opportunity for savings.",
        topSources: [
          { category: "Transportation", percentage: 55, insight: "High dependency on fossil-fuel cars accounts for the majority of your daily travel emissions." }
        ],
        recommendations: [
          {
            action: "Switch to electric rail or electric bus commuting twice a week",
            co2SavedKgPerYear: 320,
            difficulty: "easy",
            timeframe: "Within 7 days",
            reason: "Public transit carries a much lower per-capita intensity, saving roughly 3.1kg CO2 per trip."
          },
          {
            action: "Implement a hybrid remote-work setup (telecommute 2 days/week)",
            co2SavedKgPerYear: 450,
            difficulty: "medium",
            timeframe: "Next 30 days",
            reason: "Eliminating vehicle travel entirely on workdays removes 100% of your daily commute footprint."
          }
        ],
        motivationalMessage: "Every small change accumulates. A single public transit trip saves more CO2 than an average tree absorbs in a month!",
        nextCheckIn: "Check back in next week after tracking your daily habits to view updated metrics."
      };

      if (text.includes("diet") || text.includes("food") || text.includes("eat")) {
        responseJson.summary = "Looking at your culinary habits, meat meals represent a significant portion of your annual footprint.";
        responseJson.topSources = [{ category: "Diet & Food", percentage: 40, insight: "Meat-based meals, specifically beef, are extremely energy intensive to produce." }];
        responseJson.recommendations = [
          {
            action: "Incorporate 'Meatless Mondays' into your weekly schedule",
            co2SavedKgPerYear: 180,
            difficulty: "easy",
            timeframe: "This week",
            reason: "Swapping animal proteins for grains and legumes drops food prep emissions by 85%."
          }
        ];
      } else if (text.includes("electricity") || text.includes("power") || text.includes("solar")) {
        responseJson.summary = "Your grid electricity accounts for a substantial energy footprint due to coal usage in grid supply.";
        responseJson.topSources = [{ category: "Energy Usage", percentage: 35, insight: "Standard grid mix incorporates heavy thermal fossil components." }];
        responseJson.recommendations = [
          {
            action: "Install a 3kW residential solar generation system",
            co2SavedKgPerYear: 1200,
            difficulty: "hard",
            timeframe: "6 months",
            reason: "Solar lifecycle factors are 93% cleaner than coal grid generation."
          }
        ];
      }

      // Add a slight delay to simulate network call latency for authenticity
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json(responseJson);
    }

    // 4. PRODUCTION MODE (Call real Gemini API)
    const systemPrompt = `
      You are EcoQuest's AI Sustainability Coach. Analyze the user's prompt and return 
      structured, actionable sustainability coaching advice. Always respond with valid JSON matching this schema:
      {
        "summary": "2-3 sentence personalized summary of their situation and prompt answer",
        "topSources": [{ "category": string, "percentage": number, "insight": string }],
        "recommendations": [
          {
            "action": string,
            "co2SavedKgPerYear": number,
            "difficulty": "easy" | "medium" | "hard",
            "timeframe": string,
            "reason": string
          }
        ],
        "motivationalMessage": string,
        "nextCheckIn": string
      }
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error('Failed to generate response from Gemini Coach.');
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error('Empty response from Gemini API.');
    }

    const coachAdvice = JSON.parse(candidateText.trim());
    return NextResponse.json(coachAdvice);

  } catch (error: unknown) {
    console.error('API Error in /api/coach:', error);
    const err = error as Error | null;
    return NextResponse.json(
      { error: err?.message || 'An error occurred during sustainability coaching generation.' }, 
      { status: 500 }
    );
  }
}
