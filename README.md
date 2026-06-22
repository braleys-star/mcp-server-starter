# MCP Server Starter

## Setup
```bash
npm install
npm run dev      # runs with hot reload via tsx
npm run build    # compiles to dist/
npm start        # runs compiled version
```

## Structure
```
mcp-server-starter/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts        # server entry point + transport
    └── tools/           # add individual tool files here as it grows
```

## Security checklist before this touches real code execution
- [ ] Lock SAFE_DIR to an actual sandboxed path (not your full filesystem)
- [ ] Add path traversal validation (no `../../etc/passwd` shenanigans)
- [ ] Add auth if this ever runs as a remote/HTTP server instead of stdio
- [ ] Rate limit / confirm-before-execute for anything destructive
- [ ] Separate "read" tools from "write/execute" tools — different risk tiers

## Next steps
- Wire this into VS Code via Remote-SSH if hosting on a cloud box
- Add a `run_code` tool (sandboxed — Docker container recommended)
- ✅ `.mcp.json` added — VS Code will auto-detect and offer to launch the server

## .mcp.json
This file tells VS Code (or any MCP-aware client) how to start the server —
runs it via `npx tsx src/index.ts` straight from your workspace folder, no
build step needed for local dev. Once you trust the server, VS Code will
launch it automatically when the workspace opens.
# SSE transport
