import { defineEventHandler, readBody, setHeader } from "h3";
import type { PageConfig, ProjectConfig, Stack } from "@minions/shared";
import { ScaffoldService } from "~/domain/scaffolder/ScaffoldService";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { config, stack } = body as {
    config: PageConfig | ProjectConfig;
    stack: Stack;
  };

  const scaffoldService = new ScaffoldService();
  const { content, filename } = await scaffoldService.createProjectZip(
    config,
    stack
  );

  // Set headers for download
  setHeader(event, "Content-Type", "application/zip");
  setHeader(event, "Content-Disposition", `attachment; filename="${filename}"`);

  return content;
});
