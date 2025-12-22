// https://nitro.unjs.io/config
import { defineNitroConfig } from "nitropack/config";
import { resolve } from "path";

export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2024-11-01",
  routeRules: {
    "/api/**": { cors: true, headers: { "Access-Control-Allow-Origin": "*" } },
  },
  serverAssets: [
    {
      baseName: "web-components",
      dir: resolve(process.cwd(), "../web/components"),
    },
    {
      baseName: "web-data",
      dir: resolve(process.cwd(), "../web/data"),
    },
  ],
  virtual: {
    // Shim for backend util if needed, but we read it via fs in local dev
  },
});
