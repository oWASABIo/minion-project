import type { PageConfig } from "@minions/shared";

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isThai(text: string) {
  return /[\u0E00-\u0E7F]/.test(text);
}

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

function normalizeBrief(brief: string) {
  return brief.trim().replace(/\s+/g, " ");
}

function guessTone(briefLower: string) {
  const has = (k: string) => briefLower.includes(k);

  if (has("lux") || has("luxury") || has("พรีเมียม") || has("หรู"))
    return "luxury";
  if (has("minimal") || has("มินิมอล") || has("เรียบ")) return "minimal";
  if (has("playful") || has("สนุก") || has("สดใส")) return "playful";
  if (has("corporate") || has("องค์กร") || has("ทางการ")) return "corporate";
  if (
    has("tech") ||
    has("ai") ||
    has("saas") ||
    has("software") ||
    has("เทค") ||
    has("ซอฟต์แวร์")
  )
    return "tech";
  if (has("friendly") || has("เป็นกันเอง")) return "friendly";

  return "tech";
}

function toneToColor(tone: string) {
  switch (tone) {
    case "luxury":
      return "#D4AF37";
    case "minimal":
      return "#94A3B8";
    case "playful":
      return "#22C55E";
    case "corporate":
      return "#0EA5E9";
    case "friendly":
      return "#A855F7";
    case "tech":
    default:
      return "#4F46E5";
  }
}

function setIfExists(obj: any, key: string, value: any) {
  if (obj && typeof obj === "object" && key in obj) obj[key] = value;
}

function findFirstSection(config: any, type: string) {
  const secs = config?.sections;
  if (!Array.isArray(secs)) return null;
  return secs.find((s) => s?.type === type) ?? null;
}

function applyBriefToHero(
  hero: any,
  copy: { eyebrow?: string; headline?: string; sub?: string }
) {
  if (!hero) return;

  if (copy.eyebrow) {
    setIfExists(hero, "eyebrow", copy.eyebrow);
    setIfExists(hero, "kicker", copy.eyebrow);
  }

  if (copy.headline) {
    setIfExists(hero, "headline", copy.headline);
    setIfExists(hero, "heading", copy.headline);
    setIfExists(hero, "title", copy.headline);
  }

  if (copy.sub) {
    setIfExists(hero, "subheadline", copy.sub);
    setIfExists(hero, "subheading", copy.sub);
    setIfExists(hero, "description", copy.sub);
  }
}

function applyBriefToCta(cta: any, copy: { headline?: string; sub?: string }) {
  if (!cta) return;
  if (copy.headline) {
    setIfExists(cta, "headline", copy.headline);
    setIfExists(cta, "heading", copy.headline);
    setIfExists(cta, "title", copy.headline);
  }
  if (copy.sub) {
    setIfExists(cta, "subheadline", copy.sub);
    setIfExists(cta, "subheading", copy.sub);
    setIfExists(cta, "description", copy.sub);
  }
}

export function buildMockConfigFromTemplate(
  template: PageConfig,
  params: { template: string; brief: string }
): PageConfig {
  const brief = normalizeBrief(params.brief);
  const lower = brief.toLowerCase();
  const seed = hashString(`${params.template}::${lower}`);

  const thai = isThai(brief);
  const tone = guessTone(lower);
  const primaryColor = toneToColor(tone);

  const cfg: PageConfig = JSON.parse(JSON.stringify(template));

  (cfg as any).template = (params.template as any) ?? (cfg as any).template;

  if ((cfg as any).site && typeof (cfg as any).site === "object") {
    const nameBase = pick(
      thai
        ? ["เว็บไซต์ของคุณ", "แบรนด์ของคุณ", "บริษัทของคุณ", "โปรเจกต์ของคุณ"]
        : ["Your Website", "Your Brand", "Your Company", "Your Project"],
      seed
    );

    const tagline = pick(
      thai
        ? [
            "สร้างหน้าเว็บได้ไว • ปรับแต่งได้ • พร้อมใช้งาน",
            "โทนสวยตาม brief • โครงสร้างพร้อมต่อยอด",
            "Mock preview พร้อม — ใส่ API Key เมื่อไหร่ค่อยต่อ AI จริง",
          ]
        : [
            "Fast setup • Customizable • Ready to launch",
            "Brief-driven layout • Built to extend",
            "Mock preview is ready — connect AI when you add an API key",
          ],
      seed + 7
    );

    setIfExists((cfg as any).site, "siteName", `${nameBase} (mock)`);
    setIfExists((cfg as any).site, "tagline", tagline);
    setIfExists((cfg as any).site, "primaryColor", primaryColor);
  }

  const hero = findFirstSection(cfg as any, "hero");
  const heroCopy = thai
    ? {
        eyebrow: pick(
          ["NEW ERA", "AI-Powered", "Prototype Preview", "Brief → Layout"],
          seed + 1
        ),
        headline: pick(
          [
            "สร้างหน้าเว็บตาม brief ได้ในไม่กี่นาที",
            "โครงหน้าเว็บพร้อมใช้งาน แล้วค่อยต่อ AI จริง",
            "ได้ทั้งโทน สี และโครงสร้าง — ปรับต่อได้ทันที",
          ],
          seed + 2
        ),
        sub: pick(
          [
            `สรุป brief: “${brief.slice(0, 80)}${
              brief.length > 80 ? "…" : ""
            }”`,
            "ตอนนี้เป็นโหมด mock เพื่อให้เห็น Live Preview ก่อน — ใส่ API Key เมื่อพร้อม",
            "โครงนี้ออกแบบให้ต่อยอดเป็น codegen หรือ PaaS ได้ง่าย",
          ],
          seed + 3
        ),
      }
    : {
        eyebrow: pick(
          ["NEW ERA", "AI-Powered", "Prototype Preview", "Brief → Layout"],
          seed + 1
        ),
        headline: pick(
          [
            "Turn your brief into a landing page in minutes",
            "Preview the layout now — plug in AI later",
            "A clean, extensible layout generated from your brief",
          ],
          seed + 2
        ),
        sub: pick(
          [
            `Brief: “${brief.slice(0, 80)}${brief.length > 80 ? "…" : ""}”`,
            "Mock mode is enabled so you can iterate on UI/Schema before using real AI.",
            "This structure is built to evolve into codegen or a full PaaS workflow.",
          ],
          seed + 3
        ),
      };

  applyBriefToHero(hero, heroCopy);

  const features = findFirstSection(cfg as any, "features");
  if (features) {
    setIfExists(
      features,
      "title",
      thai ? "ไฮไลต์ที่ได้จาก brief" : "Highlights based on your brief"
    );

    setIfExists(
      features,
      "subtitle",
      thai
        ? "รายการด้านล่างถูกปรับตามโทน/คำสำคัญใน brief (mock)"
        : "Adjusted from tone/keywords in your brief (mock)"
    );

    if (Array.isArray((features as any).items)) {
      const items = (features as any).items as any[];
      const altTitlesThai =
        tone === "luxury"
          ? ["ดีไซน์หรูและเนี้ยบ", "ประสบการณ์พรีเมียม", "โครงสร้างพร้อมต่อยอด"]
          : tone === "minimal"
          ? ["เรียบง่ายแต่คม", "เนื้อหาโฟกัสชัด", "เร็วและเบา"]
          : tone === "playful"
          ? ["สดใสเป็นมิตร", "CTA ชัดเจน", "พร้อมทำคอนเทนต์สนุกๆ"]
          : ["Modern & Tech", "Scalable layout", "Ready to extend"];

      const altTitlesEn =
        tone === "luxury"
          ? ["Refined premium design", "Polished experience", "Built to scale"]
          : tone === "minimal"
          ? ["Minimal & clean", "Focused content", "Fast and lightweight"]
          : tone === "playful"
          ? ["Friendly vibe", "Clear CTAs", "Content-ready sections"]
          : ["Modern & Tech", "Scalable layout", "Ready to extend"];

      for (let i = 0; i < items.length; i++) {
        const t = thai ? altTitlesThai : altTitlesEn;
        setIfExists(items[i], "title", t[i % t.length]);

        setIfExists(
          items[i],
          "description",
          thai
            ? `ปรับตามโทน: ${tone} • อ้างอิง brief ของคุณ`
            : `Adjusted for tone: ${tone} • Based on your brief`
        );
      }
    }
  }

  const cta = findFirstSection(cfg as any, "cta");
  applyBriefToCta(cta, {
    headline: thai
      ? "อยากให้ AI สร้างจริง? ใส่ API Key แล้วลองใหม่"
      : "Want real AI generation? Add an API key and try again",
    sub: thai
      ? "ตอนนี้คุณกำลังดู Mock Preview ที่ปรับตาม brief"
      : "You’re viewing a mock preview tailored to your brief",
  });

  const blog = findFirstSection(cfg as any, "bloglist");
  if (blog) {
    setIfExists(
      blog,
      "title",
      thai ? "ตัวอย่างคอนเทนต์/บล็อก (mock)" : "Sample content/blog (mock)"
    );
    setIfExists(blog, "maxItems", 3);
  }

  return cfg;
}
