import { d as defineEventHandler, g as getQuery, e as createError } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h.endsWith(".local");
}
function safeUrl(baseUrl) {
  const u = new URL(baseUrl);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Invalid protocol");
  if (isPrivateHost(u.hostname)) throw new Error("Private host not allowed");
  return u;
}
function buildWpUrl(baseUrl, restBase, endpoint) {
  const b = baseUrl.replace(/\/$/, "");
  const ep = (endpoint || "").trim();
  const rb = (restBase || "").trim();
  if (!b || !ep) return "";
  if (/^https?:\/\//i.test(ep)) return ep;
  if (ep.startsWith("/wp-json/")) return `${b}${ep}`;
  const rest = rb ? rb.replace(/\/$/, "") : "";
  const path = ep.startsWith("/") ? ep : `/${ep}`;
  return rest ? `${b}${rest}${path}` : `${b}${path}`;
}
const wpPosts_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const baseUrl = String(q.baseUrl || "").trim();
  const restBase = String(q.restBase || "/wp-json/wp/v2").trim();
  const endpoint = String(q.endpoint || "").trim();
  if (!baseUrl || !endpoint) {
    throw createError({
      statusCode: 400,
      statusMessage: "baseUrl and endpoint are required"
    });
  }
  try {
    safeUrl(baseUrl);
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: (e == null ? void 0 : e.message) || "Invalid baseUrl"
    });
  }
  const url = buildWpUrl(baseUrl, restBase, endpoint);
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: "Invalid WP url" });
  }
  const res = await fetch(url, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw createError({
      statusCode: res.status,
      statusMessage: `WP request failed: ${res.status}`,
      data: text
    });
  }
  return await res.json();
});

export { wpPosts_get as default };
//# sourceMappingURL=wp-posts.get.mjs.map
