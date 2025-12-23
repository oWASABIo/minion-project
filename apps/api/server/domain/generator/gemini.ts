import { GoogleGenerativeAI } from "@google/generative-ai";

let keyRing: string[] = [];
let currentIndex = 0;
let genAIInstances: GoogleGenerativeAI[] = [];

function initKeys() {
  if (keyRing.length > 0) return;

  const config = useRuntimeConfig();
  const rawKeys =
    (config.geminiApiKey as string | undefined) ||
    process.env.GEMINI_API_KEY ||
    "";

  if (!rawKeys) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  // Support comma-separated keys for rotation
  keyRing = rawKeys
    .split(",")
    .map((k) => k.trim().replace(/^["']|["']$/g, ""))
    .filter((k) => k);

  if (keyRing.length === 0) {
    throw new Error("No valid keys found in GEMINI_API_KEY");
  }

  console.log(`[Gemini] Initialized with ${keyRing.length} keys.`);
  keyRing.forEach((k, i) =>
    console.log(
      `[Gemini] Loaded Key ${i}: ${k.slice(0, 4)}...(${k.length} chars)`
    )
  );

  // Pre-create instances
  genAIInstances = keyRing.map((k) => new GoogleGenerativeAI(k));
}

function getCurrentModel() {
  initKeys();
  const instance = genAIInstances[currentIndex];

  const config = useRuntimeConfig();
  // Default to gemini-1.5-flash (Supported by new SDK)
  let modelName =
    (config.geminiModel as string | undefined) || "gemini-1.5-flash";

  return instance.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}

function rotateKey() {
  const prevIndex = currentIndex;
  currentIndex = (currentIndex + 1) % keyRing.length;
  console.warn(
    `[Gemini] Rotating key from index ${prevIndex} to ${currentIndex}`
  );
}

// Legacy Wrapper for direct access (returns current active)
export function useGemini() {
  return getCurrentModel();
}

/**
 * Robust generation with Key Rotation and Retry policies.
 * Retries on 429 (Quota) and 503 (Overload).
 */
export async function generateContentStreamWithRetry(
  prompt: string,
  maxRetries = 3
) {
  initKeys();

  let attempt = 0;
  const totalAttempts = Math.max(genAIInstances.length * 2, maxRetries);
  let lastError: any = null;

  for (let i = 0; i < totalAttempts; i++) {
    try {
      const model = getCurrentModel();
      const result = await model.generateContentStream(prompt);
      return result; // Returns a StreamResult
    } catch (err: any) {
      lastError = err;
      const msg = err.message || "";
      const isQuota =
        msg.includes("429") ||
        msg.includes("Quota") ||
        msg.includes("Resource has been exhausted");
      const isServer =
        msg.includes("503") ||
        msg.includes("Overloaded") ||
        msg.includes("500");
      const isInvalidKey =
        msg.includes("API key not valid") || msg.includes("API_KEY_INVALID");

      if (isQuota) {
        console.warn(
          `[Gemini] Quota exceeded on key index ${currentIndex}. Rotating...`
        );
        rotateKey();
      } else if (isInvalidKey) {
        console.warn(
          `[Gemini] Invalid API Key detected at index ${currentIndex}. Rotating to next key...`
        );
        rotateKey();
      } else if (isServer) {
        console.warn(`[Gemini] Server error (503). Retrying...`);
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      } else {
        throw err;
      }
    }
  }

  throw lastError || new Error("Gemini streaming failed after retries.");
}

/**
 * Robust generation with Key Rotation and Retry policies.
 * Retries on 429 (Quota) and 503 (Overload).
 */
export async function generateContentWithRetry(prompt: string, maxRetries = 3) {
  initKeys();

  let attempt = 0;
  // We try at least once per key, plus retries.
  // Actually, let's just loop until we run out of "global attempts"
  // Allow decent amount of tries: (Keys * 2) or maxRetries
  const totalAttempts = Math.max(genAIInstances.length * 2, maxRetries);

  let lastError: any = null;

  for (let i = 0; i < totalAttempts; i++) {
    try {
      const model = getCurrentModel();
      const result = await model.generateContent(prompt);
      return result; // Success
    } catch (err: any) {
      lastError = err;
      const msg = err.message || "";
      const isQuota =
        msg.includes("429") ||
        msg.includes("Quota") ||
        msg.includes("Resource has been exhausted");
      const isServer =
        msg.includes("503") ||
        msg.includes("Overloaded") ||
        msg.includes("500");
      const isInvalidKey =
        msg.includes("API key not valid") || msg.includes("API_KEY_INVALID");

      if (isQuota) {
        console.warn(
          `[Gemini] Quota exceeded on key index ${currentIndex}. Rotating...`
        );
        rotateKey();
      } else if (isInvalidKey) {
        console.warn(
          `[Gemini] Invalid API Key detected at index ${currentIndex}. Rotating to next key...`
        );
        rotateKey();
      } else if (isServer) {
        console.warn(`[Gemini] Server error (503). Retrying...`);
        // Wait a bit before retry
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      } else {
        // Other fatal error (e.g. Blocked), do not retry
        throw err;
      }
    }
  }

  throw lastError || new Error("Gemini generation failed after retries.");
}
