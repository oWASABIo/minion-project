import { describe, it, expect } from "vitest";
import { normalizePageConfig } from "./normalize";
import type { PageConfig } from "@minions/shared";

// Fix missing argument
const mockOpts = {
  template: "landing",
  stack: "nuxt",
  seed: 123,
  mode: "mock",
} as any;

describe("normalizePageConfig", () => {
  it("should set default values for missing fields", () => {
    const input: Partial<PageConfig> = {
      site: {
        siteName: "Test Site",
      },
    };

    const result = normalizePageConfig(input as any, mockOpts);

    expect(result.site.siteName).toBe("Test Site");
    expect(result.site.primaryColor).toBeDefined(); // Should have default
    expect(result.sections).toEqual([]); // Should default to empty array
  });

  it("should preserve existing values", () => {
    const input: Partial<PageConfig> = {
      site: {
        siteName: "My Site",
        primaryColor: "#ff0000",
      },
      sections: [],
    };

    const result = normalizePageConfig(input as any, mockOpts);

    expect(result.site.siteName).toBe("My Site");
    expect(result.site.primaryColor).toBe("#ff0000");
  });
});
