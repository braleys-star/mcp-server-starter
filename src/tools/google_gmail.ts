import { z } from "zod";

const GMAIL_MCP_URL = "https://gmailmcp.googleapis.com/mcp/v1";

export const gmailSearchSchema = {
  query: z.string().describe("Gmail search query, e.g. 'from:boss@company.com is:unread'"),
  max_results: z.number().optional().default(10).describe("Max emails to return"),
};

export const gmailSendSchema = {
  to: z.string().describe("Recipient email address"),
  subject: z.string().describe("Email subject line"),
  body: z.string().describe("Email body content"),
};

// Search emails via Gmail MCP
export async function gmailSearchTool({
  query,
  max_results,
}: {
  query: string;
  max_results?: number;
}) {
  const response = await fetch(`${GMAIL_MCP_URL}/tools/search_threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, maxResults: max_results }),
  });

  if (!response.ok) {
    throw new Error(`Gmail search failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// Draft email — NEVER sends without Braley's explicit authorization
export async function gmailDraftTool({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const response = await fetch(`${GMAIL_MCP_URL}/tools/create_draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, body }),
  });

  if (!response.ok) {
    throw new Error(`Gmail draft failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [
      {
        type: "text" as const,
        text: `📧 Draft created (NOT sent) — awaiting Braley's authorization to send.\n\n${JSON.stringify(data, null, 2)}`,
      },
    ],
  };
}
