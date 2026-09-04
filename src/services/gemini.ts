/**
 * Gemini API Service — Axiom
 *
 * Direct fetch() calls to Gemini API from the mobile app.
 * No Cloud Functions.
 */
import type {
  CoachInputPayload,
  GeminiRawResponse,
} from "../types/gemini";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_TEXT_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];
const DEFAULT_VISION_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

function parseModelList(raw: string | undefined, fallback: string[]) {
  if (!raw) return fallback;
  const models = raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return models.length > 0 ? models : fallback;
}

async function callGeminiWithModels(
  models: string[],
  body: Record<string, unknown>
): Promise<string> {
  let last404: string | null = null;
  for (const model of models) {
    const url = `${BASE_URL}/${model}:generateContent?key=${GEMINI_KEY}`;
    console.log(`📡 Sending request to Gemini (${model})...`);
    const res = await fetch(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    console.log(`📬 Gemini API Status: ${res.status} ${res.statusText}`);

    if (res.ok) {
      const data: GeminiRawResponse = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      console.log(`✅ Success! Full API Response:`, data);
      console.log(`✅ Extracted text:`, responseText);
      return responseText;
    }

    if (res.status === 404) {
      last404 = model;
      continue;
    }

    let errorText = "";
    try {
      errorText = await res.text();
      console.warn(`❌ API Error Response:`, errorText);
    } catch {
      errorText = "";
    }

    // Check for quota exceeded errors
    if (res.status === 429) {
      console.warn("❌ QUOTA EXCEEDED - 429 Too Many Requests");
    }
    if (res.status === 403 && errorText.includes("quota")) {
      console.warn("❌ QUOTA EXCEEDED - 403 Quota");
    }

    throw new Error(
      `Gemini API error: ${res.status} ${res.statusText}${errorText ? ` - ${errorText}` : ""}`
    );
  }

  throw new Error(
    `Gemini API error: model not found${
      last404 ? ` (tried ${last404})` : ""
    }`
  );
}

type GeminiGenerationOptions = {
  maxOutputTokens?: number;
  responseMimeType?: string;
  responseSchema?: Record<string, any>;
};

function buildGenerationConfig(
  defaults: GeminiGenerationOptions,
  overrides?: GeminiGenerationOptions
) {
  return { ...defaults, ...(overrides ?? {}) };
}

/**
 * Call Gemini 1.5 Flash with a text prompt and optional generation config.
 */
export async function callGeminiWithConfig(
  prompt: string,
  options?: GeminiGenerationOptions
): Promise<string> {
  if (!GEMINI_KEY) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not set in .env");
  }

  const models = parseModelList(
    process.env.EXPO_PUBLIC_GEMINI_TEXT_MODELS,
    DEFAULT_TEXT_MODELS
  );

  return callGeminiWithModels(models, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: buildGenerationConfig(
      { 
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      },
      options
    ),
  });
}

/**
 * Call Gemini 1.5 Flash with a text prompt.
 */
export async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not set in .env");
  }

  const models = parseModelList(
    process.env.EXPO_PUBLIC_GEMINI_TEXT_MODELS,
    DEFAULT_TEXT_MODELS
  );
  return callGeminiWithModels(models, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
}

/**
 * Call Gemini Vision with a text prompt and base64 image.
 * For JSON responses, include responseMimeType: "application/json" in options.
 */
export async function callGeminiVision(
  prompt: string,
  base64Image: string,
  mimeType: string = "image/jpeg",
  options?: GeminiGenerationOptions
): Promise<string> {
  if (!GEMINI_KEY) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not set in .env");
  }

  const models = parseModelList(
    process.env.EXPO_PUBLIC_GEMINI_VISION_MODELS,
    DEFAULT_VISION_MODELS
  );

  const mergedConfig = buildGenerationConfig(
    { 
      maxOutputTokens: 2048,
      responseMimeType: "application/json"
    },
    options 
  );

  return callGeminiWithModels(models, {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: mergedConfig,
  });
}

export function buildCoachPrompt(payload: CoachInputPayload): string {
  return `
You are Axiom Coach, an AI carbon footprint advisor embedded in a mobile app.
You are not a general assistant. You only respond to topics related to:
carbon emissions, sustainability, daily habits, food, transport, energy, and behavior change.

Your role is to:
  1. Analyze a user's daily activity data.
  2. Identify their single biggest carbon mistake.
  3. Generate exactly 3 personalized, actionable suggestions.
  4. Predict their yearly carbon trajectory.
  5. Explain everything in plain, warm, non-judgmental language.

Tone rules:
- Encouraging, specific, brief. Never preachy. Never generic.
- Never say "Great job!" or "Well done!" — be direct and helpful.
- Always speak in second person: "you", "your".
- Never mention a CO2 number without context — always compare it to something.
- Output must always be valid JSON matching the exact schema below.
- Respond ONLY with the JSON object. No markdown. No explanation. No preamble.

== USER DATA ==
${JSON.stringify(payload, null, 2)}

== RESPONSE SCHEMA ==
{
  "biggestMistake": "<one sentence: specific activity that caused most CO2>",
  "suggestions": [
    "<actionable tip 1 with CO2 number>",
    "<actionable tip 2 with CO2 number>",
    "<actionable tip 3 with CO2 number>"
  ],
  "yearlyForecast": "<one sentence: yearly trajectory if habit continues>",
  "co2SavedIfFixed": <number: kg CO2 saved per month if top mistake fixed>
}

Rules:
- biggestMistake must name the specific activity ("car for 2.5 km trip" not "transport").
- Each suggestion must cover a different category if possible.
- co2SavedIfFixed must be a number, not a string.
- suggestions must contain exactly 3 items.
- Every suggestion must include a CO2 number (kg or %).
- Respond ONLY with the JSON object. No markdown. No explanation.
  `.trim();
}

export function buildForecastPrompt(
  avgDailyCo2: number,
  breakdown: object
): string {
  return `
You are a carbon footprint forecaster.
Given a user's 7-day average daily CO2 of ${avgDailyCo2} kg and this category breakdown:
${JSON.stringify(breakdown)}

Respond ONLY with this JSON:
{
  "yearlyTotalKg": <number>,
  "comparedToAvg": "<sentence vs EU average of 4t/year>",
  "topChange": "<the one habit change with the most yearly impact>",
  "reductionIfFixed": <number: kg per year saved if top change made>,
  "narrative": "<2 sentences: current trajectory + what changes with one fix>"
}
  `.trim();
}

/**
 * Parse a JSON response from Gemini (it often wraps JSON in markdown code fences).
 * Handles common variations and formatting issues.
 */
export function parseGeminiJson<T>(raw: string): T {
  if (!raw || typeof raw !== "string") {
    throw new Error("Gemini returned an empty or invalid response");
  }

  // Strip markdown code fences if present
  let cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // If it starts with text like "Here's the JSON:" or similar, extract JSON portion
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const extracted = extractJson(cleaned);
    if (extracted) {
      cleaned = extracted;
    }
  }

  if (!cleaned) {
    throw new Error("Gemini returned an empty response after cleanup");
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (parseErr) {
    // Log the FULL raw string to the console to find the syntax error
    console.log("=== FULL FAILED JSON ===");
    console.log(cleaned);
    console.log("========================");
    
    // Try harder to extract valid JSON
    const extracted = extractJson(cleaned);
    if (!extracted) {
      throw new Error("Gemini response was not valid JSON. Check console for full string.");
    }
    try {
      return JSON.parse(extracted) as T;
    } catch {
      console.log("=== EXTRACTED JSON ALSO FAILED ===");
      console.log(extracted);
      console.log("===================================");
      throw new Error(`Invalid JSON extracted. Check console for details.`);
    }
  }
}

function extractJson(text: string): string | null {
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const start = [firstObj, firstArr].filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (start === undefined) return null;

  const openChar = text[start];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === openChar) depth++;
    if (ch === closeChar) depth--;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }
  return null;
}
