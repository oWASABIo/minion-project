import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, appendResponseHeader, removeResponseHeader, createError, setResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, readBody, getQuery as getQuery$1, setHeader, sendStream } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/h3/dist/index.mjs';
import { Server } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import archiver from 'file:///Users/jeddirok.k/Documents/minions/node_modules/archiver/index.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import destr from 'file:///Users/jeddirok.k/Documents/minions/node_modules/destr/dist/index.mjs';
import { createHooks } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///Users/jeddirok.k/Documents/minions/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/ohash/dist/index.mjs';
import { getContext } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/unctx/dist/index.mjs';
import defu, { defuFn } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/defu/dist/defu.mjs';
import { toRouteMatcher, createRouter } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola from 'file:///Users/jeddirok.k/Documents/minions/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/youch-core/build/index.js';
import { Youch } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/source-map/source-map.js';
import { dirname as dirname$1, resolve as resolve$1 } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/pathe/dist/index.mjs';
import { klona } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/klona/dist/index.mjs';
import { snakeCase } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/scule/dist/index.mjs';
import { GoogleGenerativeAI } from 'file:///Users/jeddirok.k/Documents/minions/node_modules/@google/generative-ai/dist/index.mjs';

const serverAssets = [{"baseName":"web-components","dir":"/Users/jeddirok.k/Documents/minions/apps/web/components"},{"baseName":"web-data","dir":"/Users/jeddirok.k/Documents/minions/apps/web/data"},{"baseName":"server","dir":"/Users/jeddirok.k/Documents/minions/apps/api/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/jeddirok.k/Documents/minions/apps/api"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/jeddirok.k/Documents/minions/apps/api/server"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/jeddirok.k/Documents/minions/apps/api/.nitro"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/jeddirok.k/Documents/minions/apps/api/.nitro/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"/Users/jeddirok.k/Documents/minions/apps/api/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/api/**": {
        "cors": true,
        "headers": {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
          "access-control-max-age": "0",
          "Access-Control-Allow-Origin": "*"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

getContext("nitro-app", {
  asyncContext: undefined,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const plugins = [
  
];

const assets = {
  "/index.mjs": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ef7f-XVJoKfB8kIUAqq5v+SLqwpjp6hU\"",
    "mtime": "2025-12-23T11:03:33.610Z",
    "size": 126847,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"7c5a9-/AoRT3o+YxqQGG+fmb/EPDvRThs\"",
    "mtime": "2025-12-23T11:03:33.611Z",
    "size": 509353,
    "path": "index.mjs.map"
  }
};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _E5taro = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lazy_gFGzTU = () => Promise.resolve().then(function () { return aiStatus_get$1; });
const _lazy_Y1PVpV = () => Promise.resolve().then(function () { return downloadKit_post$1; });
const _lazy_eIbsMD = () => Promise.resolve().then(function () { return generatePage_post$1; });
const _lazy_A23ktF = () => Promise.resolve().then(function () { return rewrite_post$1; });
const _lazy_Ql9V_G = () => Promise.resolve().then(function () { return wpPosts_get$1; });
const _lazy__HXvEQ = () => Promise.resolve().then(function () { return index$1; });

const handlers = [
  { route: '', handler: _E5taro, lazy: false, middleware: true, method: undefined },
  { route: '/api/ai-status', handler: _lazy_gFGzTU, lazy: true, middleware: false, method: "get" },
  { route: '/api/download-kit', handler: _lazy_Y1PVpV, lazy: true, middleware: false, method: "post" },
  { route: '/api/generate-page', handler: _lazy_eIbsMD, lazy: true, middleware: false, method: "post" },
  { route: '/api/rewrite', handler: _lazy_A23ktF, lazy: true, middleware: false, method: "post" },
  { route: '/api/wp-posts', handler: _lazy_Ql9V_G, lazy: true, middleware: false, method: "get" },
  { route: '/', handler: _lazy__HXvEQ, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const aiStatus_get = defineEventHandler(() => {
  const config = useRuntimeConfig();
  const key = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
  const hasKey = typeof key === "string" && key.trim().length > 20;
  const warnings = [];
  if (!hasKey && key.length > 0) {
    warnings.push("API Key seems too short or invalid.");
  }
  if (process.env.AI_MOCK === "1") {
    warnings.push("AI_MOCK=1 is set in .env (System might force mock mode).");
  }
  return {
    status: "ok",
    provider: "gemini",
    hasKey,
    // 'hasOpenAIKey' kept for backward compat if needed, or we migrate frontend
    hasOpenAIKey: hasKey,
    // Legacy compat
    model: config.geminiModel || "gemini-1.5-flash",
    keyHint: hasKey ? `***${key.trim().slice(-4)}` : "No Key",
    warnings,
    debug: {
      envKeyFound: !!process.env.GEMINI_API_KEY,
      runtimeKeyFound: !!config.geminiApiKey,
      mockEnv: process.env.AI_MOCK
    },
    recommendation: !hasKey ? "Add GEMINI_API_KEY to .env to enable Live generation." : null
  };
});

const aiStatus_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: aiStatus_get
});

function generateAnalyticsApi() {
  return `import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { projectId, eventType, metadata } = body;

  if (!projectId || !eventType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing projectId or eventType",
    });
  }

  // --- ADAPTER: Supabase (Default) ---
  // To use MySQL/Postgres/MongoDB, replace this block with your DB call.
  // See ANALYTICS.md for details.
  const client = await serverSupabaseClient(event);

  const { error } = await client.from("analytics_events").insert({
    project_id: projectId,
    event_type: eventType,
    metadata: metadata || {},
  });

  if (error) {
    console.error("Analytics Error:", error);
    return { success: false };
  }
  // --- END ADAPTER ---

  return { success: true };
});
`;
}
function generateAnalyticsManual() {
  return `# \u{1F4CA} Minions Analytics Kit - User Manual

Welcome to the **Minions Analytics Kit**, a privacy-first, self-hosted analytics solution included with your generated project.

---

## \u{1F680} Quick Start (Supabase Recommended)

### 1. Database Setup
1.  Go to [Supabase.com](https://supabase.com) and create a new project.
2.  Go to the **SQL Editor** in your Supabase dashboard.
3.  Open the file \`database/analytics_schema.sql\` from this project.
4.  Copy, paste, and run the SQL to create the \`analytics_events\` table.

### 2. Connect Your Project
Add variables to \`.env\`:

\`\`\`bash
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-anon-key"
\`\`\`

---

## \u{1F6E0}\uFE0F Customizing (MySQL, MongoDB, etc.)

We designed the Analytics API to be **Database Agnostic**.

### How to switch?

Open \`server/api/analytics/track.post.ts\`. You will see a section labeled \`// ADAPTER: Supabase\`.
Replace that block with your ORM call (Prisma, Drizzle, etc.).

\`\`\`typescript
// Example: Prisma
await prisma.analyticsEvent.create({
  data: { projectId, eventType, metadata }
})
\`\`\`

Happy Tracking! \u{1F4C8}
`;
}
function generateAnalyticsComposable() {
  return `export const useAnalytics = () => {
  const config = useRuntimeConfig();

  // Helper to send data to our API
  const sendEvent = async (projectId: number | string, eventType: string, metadata: any = {}) => {
    try {
      await $fetch("/api/analytics/track", {
        method: "POST",
        body: {
          projectId,
          eventType,
          metadata,
        },
      });
    } catch (e) {
      // Silently fail for analytics to not disrupt UX
      console.warn("[Analytics] Failed to track:", e);
    }
  };

  const trackPageView = (projectId: number | undefined, path: string) => {
    if (!projectId) return;
    sendEvent(projectId, "page_view", { path });
  };

  const trackClick = (projectId: number | undefined, elementId: string, label?: string) => {
    if (!projectId) return;
    sendEvent(projectId, "click", { element_id: elementId, label });
  };

  return {
    trackPageView,
    trackClick,
  };
};
`;
}
function generateAnalyticsMigration() {
  return `-- Run this in your Supabase SQL Editor to enable Analytics

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'page_view', 'click'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_project_time ON analytics_events(project_id, created_at);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (so visitors can log events)
CREATE POLICY "Public can insert events" ON analytics_events FOR INSERT WITH CHECK (true);

-- Allow owners to view
CREATE POLICY "Owners can view analytics" ON analytics_events FOR SELECT USING (auth.uid() = (select user_id from projects where id = analytics_events.project_id));
`;
}

function generateNuxtConfig(config) {
  var _a, _b;
  return `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: "${((_a = config.site) == null ? void 0 : _a.siteName) || "My Landing Page"}",
      meta: [
        { name: 'description', content: '${((_b = config.site) == null ? void 0 : _b.tagline) || ""}' }
      ]
    }
  }
})
`;
}
function generateTailwindConfig(config) {
  var _a;
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts,tsx}",
    "./src/**/*.{js,vue,ts,tsx}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${((_a = config.site) == null ? void 0 : _a.primaryColor) || "#4f46e5"}",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
`;
}

function generateReadme(stack, config, isProject = false) {
  var _a, _b, _c;
  const base = `# ${((_a = config.site) == null ? void 0 : _a.siteName) || "Generated Project"}

Generated by MINIONS AI Builder.

## Setup

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`
`;
  if (stack === "vue-vite") {
    return `${base}
## Stack: Vue 3 + Vite

This project uses **Vite** for lightning fast development.

### Folder Structure
- \`src/App.vue\`: The root component.
- \`src/main.ts\`: Entry point, mounts Vue.
- \`src/router.ts\`: Vue Router configuration.
- \`src/components/sections/\`: All UI sections (Hero, Features, etc.).
- \`src/pages/\`: Page wrappers using \`PageRenderer\`.
- \`src/data/project-config.json\`: The single source of truth for content.

### Integration Guide

**1. Using Components:**
All sections are pure Vue components. You can import them anywhere:
\`\`\`vue
<script setup>
import HeroSection from './components/sections/HeroSection.vue'
<\/script>

<template>
  <HeroSection :config="{...}" />
</template>
\`\`\`

**2. Routing:**
We use \`vue-router\`. Routes are generated automatically in \`src/router.ts\` based on your pages. Add new pages by creating a Vue file and adding a route there.

**3. Theming:**
TailwindCSS is configured in \`tailwind.config.js\`.
- Change primary colors in \`src/data/project-config.json\` (site.primaryColor).
- Dark mode is class-based. Toggle it via the \`dark\` class on the HTML element.

### Deployment
Build using \`npm run build\`. The output will be in \`dist/\`. You can deploy this static folder anywhere (Vercel, Netlify, S3).
`;
  }
  if (stack === "wordpress-theme") {
    return `${base}
## WordPress Headless Configuration

This project is configured as a Headless Frontend for your WordPress site.

**WordPress URL**: \`${((_c = (_b = config.backend) == null ? void 0 : _b.wordpress) == null ? void 0 : _c.baseUrl) || "NOT_SET"}\`

### How it works
1. The **PageRenderer** reads from \`data/${isProject ? "project-config.json" : "page-config.json"}\`.
2. The **BlogListSection** fetches posts from your WordPress API.
3. You can edit content in WordPress (Posts) or in the JSON (Layouts).

### Deployment
Deploy this folder to Vercel/Netlify. It acts as the "View" layer for your WP data.
`;
  }
  if (stack === "nuxt") {
    let structureDocs = `
- **Engine**: Nuxt 3
- **Styling**: TailwindCSS
- **Components**: \`components/sections/*\`
- **Configuration**: \`data/${isProject ? "project-config.json" : "page-config.json"}\`
`;
    if (isProject) {
      structureDocs += `
- **Pages**: 
  - \`pages/index.vue\` (Home)
  - Other pages generated based on project structure.
  - Each page file reads its config from the central JSON.
`;
    }
    return `${base}
## Architecture

${structureDocs}

Open \`app.vue\` and \`pages/\` to see how the \`PageRenderer\` is used.
`;
  }
  return `# Project Export
  
stack: ${stack}

See docs for manual integration.
`;
}
function generateDeployMd() {
  return `# Deployment Guide

## Vercel (Recommended)

1. **Install Vercel CLI** (Optional but faster):
   \`\`\`bash
   npm i -g vercel
   vercel
   \`\`\`

2. **Drag & Drop**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Drag this project folder into the "Import Project" area.
   - Framework Preset: **Nuxt.js** (or Vite if using Vue stack).
   - Build Command: \`npm run build\` (default).
   - Output Directory: \`.output\` (Nuxt) or \`dist\` (Vite).

## Netlify

1. Drag and drop the folder.
2. Build Command: \`npm run build\`.
3. Publish Directory: \`dist\`.

## Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", ".output/server/index.mjs"]
\`\`\`
`;
}

function generateAppVueSingle() {
  return `<script setup lang="ts">
import config from "~/data/page-config.json";
import PageRenderer from "~/components/sections/PageRenderer.vue";
<\/script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-50 antialiased font-sans">
    <PageRenderer :config="config as any" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
}
</style>
`;
}
function generateAppVueMultiPage() {
  return `<script setup lang="ts">
// Main Layout
<\/script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-50 antialiased font-sans">
    <NuxtPage />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
}
</style>
`;
}
function generatePageVue(pageId) {
  return `<script setup lang="ts">
import projectConfig from "~/data/project-config.json";

const pageConfig = projectConfig.pages["${pageId}"];
<\/script>

<template>
  <div v-if="pageConfig">
    <PageRenderer :config="pageConfig" />
  </div>
  <div v-else class="p-10 text-center">
    Page Not Found
  </div>
</template>
`;
}
function generateTokens(config) {
  var _a;
  return {
    color: {
      primary: { value: ((_a = config.site) == null ? void 0 : _a.primaryColor) || "#4f46e5" },
      base: {
        white: { value: "#ffffff" },
        slate950: { value: "#020617" }
      }
    },
    font: {
      sans: { value: "Inter" }
    },
    size: {
      spacing: {
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "2rem" },
        xl: { value: "4rem" }
      }
    }
  };
}
function generateVitePackageJson(config) {
  var _a, _b;
  const name = ((_b = (_a = config.site) == null ? void 0 : _a.siteName) == null ? void 0 : _b.toLowerCase().replace(/[^a-z0-9]/g, "-")) || "minions-project";
  return {
    name,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vue-tsc -b && vite build",
      preview: "vite preview"
    },
    dependencies: {
      vue: "^3.5.12",
      "vue-router": "^4.4.5",
      "@heroicons/vue": "^2.1.5",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.4"
    },
    devDependencies: {
      "@vitejs/plugin-vue": "^5.1.4",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.47",
      tailwindcss: "^3.4.14",
      typescript: "~5.6.2",
      vite: "^5.4.10",
      "vue-tsc": "^2.1.8"
    }
  };
}
function generateViteConfig() {
  return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
`;
}
function generateIndexHtml(config) {
  var _a, _b;
  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${((_a = config.site) == null ? void 0 : _a.siteName) || "Minions Project"}</title>
    <meta name="description" content="${((_b = config.site) == null ? void 0 : _b.tagline) || ""}" />
  </head>
  <body class="bg-slate-950 text-slate-50">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`;
}
function generateMainTsVite() {
  return `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
`;
}
function generateAppVueVite() {
  return `<script setup lang="ts">
import { RouterView } from 'vue-router'
<\/script>

<template>
  <RouterView />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}
</style>
`;
}
function generateRouterTs(config) {
  const routes = Object.keys(config.pages).map((pageId) => {
    const path = pageId === "home" ? "/" : `/${pageId}`;
    const componentPath = pageId === "home" ? "index.vue" : `${pageId}.vue`;
    return "{ path: '" + path + "', component: () => import('./pages/" + componentPath + "') }";
  });
  return `import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ${routes.join(",\n    ")}
  ]
})

export default router
`;
}
function generatePageVueVite(pageId) {
  return `<script setup lang="ts">
import projectConfig from '@/data/project-config.json';
import PageRenderer from '@/components/sections/PageRenderer.vue';

const pageConfig = projectConfig.pages["${pageId}"];
<\/script>

<template>
  <div v-if="pageConfig">
    <PageRenderer :config="pageConfig" />
  </div>
  <div v-else>Page not found</div>
</template>
`;
}
function generatePackageJson(config) {
  return {
    name: "minions-generated-project",
    private: true,
    scripts: {
      build: "nuxt build",
      dev: "nuxt dev",
      generate: "nuxt generate",
      preview: "nuxt preview",
      postinstall: "nuxt prepare"
    },
    dependencies: {
      "@heroicons/vue": "^2.1.5",
      clsx: "^2.1.1",
      nuxt: "^3.13.0",
      "tailwind-merge": "^2.5.2",
      vue: "latest"
    },
    devDependencies: {
      "@nuxtjs/tailwindcss": "^6.12.1",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.47",
      tailwindcss: "^3.4.10"
    }
  };
}

async function generateProjectFiles(config, stack = "nuxt") {
  const files = [];
  const rootDir = process.cwd();
  const isProject = "pages" in config;
  const projectConfig = isProject ? config : null;
  const pageConfig = isProject ? null : config;
  files.push({
    name: "data/project-config.json",
    // Unified name for simplicity in new projects
    content: JSON.stringify(config, null, 2)
  });
  if (!isProject) {
    files.push({
      name: "data/page-config.json",
      content: JSON.stringify(config, null, 2)
    });
  }
  try {
    const possiblePaths = [
      resolve(rootDir, "types/landing.ts"),
      // Standalone / Legacy
      resolve(rootDir, "../../packages/shared/src/types/landing.ts"),
      // Monorepo Dev (from apps/api)
      resolve(rootDir, "../packages/shared/src/types/landing.ts")
      // Variant
    ];
    let typesContent = "";
    for (const p of possiblePaths) {
      try {
        typesContent = await promises.readFile(p, "utf-8");
        if (typesContent) break;
      } catch (e) {
      }
    }
    if (!typesContent) {
      throw new Error("Could not find landing.ts types");
    }
    files.push({ name: "types/landing.ts", content: typesContent });
  } catch (e) {
    console.warn("Failed to include types/landing.ts:", e);
    files.push({
      name: "types/landing.ts",
      content: "// Error reading types from Scaffolder. Please ensure @minions/shared is built or accessible."
    });
  }
  if (stack === "nuxt" || stack === "wordpress-theme") {
    let mainConfig = isProject ? projectConfig.pages["home"] : pageConfig;
    if (!mainConfig && isProject) {
      const pages = Object.values(projectConfig.pages);
      if (pages.length > 0) mainConfig = pages[0];
    }
    if (!mainConfig) {
      throw new Error("Unable to determine main page configuration.");
    }
    files.push({
      name: "package.json",
      content: JSON.stringify(generatePackageJson(), null, 2)
    });
    files.push({
      name: "nuxt.config.ts",
      content: generateNuxtConfig(mainConfig)
    });
    files.push({
      name: "tailwind.config.js",
      content: generateTailwindConfig(mainConfig)
    });
    if (isProject) {
      files.push({
        name: "app.vue",
        content: generateAppVueMultiPage()
      });
      for (const [pageId, pConfig] of Object.entries(projectConfig.pages)) {
        const fileName = pageId === "home" ? "index.vue" : `${pageId}.vue`;
        files.push({
          name: `pages/${fileName}`,
          content: generatePageVue(pageId)
        });
      }
    } else {
      files.push({
        name: "app.vue",
        content: generateAppVueSingle()
      });
    }
    const components = await readComponents();
    files.push(...components);
    const backendUtil = await readBackendUtil();
    files.push(backendUtil);
    files.push({
      name: "server/api/analytics/track.post.ts",
      content: generateAnalyticsApi()
    });
    files.push({
      name: "composables/useAnalytics.ts",
      content: generateAnalyticsComposable()
    });
    files.push({
      name: "database/analytics_schema.sql",
      content: generateAnalyticsMigration()
    });
    files.push({
      name: "ANALYTICS.md",
      content: generateAnalyticsManual()
    });
  } else if (stack === "vue-vite") {
    files.push({
      name: "package.json",
      content: JSON.stringify(generateVitePackageJson(config), null, 2)
    });
    files.push({
      name: "vite.config.ts",
      content: generateViteConfig()
    });
    files.push({
      name: "index.html",
      content: generateIndexHtml(config)
    });
    files.push({
      name: "src/main.ts",
      content: generateMainTsVite()
    });
    files.push({
      name: "src/App.vue",
      content: generateAppVueVite()
    });
    if (isProject) {
      files.push({
        name: "src/router.ts",
        content: generateRouterTs(projectConfig)
      });
      for (const [pageId, pConfig] of Object.entries(projectConfig.pages)) {
        const fileName = pageId === "home" ? "index.vue" : `${pageId}.vue`;
        files.push({
          name: `src/pages/${fileName}`,
          content: generatePageVueVite(pageId)
        });
      }
    }
    const components = await readComponents();
    const viteComponents = components.map((c) => ({
      name: `src/${c.name}`,
      content: c.content
    }));
    files.push(...viteComponents);
  }
  const configForTokens = isProject ? projectConfig.pages["home"] || Object.values(projectConfig.pages)[0] : pageConfig;
  if (configForTokens) {
    files.push({
      name: isProject ? "data/tokens.json" : stack === "vue-vite" ? "src/data/tokens.json" : "data/tokens.json",
      content: JSON.stringify(generateTokens(configForTokens), null, 2)
    });
  }
  files.push({
    name: "README.md",
    content: generateReadme(stack, configForTokens || {}, isProject)
  });
  files.push({
    name: "DEPLOY.md",
    content: generateDeployMd()
  });
  return files;
}
async function readComponents(rootDir) {
  const storage = useStorage("assets:web-components");
  const keys = await storage.getKeys();
  const components = [];
  for (const key of keys) {
    const content = await storage.getItem(key);
    if (typeof content !== "string") continue;
    const relativePath = key.replace(/:/g, "/");
    components.push({
      name: `components/${relativePath}`,
      content
    });
  }
  return components;
}
async function readBackendUtil(rootDir) {
  const currentDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  const backendPath = resolve(currentDir, "assets/backend.ts");
  let content = "";
  try {
    content = await promises.readFile(backendPath, "utf-8");
  } catch (e) {
    content = "export const backend = {}; // Placeholder";
  }
  return {
    name: "server/utils/backend.ts",
    content
  };
}

const downloadKit_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { config, stack } = body;
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });
  setHeader(event, "Content-Type", "application/zip");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="starter-kit-${stack}-${((_a = config.meta) == null ? void 0 : _a.seed) || "seed"}.zip"`
  );
  const files = await generateProjectFiles(config, stack);
  for (const file of files) {
    archive.append(file.content, { name: file.name });
  }
  archive.finalize();
  return sendStream(event, archive);
});

const downloadKit_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: downloadKit_post
});

const TEMPLATE_REGISTRY = [
  // --- SaaS Templates ---
  {
    id: "saas-b2b",
    label: "B2B Enterprise SaaS",
    template: "saas",
    description: "Trust-focused layout for enterprise software.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: [
          "hero",
          "stats",
          // Social Proof first
          "features",
          "testimonials",
          "pricing",
          "faq",
          "cta"
        ],
        promptFocus: "Enterprise B2B SaaS for {brief}. Focus on security, scale, and ROI. Use authoritative tone."
      },
      {
        id: "pricing",
        route: "/pricing",
        structure: ["hero", "pricing", "faq", "cta"],
        promptFocus: "Detailed pricing tiers for {brief}. FAQ about enterprise licenses."
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "team", "cta"],
        // 'Talk to Sales'
        promptFocus: "Contact sales for {brief}. Offices and support."
      }
    ]
  },
  {
    id: "saas-ai",
    label: "AI Startup Launch",
    template: "saas",
    description: "Futuristic, dark-mode ready layout for AI tools.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "cta"],
        // Simpler for early stage
        promptFocus: "AI tool launch for {brief}. Focus on 'Magic' and speed. Futuristic tone."
      },
      {
        id: "features",
        route: "/features",
        structure: ["hero", "features", "cta"],
        promptFocus: "Deep dive into AI capabilities of {brief}."
      }
    ]
  },
  // --- Landing Page Templates ---
  {
    id: "landing-saas-v1",
    label: "SaaS Product Launch",
    template: "landing",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "testimonials", "pricing", "cta"],
        promptFocus: "High converting SaaS landing page for {brief}. Focus on benefits and trust."
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "team", "stats", "cta"],
        promptFocus: "About the company building {brief}. Mission driven and professional."
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq", "cta"],
        promptFocus: "Contact support for {brief}. FAQ included."
      }
    ]
  },
  {
    id: "landing-mobile-app",
    label: "Mobile App Showcase",
    template: "landing",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "cta"],
        // Simplified for app
        promptFocus: "Mobile app showcase for {brief}. Focus on screenshots and download links."
      },
      {
        id: "features",
        route: "/features",
        structure: ["hero", "features", "cta"],
        promptFocus: "Detailed features of the app {brief}."
      }
    ]
  },
  // --- Company Templates ---
  {
    id: "company-corporate",
    label: "Modern Corporate",
    template: "company",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "cta"],
        promptFocus: "Corporate website for {brief}. Trustworthy and established."
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "team", "testimonials", "cta"],
        promptFocus: "History and leadership of {brief}."
      },
      {
        id: "services",
        route: "/services",
        structure: ["hero", "features", "pricing", "cta"],
        promptFocus: "Professional services offered by {brief}."
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq", "cta"],
        promptFocus: "Get in touch with {brief}."
      }
    ]
  },
  // --- Blog Templates ---
  {
    id: "blog-personal",
    label: "Personal Brand",
    template: "blog",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "blogList", "cta"],
        promptFocus: "Personal blog of an expert in {brief}."
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "stats", "cta"],
        // Stats = years experience etc
        promptFocus: "About the author of {brief}."
      }
    ]
  },
  // --- Ecommerce Templates ---
  {
    id: "ecommerce-store",
    label: "Brand Store",
    template: "ecommerce",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "productList", "testimonials"],
        // Product list not yet implemented as section type, reusing features
        promptFocus: "Storefront for {brief}. Highlight best sellers."
      },
      {
        id: "shop",
        route: "/shop",
        structure: ["hero", "productList"],
        promptFocus: "Full product catalog for {brief}. Organized grid."
      },
      {
        id: "product-detail",
        route: "/product/:id",
        structure: ["productDetail", "productList"],
        // productList here acts as "Related Products"
        promptFocus: "Single product view. Focus on details and conversion. RELATED SECTION is mandatory."
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "stats", "team"],
        promptFocus: "Our story and craftsmanship for {brief}."
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq"],
        promptFocus: "Customer support for {brief}."
      }
    ]
  },
  // --- Creative / Portfolio Templates ---
  {
    id: "portfolio-creative",
    label: "Creative Portfolio",
    template: "portfolio",
    description: "Visual-heavy layout for creatives and agencies.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "testimonials", "cta"],
        // features as Grid
        promptFocus: "Creative portfolio for {brief}. Focus on visual impact and past work. Use features section to showcase projects grid."
      },
      {
        id: "projects",
        route: "/projects",
        structure: ["hero", "features"],
        // Project list
        promptFocus: "Full list of projects by {brief}."
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "team", "stats", "cta"],
        promptFocus: "Our creative philosophy and the team behind {brief}."
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq", "cta"],
        promptFocus: "Work with us. Contact {brief}."
      }
    ]
  },
  {
    id: "portfolio-minimal",
    label: "Minimalist Folio",
    template: "portfolio",
    description: "Clean, text-forward portfolio for writers or strategists.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "blogList", "cta"],
        // blogList as 'Case Studies'
        promptFocus: "Minimalist portfolio for {brief}. Focus on typography and case studies (blog list)."
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "stats"],
        promptFocus: "Bio and achievements of {brief}."
      }
    ]
  },
  // --- Service Business ---
  {
    id: "company-service",
    label: "Local Service Business",
    template: "company",
    description: "Perfect for local businesses and service providers.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "testimonials", "faq", "cta"],
        promptFocus: "Local service business website for {brief}. Trust and reliability."
      },
      {
        id: "services",
        route: "/services",
        structure: ["hero", "features", "pricing", "cta"],
        promptFocus: "Services and packages offered by {brief}."
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "team", "cta"],
        promptFocus: "Get a quote from {brief}."
      }
    ]
  }
];
function getRandomTemplate(template, seed) {
  const candidates = TEMPLATE_REGISTRY.filter((t) => t.template === template);
  if (candidates.length === 0) {
    return TEMPLATE_REGISTRY[0];
  }
  const idx = Math.abs(seed) % candidates.length;
  return candidates[idx];
}

const COMMON_SECTIONS = /* @__PURE__ */ new Set([
  "hero",
  "features",
  "testimonials",
  "faq",
  "blogList",
  "cta",
  "pricing",
  "stats",
  "team"
]);
const STACK_SPECS = {
  nuxt: {
    label: "Nuxt 3 Starter",
    description: "Modern Vue 3 + Nuxt 4 stack with TailwindCSS.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      if (template === "company")
        return ["hero", "features", "testimonials", "cta"];
      if (template === "blog") return ["hero", "blogList", "cta"];
      return ["hero", "features", "testimonials", "faq", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["center", "split", "left", "right"],
        defaultVariant: "center"
      }
    }
  },
  "vue-vite": {
    label: "Vue 3 + Vite",
    description: "Pure Vue 3 with Vite for maximum speed.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      if (template === "company")
        return ["hero", "features", "testimonials", "cta"];
      return ["hero", "features", "testimonials", "faq", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["center", "split", "left", "right"],
        defaultVariant: "center"
      }
    }
  },
  nextjs: {
    label: "Next.js Starter",
    description: "A robust React framework starter.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      if (template === "landing")
        return ["hero", "features", "testimonials", "cta"];
      return ["hero", "features", "faq", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["split", "center"],
        // Next.js spec might be more opinionated
        defaultVariant: "split"
      }
    }
  },
  "wordpress-theme": {
    label: "WordPress Theme (Headless)",
    description: "Headless setup using WordPress as CMS.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      return ["hero", "features", "blogList", "testimonials", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["center", "left"],
        // Traditional WP style
        defaultVariant: "center"
      },
      blogList: {
        forceSourcetemplate: "wordpress"
        // Must use WP
      }
    }
  }
};
function getStackSpec(stack = "nuxt") {
  return STACK_SPECS[stack] || STACK_SPECS["nuxt"];
}
function enforceStackConstraints(section, stack) {
  const spec = getStackSpec(stack);
  const type = section.type;
  if (!spec.allowedSections.has(type)) ;
  if (type === "hero" && spec.constraints.hero) {
    const s = section;
    const allowed = spec.constraints.hero.allowedVariants;
    if (!allowed.includes(s.variant)) {
      s.variant = spec.constraints.hero.defaultVariant;
    }
  }
  if (type === "blogList" && spec.constraints.blogList) {
    const s = section;
    if (spec.constraints.blogList.forceSourcetemplate) {
      if (!s.source) s.source = {};
      s.source.template = spec.constraints.blogList.forceSourcetemplate;
    }
  }
  return section;
}

const template_SPECS = {
  landing: {
    label: "Landing Page",
    description: "High conversion page for products or services.",
    defaultSectionOrder: [
      "hero",
      "features",
      "pricing",
      "testimonials",
      "faq",
      "cta"
    ],
    requiredSections: ["hero", "cta"],
    promptFocus: "Focus on conversion, clear value proposition, and call to action. Use persuasive copy."
  },
  company: {
    label: "Company Site",
    description: "Corporate or agency website focusing on trust and brand.",
    defaultSectionOrder: [
      "hero",
      "features",
      "stats",
      "team",
      "testimonials",
      "cta"
    ],
    // features here implies services/about
    requiredSections: ["hero"],
    promptFocus: "Focus on trust, professional tone, company values, and services offered. Use 'About Us' style content."
  },
  blog: {
    label: "Blog / News",
    description: "Content-focused site with article listings.",
    defaultSectionOrder: ["hero", "blogList", "cta"],
    requiredSections: ["blogList"],
    promptFocus: "Focus on content discovery. The hero should highlight the latest news or main category. Ensure the blog list is prominent."
  },
  ecommerce: {
    label: "E-Commerce",
    description: "Online store front for selling products.",
    defaultSectionOrder: ["hero", "features", "productList", "testimonials"],
    requiredSections: ["hero", "productList"],
    promptFocus: "Focus on product showcasing. Use 'features' section to highlight categories. Ensure 'productList' shows top selling items."
  },
  portfolio: {
    label: "Portfolio",
    description: "Showcase work and case studies for creatives.",
    defaultSectionOrder: ["hero", "features", "testimonials", "cta"],
    requiredSections: ["hero", "features"],
    promptFocus: "Focus on visual impact, showcasing projects (use features section for this), and clear contact info."
  },
  saas: {
    label: "SaaS / Startup",
    description: "High-growth B2B or B2C software product sites.",
    defaultSectionOrder: [
      "hero",
      "stats",
      "features",
      "testimonials",
      "pricing",
      "faq",
      "cta"
    ],
    requiredSections: ["hero", "pricing", "cta"],
    promptFocus: "Focus on problem-solution fit, ROI metrics (stats), main features, and clear tiered pricing."
  }
};
function gettemplateSpec(template) {
  return template_SPECS[template] || template_SPECS["landing"];
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pick(arr, n) {
  return arr[Math.abs(n) % arr.length];
}
function makeAccent(template, seed, brief, stack) {
  const palette = [
    "#4f46e5",
    // Indigo
    "#06b6d4",
    // Cyan
    "#22c55e",
    // Green
    "#f97316",
    // Orange
    "#ec4899",
    // Pink
    "#a855f7",
    // Purple
    "#eab308",
    // Yellow
    "#ef4444",
    // Red
    "#14b8a6",
    // Teal
    "#3b82f6",
    // Blue
    "#8b5cf6",
    // Violet
    "#d946ef",
    // Fuchsia
    "#f43f5e",
    // Rose
    "#84cc16",
    // Lime
    "#0ea5e9"
    // Sky
  ];
  const h = hashString(`${template}|${stack}|${seed}|${brief}`);
  return pick(palette, h);
}
function titleFromBrief(brief, fallback) {
  const t = (brief || "").trim();
  if (!t) return fallback;
  return t.split("\n")[0].slice(0, 48);
}
function buildMockProject(opts) {
  const { template, brief, stack, seed } = opts;
  const selectedTemplate = getRandomTemplate(template, seed);
  const themeMode = seed % 2 === 0 ? "dark" : "light";
  const pages = {};
  for (const pageDef of selectedTemplate.pages) {
    const pageBrief = `${brief}. ${pageDef.promptFocus}`;
    const pageSeed = seed + hashString(pageDef.id);
    pages[pageDef.id] = buildMockPageConfig({
      ...opts,
      template,
      // Keep project template (string), structure is from definition
      brief: pageBrief,
      seed: pageSeed,
      structure: pageDef.structure,
      // Explicit structure from template
      themeMode
      // Pass consistent theme
    });
  }
  return {
    template: selectedTemplate.template,
    // Use the template string from definition (should match input)
    templateId: selectedTemplate.id,
    site: {
      siteName: titleFromBrief(brief, "Generated Site"),
      tagline: "Generated by MINIONS",
      primaryColor: makeAccent(template, seed, brief, stack),
      themeMode
    },
    backend: {
      cms: "wordpress",
      wordpress: opts.wordpressBaseUrl ? { baseUrl: opts.wordpressBaseUrl, restBase: opts.wordpressRestBase } : { baseUrl: "", restBase: opts.wordpressRestBase }
    },
    pages,
    meta: {
      mode: "mock",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      seed,
      stack
    }
  };
}
function buildMockPageConfig(opts) {
  const { template, brief, stack, seed } = opts;
  const h = hashString(`${template}|${stack}|${seed}|${brief}`);
  const stackSpec = getStackSpec(stack);
  const templateSpec = gettemplateSpec(template);
  opts.themeMode || (seed % 2 === 0 ? "dark" : "light");
  function shuffle(array, seed2) {
    const copy = [...array];
    let m = copy.length, t, i;
    let s = seed2 % 2147483647;
    if (s <= 0) s += 2147483646;
    const next = () => {
      s = s * 16807 % 2147483647;
      return (s - 1) / 2147483646;
    };
    while (m) {
      i = Math.floor(next() * m--);
      t = copy[m];
      copy[m] = copy[i];
      copy[i] = t;
    }
    return copy;
  }
  let baseSections = [];
  if (opts.structure) {
    baseSections = [...opts.structure];
  } else {
    const defaultOrder = templateSpec.defaultSectionOrder;
    const hasHero = defaultOrder[0] === "hero";
    const hasCta = defaultOrder[defaultOrder.length - 1] === "cta";
    let middle = defaultOrder.slice(
      hasHero ? 1 : 0,
      hasCta ? defaultOrder.length - 1 : defaultOrder.length
    );
    middle = shuffle(middle, h);
    baseSections = [
      ...hasHero ? ["hero"] : [],
      ...middle,
      ...hasCta ? ["cta"] : []
    ];
  }
  const wpBaseUrl = (opts.wordpressBaseUrl || "").trim() || "";
  const wpRestBase = (opts.wordpressRestBase || "").trim() || "/wp-json/wp/v2";
  const siteName = titleFromBrief(brief, "Generated Preview");
  const accent = makeAccent(template, seed, brief, stack);
  const sections = baseSections.map((t, idx) => {
    const secHash = h + idx * 13;
    const ctx = {
      h: secHash,
      stackSpec,
      stack,
      seed,
      siteName,
      wpBaseUrl};
    switch (t) {
      case "hero":
        return mockHero(ctx);
      case "features":
        return mockFeatures(ctx);
      case "testimonials":
        return mockTestimonials(ctx);
      case "faq":
        return mockFaq();
      case "blogList":
        return mockBlogList(ctx);
      case "pricing":
        return mockPricing();
      case "stats":
        return mockStats();
      case "team":
        return mockTeam();
      case "cta":
        return mockCta(ctx);
      case "productList":
        return mockProductList();
      case "productDetail":
        return mockProductDetail(ctx);
      default:
        return mockCta(ctx);
    }
  });
  const page = {
    template,
    site: {
      siteName,
      tagline: "Generated by MINIONS",
      primaryColor: accent
    },
    backend: {
      cms: "wordpress",
      wordpress: wpBaseUrl ? { baseUrl: wpBaseUrl, restBase: wpRestBase } : { baseUrl: "", restBase: wpRestBase }
    },
    sections,
    meta: {
      mode: "mock",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      seed,
      stack,
      note: "Mock generator via Stack Spec."
    }
  };
  return page;
}
function mockHero(ctx) {
  var _a;
  const allowedVars = ((_a = ctx.stackSpec.constraints.hero) == null ? void 0 : _a.allowedVariants) || [
    "center"
  ];
  const variant = pick(allowedVars, ctx.h);
  return {
    id: "hero-main",
    type: "hero",
    variant,
    eyebrow: `${ctx.stackSpec.label} Concept`.toUpperCase(),
    headline: variant === "split" ? `Your Idea: ${ctx.siteName}` : `Build ${ctx.siteName} with ${ctx.stackSpec.label}`,
    subheadline: "This is a mock generated based on your brief, seed, and selected stack constraints.",
    primaryCta: { label: "Generate (Live)", href: "#get-started" },
    secondaryCta: { label: "Learn More", href: "#examples" }
  };
}
function mockFeatures(ctx) {
  return {
    id: "features-main",
    type: "features",
    title: pick(
      ["Key Features", "Why Us?", "Highlights", "Core Benefits"],
      ctx.h
    ),
    subtitle: `Optimized for ${ctx.stackSpec.label} architecture.`,
    items: [
      {
        title: "Stack Optimized",
        description: `Generated specifically for ${ctx.stack} conventions.`
      },
      {
        title: "Deterministic Mock",
        description: `Same seed (${ctx.seed}) = Same result.`
      },
      {
        title: "Customizable",
        description: "Edit brief to change the tone/content keywords."
      }
    ]
  };
}
function mockTestimonials(ctx) {
  return {
    id: "testimonials-main",
    type: "testimonials",
    title: "Testimonials",
    items: [
      {
        quote: `The ${ctx.stack} output structure is exactly what I needed.`,
        name: "Alex",
        role: "Developer"
      },
      {
        quote: "Mock generation is super fast and consistent.",
        name: "Sarah",
        role: "Product Manager"
      }
    ]
  };
}
function mockFaq(ctx) {
  return {
    id: "faq-main",
    type: "faq",
    title: "Frequently Asked Questions",
    items: [
      {
        q: "How does the stack selection affect output?",
        a: "It changes section ordering, constraints, and constraints valid for that framework."
      },
      {
        q: "Can I export this?",
        a: "Yes, you can export the JSON config using the Export panel."
      }
    ]
  };
}
function mockBlogList(ctx) {
  var _a;
  return {
    id: "blog-latest",
    type: "blogList",
    title: ctx.wpBaseUrl ? "From the Blog" : "Blog (Configure WP)",
    subtitle: ctx.wpBaseUrl || ((_a = ctx.stackSpec.constraints.blogList) == null ? void 0 : _a.forceSourcetemplate) === "wordpress" ? "Fetching from WordPress API" : "Connect your CMS to see real posts",
    maxItems: 3,
    source: {
      template: "wordpress",
      endpoint: "/posts?per_page=3&_embed"
    }
  };
}
function mockPricing(ctx) {
  return {
    id: "pricing-main",
    type: "pricing",
    title: "Simple, Transparent Pricing",
    subtitle: "Choose the plan that's right for you.",
    plans: [
      {
        name: "Starter",
        price: "$0",
        period: "/mo",
        description: "Perfect for hobbyists.",
        features: ["1 Project", "Community Support", "Basic Analytics"],
        cta: { label: "Start Free", href: "#free" }
      },
      {
        name: "Pro",
        price: "$29",
        period: "/mo",
        isPopular: true,
        description: "For serious developers.",
        features: [
          "Unlimited Projects",
          "Priority Support",
          "Advanced Analytics",
          "Custom Domain"
        ],
        cta: { label: "Get Pro", href: "#pro" }
      },
      {
        name: "Enterprise",
        price: "$99",
        period: "/mo",
        description: "For large teams.",
        features: [
          "SSO Integration",
          "Dedicated Success Manager",
          "SLA",
          "Audit Logs"
        ],
        cta: { label: "Contact Sales", href: "#contact" }
      }
    ]
  };
}
function mockStats(ctx) {
  return {
    id: "stats-main",
    type: "stats",
    title: "Trusted by Developers",
    variant: "card",
    items: [
      { value: "10k+", label: "Active Users", description: "Growing daily" },
      {
        value: "99.9%",
        label: "Uptime",
        description: "Enterprise grade reliability"
      },
      { value: "24/7", label: "Support", description: "We are always here" },
      { value: "500+", label: "Components", description: "Ready to use" }
    ]
  };
}
function mockTeam(ctx) {
  return {
    id: "team-main",
    type: "team",
    title: "Meet the Team",
    subtitle: "The experts behind the magic.",
    members: [
      {
        name: "Sarah Chen",
        role: "CEO & Founder",
        bio: "Visionary leader with 10+ years in Tech.",
        avatar: "/images/team-1.png"
      },
      {
        name: "David Miller",
        role: "CTO",
        bio: "Full stack wizard and open source contributor.",
        avatar: "/images/team-2.png"
      },
      {
        name: "Emily Davis",
        role: "Head of Design",
        bio: "Creating beautiful pixels and user experiences.",
        avatar: "/images/team-3.png"
      },
      {
        name: "Michael Wilson",
        role: "Lead Engineer",
        bio: "Architecting scalable systems.",
        avatar: "/images/team-4.png"
      }
    ]
  };
}
function mockCta(ctx) {
  return {
    id: "cta-bottom",
    type: "cta",
    title: "Ready to launch?",
    headline: "Start building today",
    subheadline: `Get your ${ctx.stackSpec.label} starter kit now.`,
    primaryCta: { label: "Get Started", href: "#get-started" }
  };
}
function mockProductList(ctx) {
  return {
    id: "products-grid",
    type: "productList",
    title: "Featured Collection",
    subtitle: "Handpicked items just for you.",
    maxItems: 6,
    displayMode: "grid"
  };
}
function mockProductDetail(ctx) {
  return {
    id: "product-main",
    type: "productDetail",
    showRelated: true,
    showReviews: true,
    // Add dummy product data for visual preview if CMS not connected
    mockProduct: {
      name: "Premium Mock Object",
      price: "$129.00",
      description: "This is a placeholder product generated by the mock system.",
      sku: "MOCK-001",
      images: [
        `https://picsum.photos/seed/${ctx.seed}/600/600`,
        `https://picsum.photos/seed/${ctx.seed + 1}/600/600`
      ]
    }
  };
}

const KNOWN_BLOCKS = /* @__PURE__ */ new Set(["site", "style", "content", "wordpress", "config"]);
function setNested(d, block, key, value) {
  const v = value.trim();
  if (!v) return;
  if (block === "site") {
    d.site || (d.site = {});
    if (key === "siteName") d.site.siteName = v;
    if (key === "tagline") d.site.tagline = v;
    if (key === "primaryColor") d.site.primaryColor = v;
    return;
  }
  if (block === "style") {
    d.style || (d.style = {});
    if (key === "tone") d.style.tone = v;
    if (key === "language") d.style.language = v;
    if (key === "keywords") d.style.keywords = v;
    return;
  }
  if (block === "wordpress") {
    d.wordpress || (d.wordpress = {});
    if (key === "baseUrl") d.wordpress.baseUrl = v;
    if (key === "restBase") d.wordpress.restBase = v;
    if (key === "postsEndpoint") d.wordpress.postsEndpoint = v;
    return;
  }
  if (block === "config") {
    d.config || (d.config = {});
    if (key === "seed") {
      const n = parseInt(v, 10);
      if (!isNaN(n)) d.config.seed = n;
    }
    return;
  }
  if (block === "content") {
    d.content || (d.content = {});
    d.content[key] = v;
  }
}
function parsePromptPattern(input) {
  const text = (input || "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const directives = {};
  const free = [];
  let currentBlock = null;
  for (const rawLine of lines) {
    let line = rawLine.split("//")[0].trim();
    if (!line) continue;
    const m = line.match(/^\[([a-zA-Z0-9_-]+)\]$/);
    if (m) {
      const name = m[1].toLowerCase();
      currentBlock = KNOWN_BLOCKS.has(name) ? name : null;
      continue;
    }
    if (currentBlock) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      setNested(directives, currentBlock, key, value);
      continue;
    }
    free.push(line);
  }
  const cleanBrief = free.join("\n").trim();
  return { cleanBrief, directives };
}

const toStr = (v) => typeof v === "string" ? v : v == null ? "" : String(v);
function normalizePageConfig(input, opts) {
  var _a, _b, _c, _d;
  const out = input && typeof input === "object" ? { ...input } : {};
  out.template = toStr(out.template) || opts.template;
  out.stack = toStr(out.stack) || opts.stack;
  const siteFromRoot = {
    siteName: toStr(out.siteName) || "",
    tagline: toStr(out.tagline) || "",
    primaryColor: toStr(out.primaryColor) || ""
  };
  out.site = out.site && typeof out.site === "object" ? { ...out.site } : {};
  out.site.siteName = toStr(out.site.siteName) || siteFromRoot.siteName || "Generated Preview";
  out.site.tagline = toStr(out.site.tagline) || siteFromRoot.tagline || "";
  out.site.primaryColor = toStr(out.site.primaryColor) || siteFromRoot.primaryColor || "#4f46e5";
  const baseUrl = (opts.wordpressBaseUrl || ((_b = (_a = out.backend) == null ? void 0 : _a.wordpress) == null ? void 0 : _b.baseUrl) || "").trim();
  const restBase = (opts.wordpressRestBase || ((_d = (_c = out.backend) == null ? void 0 : _c.wordpress) == null ? void 0 : _d.restBase) || "/wp-json/wp/v2").trim();
  if (baseUrl) {
    out.backend = out.backend && typeof out.backend === "object" ? { ...out.backend } : {};
    out.backend.cms = "wordpress";
    out.backend.wordpress = { baseUrl, restBase };
  }
  const sections = Array.isArray(out.sections) ? out.sections : [];
  out.sections = sections.map((sec, i) => {
    var _a2;
    const obj = sec && typeof sec === "object" ? sec : {};
    let merged = {
      ...obj,
      ...obj.content && typeof obj.content === "object" ? obj.content : {}
    };
    delete merged.content;
    let t = toStr(merged.type) || "hero";
    t = t.charAt(0).toLowerCase() + t.slice(1);
    if (t === "bloglist") t = "blogList";
    if (t === "productlist") t = "productList";
    if (t === "productdetail") t = "productDetail";
    merged.type = t;
    merged.id = toStr(merged.id) || `${merged.type}-${i + 1}`;
    if (merged.type === "hero") {
      if (merged.tag && !merged.eyebrow) merged.eyebrow = merged.tag;
      if (merged.title && !merged.headline) merged.headline = merged.title;
      if (!merged.headline) merged.headline = "Generated Hero";
      if (merged.description && !merged.subheadline)
        merged.subheadline = merged.description;
      if (merged.subtitle && !merged.subheadline)
        merged.subheadline = merged.subtitle;
      if (Array.isArray(merged.actions)) {
        if (merged.actions.length > 0 && !merged.primaryCta) {
          merged.primaryCta = {
            label: merged.actions[0].label || merged.actions[0].text || "Get Started",
            href: merged.actions[0].link || merged.actions[0].href || "#"
          };
        }
        if (merged.actions.length > 1 && !merged.secondaryCta) {
          merged.secondaryCta = {
            label: merged.actions[1].label || merged.actions[1].text || "Learn More",
            href: merged.actions[1].link || merged.actions[1].href || "#"
          };
        }
      }
      if (!merged.image) {
        merged.image = `https://picsum.photos/seed/${opts.seed + i}/800/600`;
      }
    }
    if (merged.type === "features") {
      merged.title = toStr(merged.title) || "Features";
      if (merged.description && !merged.subtitle)
        merged.subtitle = merged.description;
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      merged.items = Array.isArray(merged.items) ? merged.items.map((it) => ({
        title: toStr(it == null ? void 0 : it.title) || "Feature",
        description: toStr(it == null ? void 0 : it.description) || ""
      })) : [];
    }
    if (merged.type === "testimonials") {
      merged.title = toStr(merged.title) || "Testimonials";
      merged.items = Array.isArray(merged.items) ? merged.items.map((it) => ({
        quote: toStr(it == null ? void 0 : it.quote) || "",
        name: toStr(it == null ? void 0 : it.name) || "",
        role: toStr(it == null ? void 0 : it.role) || void 0,
        avatar: (it == null ? void 0 : it.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${toStr(
          it == null ? void 0 : it.name
        )}`
      })) : [];
    }
    if (merged.type === "team") {
      merged.title = toStr(merged.title) || "Our Team";
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      const members = Array.isArray(merged.members) ? merged.members : Array.isArray(merged.items) ? merged.items : [];
      merged.items = members.map((it, midx) => ({
        name: toStr(it == null ? void 0 : it.name) || "Member Name",
        role: toStr(it == null ? void 0 : it.role) || "Role",
        bio: toStr(it == null ? void 0 : it.bio),
        // ✅ Phase 9: Inject Avatar
        avatar: toStr(it == null ? void 0 : it.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${toStr(it == null ? void 0 : it.name) || opts.seed + i + midx}`,
        socials: (it == null ? void 0 : it.socials) || {}
      }));
    }
    if (merged.type === "faq") {
      merged.title = toStr(merged.title) || "FAQ";
      if (Array.isArray(merged.items)) {
        merged.items = merged.items.map((it) => ({
          q: toStr(it == null ? void 0 : it.q) || toStr(it == null ? void 0 : it.question) || "",
          a: toStr(it == null ? void 0 : it.a) || toStr(it == null ? void 0 : it.answer) || ""
        }));
      } else {
        merged.items = [];
      }
    }
    if (merged.type === "cta") {
      merged.headline = toStr(merged.headline) || toStr(merged.title) || "Call to action";
      const desc = toStr(merged.description);
      const sub = toStr(merged.subheadline) || toStr(merged.subtitle);
      merged.subheadline = sub || desc || "";
      merged.description = desc || merged.subheadline || "";
      if (!merged.primaryCta || typeof merged.primaryCta !== "object") {
        merged.primaryCta = { label: "Get started", href: "#get-started" };
      } else {
        merged.primaryCta = {
          label: toStr(merged.primaryCta.label) || "Get started",
          href: toStr(merged.primaryCta.href) || "#get-started"
        };
      }
      if (merged.secondaryCta && typeof merged.secondaryCta === "object") {
        merged.secondaryCta = {
          label: toStr(merged.secondaryCta.label) || "Learn more",
          href: toStr(merged.secondaryCta.href) || "#"
        };
      }
    }
    if (merged.type === "blogList") {
      const postsEndpoint = toStr(merged.postsEndpoint) || toStr((_a2 = merged.source) == null ? void 0 : _a2.endpoint);
      merged.source = merged.source && typeof merged.source === "object" ? { ...merged.source } : { template: "wordpress", endpoint: "" };
      merged.source.template = toStr(merged.source.template) || "wordpress";
      merged.source.endpoint = postsEndpoint || "/posts?per_page=3&_embed";
      merged.title = toStr(merged.title) || "Latest from WordPress";
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      if (merged.layout != null) merged.layout = toStr(merged.layout);
      if (typeof merged.maxItems !== "number") merged.maxItems = 3;
    }
    if (merged.type === "productList") {
      merged.title = toStr(merged.title) || "Featured Products";
      merged.subtitle = toStr(merged.subtitle) || "Explore our latest collection";
      if (typeof merged.maxItems !== "number") merged.maxItems = 6;
      merged.displayMode = toStr(merged.displayMode) || "grid";
    }
    if (merged.type === "productDetail") {
      if (merged.showRelated == null) merged.showRelated = true;
      if (merged.showReviews == null) merged.showReviews = true;
    }
    return enforceStackConstraints(merged, out.stack);
  });
  out.meta = out.meta && typeof out.meta === "object" ? { ...out.meta } : {};
  out.meta.mode = opts.mode;
  out.meta.seed = opts.seed;
  out.meta.stack = toStr(out.meta.stack) || out.stack || opts.stack;
  return out;
}

let keyRing = [];
let currentIndex = 0;
let genAIInstances = [];
function initKeys() {
  if (keyRing.length > 0) return;
  const config = useRuntimeConfig();
  const rawKeys = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
  if (!rawKeys) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  keyRing = rawKeys.split(",").map((k) => k.trim().replace(/^["']|["']$/g, "")).filter((k) => k);
  if (keyRing.length === 0) {
    throw new Error("No valid keys found in GEMINI_API_KEY");
  }
  console.log(`[Gemini] Initialized with ${keyRing.length} keys.`);
  keyRing.forEach(
    (k, i) => console.log(
      `[Gemini] Loaded Key ${i}: ${k.slice(0, 4)}...(${k.length} chars)`
    )
  );
  genAIInstances = keyRing.map((k) => new GoogleGenerativeAI(k));
}
function getCurrentModel() {
  initKeys();
  const instance = genAIInstances[currentIndex];
  const config = useRuntimeConfig();
  let modelName = config.geminiModel || "gemini-flash-latest";
  return instance.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json"
    }
  });
}
function rotateKey() {
  const prevIndex = currentIndex;
  currentIndex = (currentIndex + 1) % keyRing.length;
  console.warn(
    `[Gemini] Rotating key from index ${prevIndex} to ${currentIndex}`
  );
}
async function generateContentStreamWithRetry(prompt, maxRetries = 3) {
  initKeys();
  const totalAttempts = Math.max(genAIInstances.length * 2, maxRetries);
  let lastError = null;
  for (let i = 0; i < totalAttempts; i++) {
    try {
      const model = getCurrentModel();
      const result = await model.generateContentStream(prompt);
      return result;
    } catch (err) {
      lastError = err;
      const msg = err.message || "";
      const isQuota = msg.includes("429") || msg.includes("Quota") || msg.includes("Resource has been exhausted");
      const isServer = msg.includes("503") || msg.includes("Overloaded") || msg.includes("500");
      const isInvalidKey = msg.includes("API key not valid") || msg.includes("API_KEY_INVALID");
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
        await new Promise((r) => setTimeout(r, 1e3 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
  throw lastError || new Error("Gemini streaming failed after retries.");
}
async function generateContentWithRetry(prompt, maxRetries = 3) {
  initKeys();
  const totalAttempts = Math.max(genAIInstances.length * 2, maxRetries);
  let lastError = null;
  for (let i = 0; i < totalAttempts; i++) {
    try {
      const model = getCurrentModel();
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      lastError = err;
      const msg = err.message || "";
      const isQuota = msg.includes("429") || msg.includes("Quota") || msg.includes("Resource has been exhausted");
      const isServer = msg.includes("503") || msg.includes("Overloaded") || msg.includes("500");
      const isInvalidKey = msg.includes("API key not valid") || msg.includes("API_KEY_INVALID");
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
        await new Promise((r) => setTimeout(r, 1e3 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
  throw lastError || new Error("Gemini generation failed after retries.");
}

function validatePageConfig(config) {
  const errors = [];
  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Root config must be an object"] };
  }
  if (!config.template) errors.push("Missing root field 'template'");
  if (!config.site) errors.push("Missing root field 'site'");
  if (config.pages) {
    if (typeof config.pages !== "object") {
      errors.push("Field 'pages' must be an object");
    } else {
      Object.keys(config.pages).forEach((pageId) => {
        const page = config.pages[pageId];
        if (!page.sections || !Array.isArray(page.sections)) {
          errors.push(`Page [${pageId}] missing 'sections' array`);
        } else {
          page.sections.forEach((section, index) => {
            validateSection(section, index, errors, pageId);
          });
        }
      });
    }
  } else if (!Array.isArray(config.sections)) {
    if (config.content && Array.isArray(config.content)) {
      errors.push(
        "Found 'content' array but expected 'sections'. Please rename 'content' to 'sections'."
      );
    } else {
      errors.push("Missing or invalid 'sections' array (or 'pages' object)");
    }
  } else {
    config.sections.forEach((section, index) => {
      validateSection(section, index, errors);
    });
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function validateSection(section, index, errors, pageContext) {
  const prefix = pageContext ? `Page [${pageContext}] Section [${index}]` : `Section [${index}]`;
  const VOCABULARY = [
    "hero",
    "features",
    "testimonials",
    "faq",
    "blogList",
    "cta",
    "pricing",
    "stats",
    "team"
  ];
  if (!section.type) {
    errors.push(`${prefix} missing 'type'`);
    return;
  }
  const typeLower = section.type.charAt(0).toLowerCase() + section.type.slice(1);
  if (!VOCABULARY.includes(typeLower) && !VOCABULARY.includes(section.type)) {
    errors.push(
      `${prefix} has unknown type '${section.type}'. Allowed: ${VOCABULARY.join(
        ", "
      )}`
    );
  }
  if (!section.id) {
    errors.push(`${prefix} (${section.type}) missing 'id'`);
  }
  switch (section.type) {
    case "hero":
      if (!section.headline) errors.push(`${prefix} (hero) missing 'headline'`);
      break;
    case "features":
      if (!Array.isArray(section.items))
        errors.push(`${prefix} (features) missing 'items' array`);
      break;
    case "testimonials":
      if (!Array.isArray(section.items))
        errors.push(`${prefix} (testimonials) missing 'items' array`);
      break;
    case "pricing":
      if (!Array.isArray(section.plans))
        errors.push(`${prefix} (pricing) missing 'plans' array`);
      break;
    case "stats":
      if (!Array.isArray(section.items))
        errors.push(`${prefix} (stats) missing 'items' array`);
      break;
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

function cleanupJson(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].startsWith("```")) lines.shift();
    if (lines[lines.length - 1].startsWith("```")) lines.pop();
    cleaned = lines.join("\n");
  }
  return cleaned;
}
function extractJson(text) {
  const cleaned = cleanupJson(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON.");
    return JSON.parse(match[0]);
  }
}
const generatePage_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  try {
    const body = await readBody(event);
    const template = (body.template || "landing").toString();
    const briefRaw = (body.brief || "").toString().trim();
    const mode = body.mode || "auto";
    const stack = (body.stack || "nuxt").toString() || "nuxt";
    const wordpressBaseUrl = (body.wordpressBaseUrl || "").toString().trim();
    const wordpressRestBase = (body.wordpressRestBase || "").toString().trim();
    let seed = typeof body.seed === "number" ? body.seed : void 0;
    if (!briefRaw) {
      throw createError({
        statusCode: 400,
        statusMessage: "Brief is required"
      });
    }
    const { cleanBrief, directives } = parsePromptPattern(briefRaw);
    if (seed === void 0 && typeof ((_a = directives.config) == null ? void 0 : _a.seed) === "number") {
      seed = directives.config.seed;
    }
    if (seed === void 0) {
      seed = Date.now();
    }
    const config = useRuntimeConfig();
    const geminiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
    const hasKey = geminiKey.length > 0;
    const wantLive = mode === "live" || mode === "auto";
    let rawProject = null;
    let finalMode = "mock";
    let note = "";
    try {
      if (body.stream && wantLive && hasKey) {
        const templateSpec = gettemplateSpec(template);
        const { systemPrompt } = await Promise.resolve().then(function () { return prompts; });
        const fullPrompt = [
          "System:",
          systemPrompt(templateSpec, stack),
          "---",
          "User Context:",
          `Brief: ${briefRaw}`,
          `Directives: ${JSON.stringify(directives || {})}`,
          cleanBrief ? `Clean Intent: ${cleanBrief}` : ""
        ].join("\n");
        return sendStream(
          event,
          new ReadableStream({
            async start(controller) {
              try {
                const result = await generateContentStreamWithRetry(fullPrompt);
                for await (const chunk of result.stream) {
                  const chunkText = chunk.text();
                  controller.enqueue(new TextEncoder().encode(chunkText));
                }
                controller.close();
              } catch (err) {
                console.error("[Streaming] Error:", err);
                try {
                  controller.enqueue(
                    new TextEncoder().encode(`

[ERROR]: ${err.message}`)
                  );
                } catch {
                }
                controller.close();
              }
            }
          })
        );
      }
      if (mode === "mock" || !hasKey && wantLive) {
        finalMode = "mock";
        note = !hasKey && wantLive ? "Falling back to Mock Mode (No valid API Key found)." : "Mock Mode requested.";
        rawProject = buildMockProject({
          template,
          brief: cleanBrief || briefRaw,
          stack,
          seed,
          wordpressBaseUrl,
          wordpressRestBase
        });
      } else if (wantLive && hasKey) {
        try {
          finalMode = "live";
          const selectedTemplate = getRandomTemplate(template, seed);
          const templateId = selectedTemplate.id;
          const VOCABULARY = [
            "hero",
            "features",
            "testimonials",
            "faq",
            "blogList",
            "cta",
            "pricing",
            "stats",
            "team"
            // "logos", // Future
            // "steps", // Future
          ];
          const baseSystemInstruction = [
            "Role: specialized UI Composer (The Smart Chef).",
            "Task: Composition only. Select and arrange sections to build a high-conversion landing page.",
            `Available Ingredients (Vocabulary): [${VOCABULARY.join(", ")}]`,
            `- Stack: ${stack}. Adjust content/structure conventions accordingly.`,
            "CRITICAL RULES:",
            "1. NO NEW INGREDIENTS: You must ONLY use the section types listed above. Do not invent 'map', 'contact', 'about', etc.",
            "2. ADAPTIVE RECIPE: The provided structure is a recommendation. You MAY add, remove, or reorder sections if it better fits the specific User Brief.",
            "3. FLATTEN: Output a flat 'sections' array. Do not nest content.",
            "4. OUTPUT: strictly JSON matching PageConfig schema."
          ].join("\n");
          const generatePageWithRepair = async (pageId, pageContextBrief, globalContext, structure) => {
            const templateSpec = gettemplateSpec(template);
            const structureInstruction = structure ? `Recommended Structure: [${structure.join(
              ", "
            )}]. 
Guidance: Use this as a starting point. If the brief asks for something specific (e.g. "focus on trust"), add 'testimonials' or 'stats' even if not in the recommendation.` : "Recommendation: Create a logical conversion flow.";
            const instruction = [
              baseSystemInstruction,
              `Page Context: ${pageId} (${templateSpec.promptFocus})`,
              structureInstruction,
              globalContext.siteName ? `- Site Name: ${globalContext.siteName}` : "",
              globalContext.themeMode ? `- Theme Mode: ${globalContext.themeMode}` : ""
            ].join("\n");
            let currentPrompt = [
              "System:",
              instruction,
              "---",
              "User Context:",
              `Brief: ${pageContextBrief}`,
              `Directives: ${JSON.stringify(directives || {})}`,
              "---",
              "Action: Generate JSON."
            ].join("\n");
            let lastError = "";
            const MAX_REPAIR_ATTEMPTS = 2;
            for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
              if (attempt > 0) {
                console.warn(
                  `[Auto-Repair] Attempt ${attempt} for ${pageId}. Error: ${lastError}`
                );
                currentPrompt += `

SYSTEM ALERT: Your previous JSON was invalid. 
Errors: ${lastError} 
Please fix the JSON structure, remove unknown section types, and return ONLY the JSON object.`;
              }
              try {
                const result = await generateContentWithRetry(currentPrompt);
                const text = result.response.text();
                if (!text) throw new Error("Empty response");
                const json = extractJson(text);
                if (!json.template) json.template = template;
                if (!json.site) json.site = globalContext;
                if (!json.sections && !json.pages) json.sections = [];
                if (json.sections && Array.isArray(json.sections)) {
                  json.sections.forEach((sec, idx) => {
                    if (!sec.id) sec.id = `${sec.type || "section"}-${idx + 1}`;
                    if (!sec.items && ["features", "testimonials", "stats"].includes(sec.type)) {
                    }
                  });
                }
                const validation = validatePageConfig(json);
                if (validation.valid) {
                  return json;
                } else {
                  lastError = validation.errors.join(", ");
                }
              } catch (e) {
                lastError = e.message || "Unknown parse error";
              }
            }
            throw new Error(
              `Failed to generate valid JSON after repairs. Errors: ${lastError}`
            );
          };
          const pages = {};
          let siteContext = {
            siteName: "",
            tagline: "",
            primaryColor: "",
            themeMode: "dark"
          };
          try {
            const homeDef = selectedTemplate.pages.find((p) => p.id === "home");
            const homeBrief = `${cleanBrief || briefRaw}. ${(homeDef == null ? void 0 : homeDef.promptFocus) || "Main landing page."}`;
            const rawHome = await generatePageWithRepair(
              "home",
              homeBrief,
              {},
              homeDef == null ? void 0 : homeDef.structure
            );
            siteContext = {
              siteName: ((_b = rawHome.site) == null ? void 0 : _b.siteName) || "Generated Site",
              tagline: ((_c = rawHome.site) == null ? void 0 : _c.tagline) || "",
              primaryColor: ((_d = rawHome.site) == null ? void 0 : _d.primaryColor) || "",
              themeMode: ((_e = rawHome.site) == null ? void 0 : _e.themeMode) || "dark"
            };
            pages["home"] = rawHome;
          } catch (e) {
            console.error("Home generation failed, falling back to mock", e);
            pages["home"] = buildMockPageConfig({
              template,
              brief: cleanBrief || briefRaw,
              stack,
              seed,
              wordpressBaseUrl,
              wordpressRestBase,
              structure: (_f = selectedTemplate.pages.find((p) => p.id === "home")) == null ? void 0 : _f.structure
            });
            siteContext = {
              siteName: pages["home"].site.siteName || "",
              tagline: pages["home"].site.tagline || "",
              primaryColor: pages["home"].site.primaryColor || "",
              themeMode: pages["home"].site.themeMode || "dark"
            };
          }
          const otherPages = selectedTemplate.pages.filter(
            (p) => p.id !== "home"
          );
          console.log(
            `[Multi-Page] Selected Template: ${templateId}, Other Pages: ${otherPages.length}`
          );
          if (otherPages.length > 0) {
            for (const p of otherPages) {
              console.log(`[Multi-Page] Generating ${p.id}...`);
              const pBrief = `${cleanBrief || briefRaw}. Focus on ${p.id} page. ${p.promptFocus}`;
              try {
                const pageConfig = await generatePageWithRepair(
                  p.id,
                  pBrief,
                  siteContext,
                  p.structure
                  // Guide
                );
                if (!pageConfig.site) pageConfig.site = {};
                pageConfig.site.siteName = siteContext.siteName;
                pageConfig.site.tagline = siteContext.tagline;
                if (siteContext.primaryColor)
                  pageConfig.site.primaryColor = siteContext.primaryColor;
                pageConfig.site.themeMode = siteContext.themeMode;
                pages[p.id] = pageConfig;
                console.log(`[Multi-Page] Success: ${p.id}`);
              } catch (e) {
                console.warn(
                  `[Multi-Page] Failed ${p.id}, falling back to mock.`,
                  e
                );
                const mockPage = buildMockPageConfig({
                  template,
                  brief: pBrief,
                  stack,
                  seed: seed + hashString(p.id),
                  structure: p.structure,
                  themeMode: siteContext.themeMode
                });
                mockPage.site.siteName = siteContext.siteName;
                mockPage.site.primaryColor = siteContext.primaryColor;
                pages[p.id] = mockPage;
              }
            }
          }
          note = "Live OK (Gemini Multi-page)";
          rawProject = {
            template,
            templateId,
            site: ((_g = pages["home"]) == null ? void 0 : _g.site) || {},
            backend: (_h = pages["home"]) == null ? void 0 : _h.backend,
            pages,
            meta: (_i = pages["home"]) == null ? void 0 : _i.meta
          };
        } catch (err) {
          console.error("Gemini generation failed:", err);
          finalMode = "mock";
          note = `AI Error: ${err.message}. Fallback to mock.`;
          rawProject = buildMockProject({
            template,
            brief: cleanBrief || briefRaw,
            stack,
            seed,
            wordpressBaseUrl,
            wordpressRestBase
          });
        }
      }
    } catch (e) {
      console.error("Critical generation error:", e);
      finalMode = "mock";
      note = `Critical error: ${e.message}`;
      rawProject = buildMockProject({
        template,
        brief: cleanBrief || briefRaw,
        stack,
        seed,
        wordpressBaseUrl,
        wordpressRestBase
      });
    }
    const finalPages = {};
    if (rawProject && rawProject.pages) {
      for (const [pageId, pageConf] of Object.entries(rawProject.pages)) {
        finalPages[pageId] = normalizePageConfig(pageConf, {
          template,
          stack,
          seed,
          mode: finalMode,
          wordpressBaseUrl,
          wordpressRestBase
        });
        finalPages[pageId].meta = {
          ...finalPages[pageId].meta || {},
          mode: finalMode,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          seed,
          stack,
          note
        };
      }
    }
    const finalProject = {
      template,
      templateId: (rawProject == null ? void 0 : rawProject.templateId) || "unknown",
      site: (rawProject == null ? void 0 : rawProject.site) || {},
      backend: rawProject == null ? void 0 : rawProject.backend,
      pages: finalPages,
      meta: {
        mode: finalMode,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        seed,
        stack,
        note,
        brief: briefRaw
      }
    };
    return {
      config: finalProject
    };
  } catch (err) {
    return {
      config: null,
      error: err.message || "Unknown server error"
    };
  }
});

const generatePage_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: generatePage_post
});

const rewrite_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { text, context } = body;
  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Text is required"
    });
  }
  const config = useRuntimeConfig();
  const geminiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
  if (!geminiKey) {
    return {
      result: `(AI Mock) Improved: ${text} - [Context: ${context || "None"}]`,
      mock: true
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
      mock: false
    };
  } catch (e) {
    console.error("Rewrite failed:", e);
    throw createError({
      statusCode: 500,
      statusMessage: "AI Rewrite failed"
    });
  }
});

const rewrite_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: rewrite_post
});

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
  const q = getQuery$1(event);
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
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
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

const wpPosts_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: wpPosts_get
});

const index = eventHandler(() => {
  return {
    status: "ok",
    service: "MINIONS API",
    version: "1.0.0",
    check: "Use /api/ai-status to check credentials"
  };
});

const index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index
});

function systemPrompt(spec, stack) {
  return [
    "Role: AI Web Architect.",
    "Task: Generate a JSON object matching the PageConfig schema.",
    "Constraints:",
    "- Output strictly JSON. No markdown fences.",
    "- Use section types: hero, features, testimonials, faq, blogList, cta, pricing, stats, team.",
    `- Stack: ${stack}. Adjust content/structure conventions accordingly.`,
    `- Template: ${spec.label}.`,
    "",
    "Schema Definition (Simplified):",
    "{",
    '  "meta": { "title": string, "description": string, "stack": string, "generatedAt": string, "mode": "mock" | "legacy" | "auto" },',
    '  "site": { "name": string, "logo": string, "themeMode": "light" | "dark", "primaryColor": string, "fontFamily": string },',
    '  "pages": {',
    '    "home": {',
    '      "id": "home",',
    '      "slug": "/",',
    '      "sections": [',
    '        { "id": string, "type": "hero" | ... , "content": { ... } }',
    "      ]",
    "    }",
    "  }",
    "}",
    "",
    "Allowed Section Content:",
    "- Hero: tag, title, description, actions: [{ label, link, variant: 'primary'|'secondary' }], image? (use placehold.co)",
    "- Features: title, subtitle, items: [{ title, description, icon (lucide-react name) }]",
    "- Testimonials: title, items: [{ name, role, content, avatar }]",
    "- Pricing: title, description, plans: [{ name, price, features: [], cta: {}, popular: boolean }]",
    "- Team: title, description, members: [{ name, role, avatar, bio }]",
    "- Stats: items: [{ label, value, description? }]",
    "- BlogList: title, source: { endpoint? } (If WP URL provided, use it. Else mock.)",
    "",
    "Instructions:",
    "1. Respect User Brief implicitly.",
    "2. Generate realistic, creative copy. No 'Lorem Ipsum'.",
    "3. Ensure strictly valid JSON.",
    "4. Do NOT output markdown formatting (```json)."
  ].join("\n");
}

const prompts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  systemPrompt: systemPrompt
});
//# sourceMappingURL=index.mjs.map
