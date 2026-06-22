import { z } from "zod";

const DRIVE_MCP_URL = "https://drivemcp.googleapis.com/mcp/v1";

export const driveSearchSchema = {
  query: z.string().describe("Search query for Drive files, e.g. 'name contains budget'"),
  max_results: z.number().optional().default(10).describe("Max files to return"),
};

export const driveReadSchema = {
  file_id: z.string().describe("Google Drive file ID to read"),
};

// Search Drive files
export async function driveSearchTool({
  query,
  max_results,
}: {
  query: string;
  max_results?: number;
}) {
  const response = await fetch(`${DRIVE_MCP_URL}/tools/search_files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, maxResults: max_results }),
  });

  if (!response.ok) {
    throw new Error(`Drive search failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// Read a Drive file
export async function driveReadTool({ file_id }: { file_id: string }) {
  const response = await fetch(`${DRIVE_MCP_URL}/tools/read_file_content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId: file_id }),
  });

  if (!response.ok) {
    throw new Error(`Drive read failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
