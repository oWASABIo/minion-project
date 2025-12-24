import { defineEventHandler, readBody, setHeader } from "h3";
import JSZip from "jszip";
import type { PageConfig, ProjectConfig, Stack } from "@minions/shared";
import { generateProjectFiles } from "~/domain/scaffolder/index";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { config, stack } = body as {
    config: PageConfig | ProjectConfig;
    stack: Stack;
  };

  // Create archive
  const zip = new JSZip();

  // Generate Files using Shared Logic
  const files = await generateProjectFiles(config, stack);

  // Append to Archive
  for (const file of files) {
    zip.file(file.name, file.content);
  }

  // Generate ZIP content
  const content = await zip.generateAsync({ type: "nodebuffer" });

  // Set headers for download
  setHeader(event, "Content-Type", "application/zip");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="starter-kit-${stack}-${
      config.meta?.seed || "seed"
    }.zip"`
  );

  return content;
});
