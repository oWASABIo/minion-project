import { createError, getQuery } from "h3";

function isPrivateHost(hostname: string) {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h.endsWith(".local")
  );
}

function safeUrl(baseUrl: string) {
  const u = new URL(baseUrl);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Invalid protocol");
  if (isPrivateHost(u.hostname)) throw new Error("Private host not allowed");
  return u;
}

function buildWpUrl(
  baseUrl: string,
  restBase: string | undefined,
  endpoint: string
) {
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

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const baseUrl = String(q.baseUrl || "").trim();
  const restBase = String(q.restBase || "/wp-json/wp/v2").trim();
  const endpoint = String(q.endpoint || "").trim();

  if (!baseUrl || !endpoint) {
    throw createError({
      statusCode: 400,
      statusMessage: "baseUrl and endpoint are required",
    });
  }

  try {
    safeUrl(baseUrl);
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e?.message || "Invalid baseUrl",
    });
  }

  const url = buildWpUrl(baseUrl, restBase, endpoint);
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: "Invalid WP url" });
  }

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw createError({
      statusCode: res.status,
      statusMessage: `WP request failed: ${res.status}`,
      data: text,
    });
  }

  return await res.json();
});
