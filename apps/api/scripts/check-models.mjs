import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Try to load from .env file in root or apps/api
const rootEnv = path.resolve(process.cwd(), ".env");
const apiEnv = path.resolve(process.cwd(), "apps/api/.env");

if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
else if (fs.existsSync(apiEnv)) dotenv.config({ path: apiEnv });

const rawKeys = process.env.GEMINI_API_KEY;

if (!rawKeys) {
  console.error("❌ Error: GEMINI_API_KEY not found in environment variables.");
  console.log("Please ensure .env file exists with GEMINI_API_KEY defined.");
  process.exit(1);
}

// Split and clean keys
const keys = rawKeys
  .split(",")
  .map((k) => k.trim().replace(/^["']|["']$/g, ""))
  .filter((k) => k);
console.log(`🔑 Found ${keys.length} API Key(s) in environment.`);

async function checkModels() {
  for (const [index, key] of keys.entries()) {
    console.log(`\n🔍 Testing Key #${index + 1} (${key.slice(0, 5)}...):`);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );

      if (!response.ok) {
        console.error(
          `   ❌ HTTP Error: ${response.status} ${response.statusText}`
        );
        try {
          const errText = await response.text();
          const errObj = JSON.parse(errText);
          console.error(`   Reason: ${errObj.error?.message || errText}`);
        } catch (e) {
          // Ignore parse error
        }
        continue; // Try next key
      }

      const data = await response.json();

      if (data.models) {
        console.log("   ✅ Valid Key! Available Models:");
        const generateModels = data.models
          .filter((m) =>
            m.supportedGenerationMethods.includes("generateContent")
          )
          .sort((a, b) => a.name.localeCompare(b.name));

        generateModels.forEach((m) => {
          console.log(`      - ${m.name.replace("models/", "")}`);
        });
        return; // Found a valid key, stop checking
      } else {
        console.log("   ⚠️ Key accepted but no models found?");
      }
    } catch (error) {
      console.error("   ❌ Network/Script Error:", error.message);
    }
  }
  console.log("\n❌ All keys failed to list models.");
}

checkModels();
