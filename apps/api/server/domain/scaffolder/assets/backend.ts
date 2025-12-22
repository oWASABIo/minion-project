import type { PageConfig, WordPressConfig } from "@minions/shared";

function normalizeUrl(input: string) {
  const v = (input || "").trim();
  if (!v) return "";
  try {
    return new URL(v).toString().replace(/\/$/, "");
  } catch {
    return v.replace(/\/$/, "");
  }
}

function normalizeRestBase(input?: string) {
  const v = (input || "").trim();
  if (!v) return "/wp-json/wp/v2";
  const withSlash = v.startsWith("/") ? v : `/${v}`;
  return withSlash.replace(/\/$/, "");
}

export function resolveWordpressConfig(
  config: PageConfig
): WordPressConfig | null {
  const wp = config.backend?.wordpress;
  const baseUrl = normalizeUrl(wp?.baseUrl || "");
  if (!baseUrl) return null;

  return {
    baseUrl,
    restBase: normalizeRestBase(wp?.restBase),
  };
}
