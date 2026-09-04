/**
 * useFoodAnalyzer — Axiom
 *
 * Photo upload + Gemini Vision for food CO₂ analysis.
 */
import { useState, useCallback } from "react";
import { callGeminiVision, parseGeminiJson } from "../services/gemini";
import type { FoodAnalysis } from "../types/gemini";

export function useFoodAnalyzer() {
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const analyzePhoto = useCallback(async (imageBase64: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Safety Check: Strip the data URI prefix if Expo included it
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      // 2. Simplified Prompt: Let the schema handle the formatting.
      const prompt = `Analyze this food photo and identify every food item visible. 
For each item, estimate the CO₂ emissions in kg based on standard emission factors.
Ensure all CO2 values are realistic. The healthRating must strictly be "good", "moderate", or "poor".
Provide a brief, actionable suggestion for a lower-carbon alternative.`;

      const raw = await callGeminiVision(prompt, cleanBase64, "image/jpeg", {
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
        responseSchema: {
          type: "OBJECT",
          properties: {
            foodItems: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  quantity: { type: "STRING" },
                  co2Kg: { type: "NUMBER" }
                }
              }
            },
            totalCo2Kg: { type: "NUMBER" },
            healthRating: { type: "STRING" }, 
            suggestion: { type: "STRING" }
          },
          required: ["foodItems", "totalCo2Kg", "healthRating", "suggestion"] 
        }
      });
      
      const parsed = parseGeminiJson<FoodAnalysis>(raw);
      
      if (!parsed.foodItems || !Array.isArray(parsed.foodItems)) {
        throw new Error("Invalid response: missing foodItems array");
      }
      
      setAnalysis(parsed);
      return parsed;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze food photo";
      setError(errorMsg);
      console.error("Food analysis error:", errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return { analysis, isLoading, error, analyzePhoto, reset };
}
