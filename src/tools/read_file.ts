import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const SAFE_DIR = path.resolve("./workspace");

export const readFileSchema = {
  filename: z.string().describe("Relative filename to read, e.g. src/app.js"),
};

export async function readFileTool({ filename }: { filename: string }) {
  const targetPath = path.resolve(SAFE_DIR, filename);
  if (!targetPath.startsWith(SAFE_DIR)) {
    throw new Error("Access denied: path outside workspace");
  }

  const content = await fs.readFile(targetPath, "utf-8");

  return {
    content: [
      {
        type: "text" as const,
        text: content,
      },
    ],
  };
}
