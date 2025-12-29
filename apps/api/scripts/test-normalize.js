const toStr = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

function normalizePageConfig(input, opts) {
  const out = input && typeof input === "object" ? { ...input } : {};

  // --- sections normalize
  const sections = Array.isArray(out.sections) ? out.sections : [];
  out.sections = sections.map((sec, i) => {
    const obj = sec && typeof sec === "object" ? sec : {};

    // Logic from apps/api/server/domain/generator/normalize.ts
    let merged = {
      ...obj,
      ...(obj.content && typeof obj.content === "object" ? obj.content : {}),
    };
    delete merged.content; // Remove nested content key

    return merged;
  });

  return out;
}

// Test Case
const testInput = {
  template: "landing",
  sections: [
    {
      type: "blogList",
      id: "blog-1",
      content: {
        title: "My Blog",
        source: { endpoint: "/wp/v2/posts" },
      },
    },
  ],
};

const result = normalizePageConfig(testInput, {});
console.log(JSON.stringify(result, null, 2));

if (result.sections[0].content) {
  console.error("FAIL: content property still exists!");
} else if (result.sections[0].title === "My Blog") {
  console.log("PASS: content flattened correctly.");
} else {
  console.error("FAIL: content not flattened or missing.");
}
