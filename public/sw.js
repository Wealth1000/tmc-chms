/* eslint-disable no-restricted-globals */
/**
 * Offline navigation: pages you have opened while online are cached (HTML + RSC payloads + JS).
 * UI shells are static; data shown offline is the last snapshot from your last visit.
 */

const CACHE_VERSION = "tmc-chms-v3";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

/** Cached on install so something works before the first full visit. */
const PRECACHE_URLS = ["/"];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function shouldStore(request, response) {
  if (!response?.ok) return false;
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (!isSameOrigin(url)) return false;
  if (url.pathname.startsWith("/api/")) return false;
  return response.type === "basic" || response.type === "cors";
}

function offlineHtml() {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline · TMC</title></head><body style="margin:0;font-family:system-ui,sans-serif;background:#0B0E14;color:#fff;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:1.5rem"><div style="max-width:20rem;text-align:center"><p style="font-weight:700;font-size:1.125rem">You're offline</p><p style="margin-top:0.5rem;font-size:0.875rem;opacity:0.75">Open a screen you've used before while online, or try again when connected.</p><p style="margin-top:1.25rem"><a href="/" style="color:#93c5fd">Go to sign in</a></p></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function trimOldCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)));
}

/** Hashed Next assets — safe to use cache-first. */
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (shouldStore(request, res)) await cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) ?? Response.error();
  }
}

/**
 * Return cached page immediately when available (fast + works offline).
 * Refresh in the background when the network is available.
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async (res) => {
      if (shouldStore(request, res)) await cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) {
    void networkPromise;
    return cached;
  }

  const fresh = await networkPromise;
  if (fresh) return fresh;

  const isDocument =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html") ||
    (request.headers.get("rsc") || request.headers.get("RSC")) === "1" ||
    (request.headers.get("next-router-prefetch") || "") === "1";

  if (isDocument) {
    const shell = await caches.open(SHELL_CACHE);
    const home = (await shell.match("/")) ?? (await cache.match("/"));
    if (home) return home;
    return offlineHtml();
  }

  return Response.error();
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(trimOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
