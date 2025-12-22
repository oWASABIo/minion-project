export type PromptDirectives = {
  site?: { siteName?: string; tagline?: string; primaryColor?: string };
  style?: { tone?: string; language?: string; keywords?: string };
  content?: Record<string, string>;
  wordpress?: { baseUrl?: string; restBase?: string; postsEndpoint?: string };
  config?: { seed?: number };
};

type ParseResult = { cleanBrief: string; directives: PromptDirectives };

const KNOWN_BLOCKS = new Set(["site", "style", "content", "wordpress", "config"]);

function setNested(
  d: PromptDirectives,
  block: string,
  key: string,
  value: string
) {
  const v = value.trim();
  if (!v) return;

  if (block === "site") {
    d.site ||= {};
    if (key === "siteName") d.site.siteName = v;
    if (key === "tagline") d.site.tagline = v;
    if (key === "primaryColor") d.site.primaryColor = v;
    return;
  }

  if (block === "style") {
    d.style ||= {};
    if (key === "tone") d.style.tone = v;
    if (key === "language") d.style.language = v;
    if (key === "keywords") d.style.keywords = v;
    return;
  }

  if (block === "wordpress") {
    d.wordpress ||= {};
    if (key === "baseUrl") d.wordpress.baseUrl = v;
    if (key === "restBase") d.wordpress.restBase = v;
    if (key === "postsEndpoint") d.wordpress.postsEndpoint = v;
    return;
  }

  if (block === "config") {
    d.config ||= {};
    if (key === "seed") {
      const n = parseInt(v, 10);
      if (!isNaN(n)) d.config.seed = n;
    }
    return;
  }

  // content: keep as a flat map (hero.headline, cta.primary.label, etc.)
  if (block === "content") {
    d.content ||= {};
    d.content[key] = v;
  }
}

export function parsePromptPattern(input: string): ParseResult {
  const text = (input || "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  const directives: PromptDirectives = {};
  const free: string[] = [];

  let currentBlock: string | null = null;

  for (const rawLine of lines) {
    // 1. Strip comments (// ...) and trim
    let line = rawLine.split("//")[0].trim();
    if (!line) continue;

    // detect [block]
    const m = line.match(/^\[([a-zA-Z0-9_-]+)\]$/);
    if (m) {
      const name = m[1].toLowerCase();
      currentBlock = KNOWN_BLOCKS.has(name) ? name : null;
      continue;
    }

    // inside known block: parse key: value
    if (currentBlock) {
      // split only on first colon
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      
      setNested(directives, currentBlock, key, value);
      continue;
    }

    // outside blocks → free brief (keep original line if it wasn't a directive)
    // Actually, we stripped comments so we might lose context if brief uses //? 
    // Usually brief is strictly text. Let's assume brief shouldn't have config comments.
    free.push(line);
  }

  const cleanBrief = free.join("\n").trim();
  return { cleanBrief, directives };
}
