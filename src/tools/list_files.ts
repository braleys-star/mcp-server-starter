import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const SAFE_DIR = path.resolve("./workspace");

export const listFilesSchema = {
  subdir: z.string().optional().describe("Optional subdirectory to list"),
};

export async function listFilesTool({ subdir = "" }: { subdir?: string }) {
  const targetPath = path.resolve(SAFE_DIR, subdir);
  if (!targetPath.startsWith(SAFE_DIR)) {
    throw new Error("Access denied: path outside workspace");
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const list = entries.map((e) => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`).join("\n");

  return {
    content: [
      {
        type: "text" as const,
        text: list || "(empty directory)",
      },
    ],
  };
}
