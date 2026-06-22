$code = @'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "crypto";
import { writeFileSchema, writeFileTool } from "./tools/write_file.js";
import { readFileSchema, readFileTool } from "./tools/read_file.js";
import { runCodeSchema, runCodeTool } from "./tools/run_code.js";
import { listFilesSchema, listFilesTool } from "./tools/list_files.js";
import { gmailSearchSchema, gmailSearchTool, gmailSendSchema, gmailDraftTool } from "./tools/google_gmail.js";
import { driveSearchSchema, driveSearchTool, driveReadSchema, driveReadTool } from "./tools/google_drive.js";
import { calendarListSchema, calendarListTool, calendarCreateSchema, calendarCreateTool } from "./tools/google_calendar.js";
import { memSearchSchema, memSearchTool, memCreateSchema, memCreateTool } from "./tools/google_mem.js";
const server = new McpServer({ name: "mcp-server-starter", version: "0.2.0" });
server.tool("write_file", "Write a file to the workspace", writeFileSchema, writeFileTool);
server.tool("read_file", "Read a file from the workspace", readFileSchema, readFileTool);
server.tool("list_files", "List files in the workspace", listFilesSchema, listFilesTool);
server.tool("run_code", "Execute a JS or Python code snippet", runCodeSchema, runCodeTool);
server.tool("gmail_search", "Search Gmail threads", gmailSearchSchema, gmailSearchTool);
server.tool("gmail_draft", "Create a Gmail draft (does NOT send - requires Braley auth)", gmailSendSchema, gmailDraftTool);
server.tool("drive_search", "Search Google Drive files", driveSearchSchema, driveSearchTool);
server.tool("drive_read", "Read a Google Drive file", driveReadSchema, driveReadTool);
server.tool("calendar_list", "List Google Calendar events", calendarListSchema, calendarListTool);
server.tool("calendar_create", "Create a calendar event (confirm with Braley first)", calendarCreateSchema, calendarCreateTool);
server.tool("mem_search", "Search notes in Mem", memSearchSchema, memSearchTool);
server.tool("mem_create", "Create a new note in Mem", memCreateSchema, memCreateTool);
const isCloud = process.env.MCP_TRANSPORT === "http";
if (isCloud) {
  const port = parseInt(process.env.PORT || "3000");
  const app = express();
  app.use(express.json());
  const sessions = new Map();
  app.get("/health", (_req, res) => { res.json({ status: "ok", version: "0.2.0" }); });
  app.all("/mcp", async (req, res) => {
    console.log(`[MCP] ${req.method} - session: ${req.headers["mcp-session-id"] || "new"}`);
    try {
      const sessionId = req.headers["mcp-session-id"];
      let transport;
      if (sessionId && sessions.has(sessionId)) {
        transport = sessions.get(sessionId);
      } else {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => { sessions.set(id, transport); console.log(`[MCP] Session started: ${id}`); },
        });
        transport.onclose = () => { if (transport.sessionId) { sessions.delete(transport.sessionId); } };
        await server.connect(transport);
      }
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("[MCP] Error:", err);
      if (!res.headersSent) { res.status(500).json({ error: String(err) }); }
    }
  });
  app.listen(port, "0.0.0.0", () => { console.log(`MCP server running on HTTP port ${port}`); });
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio (local dev)");
}
'@
Set-Content -Path src\index.ts -Value $code
git add src\index.ts
git commit -m "fix: proper session management for MCP handshake"
git push