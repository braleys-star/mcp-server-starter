import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

// File tools
import { writeFileSchema, writeFileTool } from "./tools/write_file.js";
import { readFileSchema, readFileTool } from "./tools/read_file.js";
import { runCodeSchema, runCodeTool } from "./tools/run_code.js";
import { listFilesSchema, listFilesTool } from "./tools/list_files.js";

// Google + Mem tools
import { gmailSearchSchema, gmailSearchTool, gmailSendSchema, gmailDraftTool } from "./tools/google_gmail.js";
import { driveSearchSchema, driveSearchTool, driveReadSchema, driveReadTool } from "./tools/google_drive.js";
import { calendarListSchema, calendarListTool, calendarCreateSchema, calendarCreateTool } from "./tools/google_calendar.js";
import { memSearchSchema, memSearchTool, memCreateSchema, memCreateTool } from "./tools/google_mem.js";

const server = new McpServer({
  name: "mcp-server-starter",
  version: "0.2.0",
});

// --- File tools ---
server.tool("write_file", "Write a file to the workspace", writeFileSchema, writeFileTool);
server.tool("read_file", "Read a file from the workspace", readFileSchema, readFileTool);
server.tool("list_files", "List files in the workspace", listFilesSchema, listFilesTool);
server.tool("run_code", "Execute a JS or Python code snippet", runCodeSchema, runCodeTool);

// --- Gmail ---
server.tool("gmail_search", "Search Gmail threads", gmailSearchSchema, gmailSearchTool);
server.tool("gmail_draft", "Create a Gmail draft (does NOT send — requires Braley auth)", gmailSendSchema, gmailDraftTool);

// --- Google Drive ---
server.tool("drive_search", "Search Google Drive files", driveSearchSchema, driveSearchTool);
server.tool("drive_read", "Read a Google Drive file", driveReadSchema, driveReadTool);

// --- Google Calendar ---
server.tool("calendar_list", "List Google Calendar events", calendarListSchema, calendarListTool);
server.tool("calendar_create", "Create a calendar event (confirm with Braley first)", calendarCreateSchema, calendarCreateTool);

// --- Mem ---
server.tool("mem_search", "Search notes in Mem", memSearchSchema, memSearchTool);
server.tool("mem_create", "Create a new note in Mem", memCreateSchema, memCreateTool);

// --- Transport ---
const isCloud = process.env.MCP_TRANSPORT === "http";

if (isCloud) {
  const port = parseInt(process.env.PORT || "3000");
  const app = express();

  // Health check endpoint for Railway
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: "0.2.0" });
  });

  // Create the StreamableHTTP transport (no port option — it's a request handler)
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  // Mount the MCP transport handler at /mcp
  app.all("/mcp", async (req, res) => {
    await transport.handleRequest(req, res);
  });

  await server.connect(transport);

  app.listen(port, "0.0.0.0", () => {
    console.log(`MCP server running on HTTP port ${port}`);
  });
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio (local dev)");
}
