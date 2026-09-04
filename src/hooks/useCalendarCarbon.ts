/**
 * useCalendarCarbon — Axiom
 *
 * Fetches TODAY's Google Calendar events via private ICS URL (no OAuth required),
 * sends them to Gemini for CO₂ travel analysis, and lets the user add individual
 * event emissions to today's daily score in Firestore.
 *
 * HOW TO GET YOUR ICS URL:
 *   Google Calendar → Settings → [your calendar] → "Secret address in iCal format"
 */
import { useState, useCallback } from "react";
import { fetchEventsFromIcsUrl, CalendarEvent } from "../services/googleCalendar";
import { callGeminiWithConfig, parseGeminiJson } from "../services/gemini";
import { getDailyScore, saveDailyScore } from "../services/firebase";
import type { CalendarEventAnalysis } from "../types/gemini";

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTime(iso: string): string {
  if (!iso.includes("T")) return "All day";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildCalendarPrompt(events: CalendarEvent[]): string {
  const lines = events.map((e) => {
    const start = formatTime(e.start);
    const end   = formatTime(e.end);
    const loc   = e.location ? `at ${e.location}` : "(no location / online)";
    return `- ID:${e.id} | "${e.summary}" ${loc} | ${start}–${end}`;
  });

  return `You are a carbon footprint AI. Analyze these calendar events for TODAY and estimate the CO₂ emitted from travel to each event.

TODAY'S EVENTS:
${lines.join("\n")}

Rules:
- If an event has no location, or the title/description suggests it is online (Zoom, Teams, Meet, Call, Virtual), set travelMode to "online", estimatedDistanceKm to 0, and co2Kg to 0.03 (device electricity).
- For physical locations assume a typical urban commute (5–20 km round trip).
- CO₂ factors: car = 0.21 kg/km, bus = 0.089 kg/km, train = 0.041 kg/km, cycling/walking = 0.
- suggestion must be a concrete tip (e.g. "Take the metro to save 0.8 kg CO₂") or null if the event is already low-emission or online.
- Respond ONLY with a valid JSON array. No markdown. No explanation. No extra text.

JSON schema (one object per event, in the same order as the events above):
[
  {
    "eventId": "<exact event ID from the input>",
    "title": "<event title>",
    "travelMode": "car | bus | train | cycling | walking | online",
    "estimatedDistanceKm": <number>,
    "co2Kg": <number>,
    "suggestion": "<string or null>"
  }
]`;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface CalendarEventWithAnalysis {
  event: CalendarEvent;
  analysis: CalendarEventAnalysis | null;
  formattedTime: string;
}

export function useCalendarCarbon(userId?: string) {
  const [events,   setEvents]   = useState<CalendarEvent[]>([]);
  const [analyses, setAnalyses] = useState<CalendarEventAnalysis[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [isLoading,   setIsLoading]   = useState(false);
  const [isAdding,    setIsAdding]    = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // ── Fetch + analyse from ICS URL ─────────────────────────────────────────────

  const analyzeFromIcsUrl = useCallback(async (icsUrl: string) => {
    if (!icsUrl.trim()) {
      setError("Please paste your private Google Calendar ICS URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsConnected(false);

    try {
      // 1. Fetch today's events from private ICS URL
      const todayEvents = await fetchEventsFromIcsUrl(icsUrl.trim());
      setEvents(todayEvents);
      setIsConnected(true);

      if (todayEvents.length === 0) {
        setAnalyses([]);
        return;
      }

      // 2. Gemini analysis
      const prompt = buildCalendarPrompt(todayEvents);
      const raw    = await callGeminiWithConfig(prompt, {
        responseMimeType: "application/json",
        maxOutputTokens: 1024,
      });

      const parsed = parseGeminiJson<CalendarEventAnalysis[]>(raw);

      // Guarantee all events have an analysis entry (fill gaps with 0)
      const safeAnalyses: CalendarEventAnalysis[] = todayEvents.map((ev) => {
        const found = parsed.find(
          (a) => a.eventId === ev.id || a.title?.toLowerCase() === ev.summary?.toLowerCase()
        );
        return found ?? {
          eventId: ev.id,
          title: ev.summary,
          travelMode: "unknown",
          estimatedDistanceKm: 0,
          co2Kg: 0,
          suggestion: undefined,
        };
      });

      setAnalyses(safeAnalyses);
    } catch (err) {
      console.error("[useCalendarCarbon]", err);
      setError(err instanceof Error ? err.message : "Failed to analyse calendar");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Add one event's CO₂ to today's daily score ───────────────────────────────

  const addEventToEmissions = useCallback(
    async (eventId: string, co2Kg: number) => {
      if (!userId || addedIds.has(eventId)) return;
      setIsAdding(eventId);
      try {
        const today   = todayDateString();
        const current = await getDailyScore(userId, today);
        await saveDailyScore(userId, today, {
          totalCo2Kg: (current?.totalCo2Kg ?? 0) + co2Kg,
          breakdown: {
            transport: (current?.breakdown?.transport ?? 0) + co2Kg,
            food:      current?.breakdown?.food      ?? 0,
            energy:    current?.breakdown?.energy    ?? 0,
            shopping:  current?.breakdown?.shopping  ?? 0,
          },
        });
        setAddedIds((prev) => new Set([...prev, eventId]));
      } catch (err) {
        console.error("[useCalendarCarbon] addEventToEmissions:", err);
      } finally {
        setIsAdding(null);
      }
    },
    [userId, addedIds]
  );

  // ── Derived: merged list ─────────────────────────────────────────────────────

  const merged: CalendarEventWithAnalysis[] = events.map((ev) => ({
    event:         ev,
    analysis:      analyses.find((a) => a.eventId === ev.id) ?? null,
    formattedTime: formatTime(ev.start) === "All day"
      ? "All day"
      : `${formatTime(ev.start)} – ${formatTime(ev.end)}`,
  }));

  const totalCo2Today = analyses.reduce((sum, a) => sum + (a.co2Kg ?? 0), 0);

  return {
    merged,
    totalCo2Today,
    addedIds,
    isLoading,
    isAdding,
    error,
    isConnected,
    analyzeFromIcsUrl,
    addEventToEmissions,
  };
}
