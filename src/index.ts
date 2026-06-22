import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "http";

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

  // Health check server
  const healthServer = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", version: "0.2.0" }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  healthServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // MCP over HTTP — attach to existing http server
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  healthServer.on("request", (req, res) => {
    if (req.url === "/mcp") {
      transport.handleRequest(req, res);
    }
  });

  await server.connect(transport);
  console.log(`MCP server running on HTTP port ${port}`);
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio (local dev)");
}
