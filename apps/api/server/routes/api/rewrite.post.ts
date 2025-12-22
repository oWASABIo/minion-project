import { defineEventHandler, readBody, createError } from "h3";
import { generateContentWithRetry } from "~/domain/generator/gemini";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { text, context } = body as { text: string; context?: string };

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Text is required",
    });
  }

  const config = useRuntimeConfig();
  const geminiKey =
    (config.geminiApiKey as string | undefined) ||
    process.env.GEMINI_API_KEY ||
    "";

  if (!geminiKey) {
    // Mock Fallback if no key
    return {
      result: `(AI Mock) Improved: ${text} - [Context: ${context || "None"}]`,
      mock: true,
    };
  }

  try {
    const prompt = `
      Rule: You are a professional copywriter.
      Task: Rewrite the following text to be more engaging, concise, and professional.
      Context: ${context || "Website Content"}
      
      Original Text:
      "${text}"
      
      Return ONLY the rewritten text. No quotes.
    `;

    const result = await generateContentWithRetry(prompt);
    const rewritten = result.response.text().trim().replace(/^"|"$/g, "");

    return {
      result: rewritten,
      mock: false,
    };
  } catch (e: any) {
    console.error("Rewrite failed:", e);
    throw createError({
      statusCode: 500,
      statusMessage: "AI Rewrite failed",
    });
  }
});
