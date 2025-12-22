#!/usr/bin/env node

/**
 * Minions Build Validator
 * Usage: node scripts/validate-build.mjs --stack <nuxt|vue>
 *
 * 1. Requests a fresh kit from local API
 * 2. Unzips to .temp_build/
 * 3. Runs `npm install` and `npm run build`
 * 4. Reports pass/fail
 */

import fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { styleText } from "node:util";

const execAsync = promisify(exec);
const API_URL = "http://localhost:3000/api/download-kit";

// Sample Config
const TEST_CONFIG = {
  template: "landing",
  stack: "nuxt",
  site: { siteName: "Validation Test", tagline: "Automated Build Check" },
  sections: [
    { id: "hero", type: "hero", headline: "Test Hero" },
    { id: "features", type: "features", items: [] },
  ],
};

async function main() {
  const args = process.argv.slice(2);
  const stack = args[0] || "nuxt";
  const tempDir = path.resolve(".temp_build");
  const zipPath = path.resolve("validation.zip");

  console.log(
    styleText(
      "blue",
      `🔍 Starting Build Validation for stack: ${styleText("bold", stack)}`
    )
  );

  try {
    // 0. Cleanup previous
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    await fs.rm(zipPath, { force: true }).catch(() => {});

    // 1. Request Kit
    console.log(`1. Generating Project...`);
    TEST_CONFIG.stack = stack;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: TEST_CONFIG }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(zipPath, buffer);
    console.log(
      styleText(
        "green",
        `   ✓ Downloaded (${(buffer.length / 1024).toFixed(1)} KB)`
      )
    );

    // 2. Unzip (System command)
    console.log(`2. Unzipping...`);
    await execAsync(`unzip -q ${zipPath} -d ${tempDir}`);
    console.log(styleText("green", `   ✓ Extracted to ${tempDir}`));

    // 3. Install
    console.log(`3. Installing Dependencies... (This may take a minute)`);
    // Using --no-audit --no-fund for speed
    await execAsync(`npm install --no-audit --no-fund --silent`, {
      cwd: tempDir,
    });
    console.log(styleText("green", `   ✓ Dependencies installed`));

    // 4. Build
    console.log(`4. Building Project...`);
    await execAsync(`npm run build`, { cwd: tempDir });
    console.log(styleText("green", `   ✓ Build Successful!`));

    console.log(styleText("bgGreen", `\n ✅ VALIDATION PASSED \n`));

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(zipPath, { force: true });
  } catch (e) {
    console.error(styleText("bgRed", `\n ❌ VALIDATION FAILED \n`));
    console.error(styleText("red", e.message));
    if (e.stderr) console.error(e.stderr);
    process.exit(1);
  }
}

main();
