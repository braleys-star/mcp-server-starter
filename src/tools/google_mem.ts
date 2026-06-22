import { z } from "zod";

const MEM_MCP_URL = "https://mcp.mem.ai/mcp";

export const memSearchSchema = {
  query: z.string().describe("Search query to find notes in Mem"),
};

export const memCreateSchema = {
  content: z.string().describe("Note content to save to Mem"),
};

// Search Mem notes
export async function memSearchTool({ query }: { query: string }) {
  const response = await fetch(`${MEM_MCP_URL}/tools/search_notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Mem search failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// Create a Mem note
export async function memCreateTool({ content }: { content: string }) {
  const response = await fetch(`${MEM_MCP_URL}/tools/create_note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(`Mem create failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [{ type: "text" as const, text: `📝 Note saved to Mem.\n\n${JSON.stringify(data, null, 2)}` }],
  };
}
