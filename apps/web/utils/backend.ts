import type { PageConfig, ProjectConfig } from "@minions/shared";

export const resolveWordpressConfig = (config: PageConfig | ProjectConfig) => {
  return config.backend?.wordpress;
};
