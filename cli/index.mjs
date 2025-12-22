#!/usr/bin/env node

/**
 * MINIONS CLI
 * Usage: npx ai-site init --stack nuxt --config page.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";

const API_URL =
  process.env.MINIONS_API_URL || "http://localhost:3000/api/download-kit";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command !== "init") {
    console.log("Usage: ai-site init --config <path> [--stack <stack>]");
    process.exit(1);
  }

  const configIndex = args.indexOf("--config");
  const stactemplateex = args.indexOf("--stack");

  if (configIndex === -1) {
    console.error(styleText("red", "Error: --config argument is required"));
    process.exit(1);
  }

  const configPath = args[configIndex + 1];
  const stack = stactemplateex > -1 ? args[stactemplateex + 1] : "nuxt";

  // Read Config
  let configContent;
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    configContent = JSON.parse(raw);
  } catch (e) {
    console.error(styleText("red", `Error reading config file: ${configPath}`));
    process.exit(1);
  }

  // Override stack in meta
  if (!configContent.meta) configContent.meta = {};
  configContent.meta.stack = stack;

  console.log(styleText("blue", `🚀 Initializing MINIONS Project...`));
  console.log(`Stack: ${styleText("cyan", stack)}`);
  console.log(`Config: ${styleText("cyan", configPath)}`);
  console.log(`API: ${API_URL}`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: configContent }),
    });

    if (!response.ok) {
      throw new Error(
        `API returned ${response.status}: ${await response.text()}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // We can't unzip easily without external libs in pure Node (before v20+ generic test runner stuff).
    // So we will just write the zip file for now.
    // Ideally we would use 'adm-zip' or 'unzipper' but I can't npm install here easily.
    // I'll write the ZIP and tell the user to unzip.

    const zipName = `minions-starter.zip`;
    await fs.writeFile(zipName, buffer);

    console.log(styleText("green", `\n✅ Project kit downloaded: ${zipName}`));
    console.log(`\nNext steps:`);
    console.log(`1. unzip ${zipName}`);
    console.log(`2. cd <folder>`);
    console.log(`3. npm install && npm run dev`);
  } catch (e) {
    console.error(styleText("red", `Failed to generate project: ${e.message}`));
    process.exit(1);
  }
}

main();
