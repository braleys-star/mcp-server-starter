typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

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

const app = express();
const port = parseInt(process.env.PORT || "3000");
const transports: Record<string, SSEServerTransport> = {};

app.get("/health", (_req, res) => {
res.json({ status: "ok", version: "0.2.0" });
});

app.get("/sse", async (_req, res) => {
const transport = new SSEServerTransport("/messages", res);
transports[transport.sessionId] = transport;
transport.onclose = () => { delete transports[transport.sessionId]; };
await server.connect(transport);
});

app.post("/messages", async (req, res) => {
const sessionId = req.query.sessionId as string;
const transport = transports[sessionId];
if (!transport) { res.status(404).json({ error: "Session not found" }); return; }
await transport.handlePostMessage(req, res);
});

app.listen(port, "0.0.0.0", () => {
console.log(`MCP server running on HTTP port ${port}`);
});
```







