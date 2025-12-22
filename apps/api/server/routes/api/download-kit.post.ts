
import { defineEventHandler, readBody, sendStream, setHeader } from "h3";
import archiver from "archiver";
import { Readable } from "stream";
import { promises as fs } from "fs";
import { resolve } from "path";
import type { PageConfig, ProjectConfig, Stack } from "@minions/shared";
import { generateProjectFiles } from "~/domain/scaffolder/index";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { config, stack } = body as { config: PageConfig | ProjectConfig; stack: Stack };
  
  // Create archive
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  // Set headers for download
  setHeader(event, "Content-Type", "application/zip");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="starter-kit-${stack}-${config.meta?.seed || "seed"}.zip"`
  );

  // Generate Files using Shared Logic
  const files = await generateProjectFiles(config, stack);

  // Append to Archive
  for (const file of files) {
    archive.append(file.content, { name: file.name });
  }

  archive.finalize();

  return sendStream(event, archive);
});
