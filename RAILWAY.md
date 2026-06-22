# Railway Deployment Guide

## One-time setup

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial mcp server setup"
git remote add origin https://github.com/YOUR_USERNAME/mcp-server-starter.git
git push -u origin main
```

### 2. Deploy to Railway
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo
3. Railway auto-detects the Dockerfile and builds it

### 3. Set environment variables in Railway dashboard
| Variable | Value |
|---|---|
| `MCP_TRANSPORT` | `http` |
| `PORT` | `3000` |
| `MCP_AUTH_TOKEN` | (generate a strong random string) |

### 4. Get your Railway URL
Railway gives you a public URL like:
`https://mcp-server-starter-production.up.railway.app`

### 5. Update your .mcp.json for cloud access
```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "type": "url",
      "url": "https://YOUR-APP.up.railway.app"
    }
  }
}
```

## Health check
Railway pings `/health` — returns `{ "status": "ok", "version": "0.2.0" }`

## Local dev vs Cloud
| Mode | Command | Transport |
|---|---|---|
| Local | `npm run dev` | stdio |
| Cloud | Railway auto-starts | HTTP |
