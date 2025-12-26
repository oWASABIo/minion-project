import JSZip from "jszip";
import type { PageConfig, ProjectConfig, Stack } from "@minions/shared";
import { generateProjectFiles } from "./index";

export class ScaffoldService {
  /**
   * Generates a project ZIP archive.
   */
  async createProjectZip(
    config: PageConfig | ProjectConfig,
    stack: Stack = "nuxt"
  ): Promise<{ content: Buffer; filename: string }> {
    const zip = new JSZip();

    // 1. Generate Files
    const files = await generateProjectFiles(config, stack);

    // 2. Append to Archive
    for (const file of files) {
      zip.file(file.name, file.content);
    }

    // 3. Generate ZIP content
    const content = await zip.generateAsync({ type: "nodebuffer" });

    // 4. Sanitize site name for filename
    const siteName = (config as any).site?.siteName || "minions-project";
    const safeName = siteName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    return {
      content,
      filename: `${safeName}-${stack}.zip`,
    };
  }
}
