import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// Scoped safe directory — change this to your actual workspace path
const SAFE_DIR = path.resolve("./workspace");

export const writeFileSchema = {
  filename: z.string().describe("Relative filename, e.g. src/app.js"),
  content: z.string().describe("Full file content to write"),
};

export async function writeFileTool({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) {
  // Security: prevent path traversal attacks
  const targetPath = path.resolve(SAFE_DIR, filename);
  if (!targetPath.startsWith(SAFE_DIR)) {
    throw new Error("Access denied: path outside workspace");
  }

  // Ensure directory exists
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf-8");

  return {
    content: [
      {
        type: "text" as const,
        text: `✅ Written: ${filename} (${content.length} chars)`,
      },
    ],
  };
}
