import { z } from "zod";

const CALENDAR_MCP_URL = "https://calendarmcp.googleapis.com/mcp/v1";

export const calendarListSchema = {
  time_min: z.string().optional().describe("Start time ISO string, e.g. 2026-06-01T00:00:00Z"),
  time_max: z.string().optional().describe("End time ISO string"),
  max_results: z.number().optional().default(10).describe("Max events to return"),
};

export const calendarCreateSchema = {
  summary: z.string().describe("Event title"),
  start: z.string().describe("Start datetime ISO string"),
  end: z.string().describe("End datetime ISO string"),
  description: z.string().optional().describe("Event description"),
};

// List upcoming calendar events
export async function calendarListTool({
  time_min,
  time_max,
  max_results,
}: {
  time_min?: string;
  time_max?: string;
  max_results?: number;
}) {
  const response = await fetch(`${CALENDAR_MCP_URL}/tools/list_events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: time_min, timeMax: time_max, maxResults: max_results }),
  });

  if (!response.ok) {
    throw new Error(`Calendar list failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// Create calendar event — requires Braley authorization before calling
export async function calendarCreateTool({
  summary,
  start,
  end,
  description,
}: {
  summary: string;
  start: string;
  end: string;
  description?: string;
}) {
  const response = await fetch(`${CALENDAR_MCP_URL}/tools/create_event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summary, start: { dateTime: start }, end: { dateTime: end }, description }),
  });

  if (!response.ok) {
    throw new Error(`Calendar create failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [
      {
        type: "text" as const,
        text: `📅 Event created — confirm with Braley before any further calendar changes.\n\n${JSON.stringify(data, null, 2)}`,
      },
    ],
  };
}
