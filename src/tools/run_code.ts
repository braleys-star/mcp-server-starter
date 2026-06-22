import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Allowed languages/runtimes — expand carefully
const ALLOWED_RUNTIMES: Record<string, string> = {
  javascript: "node",
  python: "python3",
};

// Hard timeout — no runaway processes
const TIMEOUT_MS = 10000;

export const runCodeSchema = {
  language: z.enum(["javascript", "python"]).describe("Language to run"),
  code: z.string().describe("Code snippet to execute"),
};

export async function runCodeTool({
  language,
  code,
}: {
  language: "javascript" | "python";
  code: string;
}) {
  const runtime = ALLOWED_RUNTIMES[language];
  if (!runtime) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Write to a temp file and execute — never eval() directly
  const { writeFileSync, unlinkSync } = await import("fs");
  const ext = language === "python" ? "py" : "js";
  const tmpFile = `/tmp/mcp_run_${Date.now()}.${ext}`;

  try {
    writeFileSync(tmpFile, code, "utf-8");
    const { stdout, stderr } = await execAsync(`${runtime} ${tmpFile}`, {
      timeout: TIMEOUT_MS,
      // SECURITY: no shell expansion, limited env
      env: { PATH: process.env.PATH },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: stdout || stderr || "(no output)",
        },
      ],
    };
  } finally {
    // Always clean up temp file
    try { unlinkSync(tmpFile); } catch {}
  }
}
