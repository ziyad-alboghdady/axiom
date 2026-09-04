/**
 * Google Calendar Service — Axiom
 *
 * Primary: Private ICS URL approach (no OAuth required).
 * Google Calendar → Settings → [calendar] → "Secret address in iCal format"
 *
 * Legacy OAuth functions kept for reference but not used in the main flow.
 */

/**
 * Fetch upcoming calendar events using a valid access token.
 * This function uses plain fetch() — works in Expo Go.
 */
export interface CalendarEvent {
  id: string;
  summary: string;
  location?: string;
  start: string;
  end: string;
  description?: string;
}

/**
 * Fetch only TODAY's calendar events (midnight → 23:59:59 local time).
 * Much cheaper on Gemini — only sends the day's events, not the whole future.
 */
export async function fetchTodayEvents(
  accessToken: string
): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
    `?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}` +
    `&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);

  const data = await res.json();
  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    summary: item.summary ?? "Untitled",
    location: item.location,
    start: item.start?.dateTime ?? item.start?.date ?? "",
    end: item.end?.dateTime ?? item.end?.date ?? "",
    description: item.description,
  }));
}

// ── ICS private URL (no OAuth) ────────────────────────────────────────────────

/**
 * Parse an ICS string and return only TODAY's events as CalendarEvent[].
 * Handles multi-line folded properties (RFC 5545 §3.1).
 */
function parseIcsToday(icsText: string): CalendarEvent[] {
  // Unfold: lines folded with CRLF/LF + whitespace
  const unfolded = icsText.replace(/\r?\n[ \t]/g, "");

  const events: CalendarEvent[] = [];
  const blocks = unfolded.split("BEGIN:VEVENT");
  // skip index 0 (calendar header)
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];

    const get = (key: string): string => {
      // Match "KEY:" or "KEY;params:"
      const match = block.match(new RegExp(`(?:^|\n)${key}(?:;[^\n:]*)?:([^\n]*)`, "i"));
      return match ? match[1].trim() : "";
    };

    // Dates can be VALUE=DATE (all-day) or full dateTime
    const rawStart = get("DTSTART");
    const rawEnd   = get("DTEND") || get("DTSTART");

    const toIso = (raw: string): string => {
      if (!raw) return "";
      if (raw.length === 8) {
        // DATE only: YYYYMMDD
        return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      }
      // DATE-TIME: YYYYMMDDTHHMMSS[Z]
      const y = raw.slice(0, 4), mo = raw.slice(4, 6), d = raw.slice(6, 8);
      const h = raw.slice(9, 11), mi = raw.slice(11, 13), s = raw.slice(13, 15);
      const utc = raw.endsWith("Z") ? "Z" : "";
      return `${y}-${mo}-${d}T${h}:${mi}:${s}${utc}`;
    };

    const isoStart = toIso(rawStart);
    const isoEnd   = toIso(rawEnd);

    // Filter to TODAY only
    const today = new Date().toISOString().slice(0, 10);
    const eventDate = isoStart.slice(0, 10);
    if (eventDate !== today) continue;

    // Skip cancelled events
    const status = get("STATUS");
    if (status.toUpperCase() === "CANCELLED") continue;

    const uid      = get("UID") || `ics-${i}`;
    const summary  = get("SUMMARY").replace(/\\,/g, ",").replace(/\\n/g, " ").replace(/\\;/g, ";");
    const location = get("LOCATION").replace(/\\,/g, ",").replace(/\\n/g, " ");
    const description = get("DESCRIPTION").replace(/\\n/g, " ").replace(/\\,/g, ",");

    events.push({
      id: uid,
      summary: summary || "Untitled",
      location: location || undefined,
      start: isoStart,
      end: isoEnd,
      description: description || undefined,
    });
  }

  return events;
}

/**
 * Fetch today's events from a Google Calendar private ICS URL.
 * The URL looks like: https://calendar.google.com/calendar/ical/...%40group.calendar.google.com/private-xxxx/basic.ics
 *
 * No OAuth needed — the URL itself is the secret.
 */
export async function fetchEventsFromIcsUrl(icsUrl: string): Promise<CalendarEvent[]> {
  const res = await fetch(icsUrl);
  if (!res.ok) throw new Error(`ICS fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  if (!text.includes("BEGIN:VCALENDAR")) {
    throw new Error("URL did not return a valid ICS calendar. Check that you copied the correct secret address.");
  }
  return parseIcsToday(text);
}

// ── Legacy OAuth (kept but not used in main flow) ─────────────────────────────

export async function fetchCalendarEvents(
  accessToken: string,
  maxResults: number = 20
): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults}&timeMin=${now}&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Calendar API error: ${res.status}`);
  }

  const data = await res.json();

  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    summary: item.summary ?? "Untitled",
    location: item.location,
    start: item.start?.dateTime ?? item.start?.date ?? "",
    end: item.end?.dateTime ?? item.end?.date ?? "",
    description: item.description,
  }));
}
