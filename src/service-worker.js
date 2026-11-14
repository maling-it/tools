/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
// Makes Mools work offline: every page and file is cached when the service worker installs.
import { assets, immutable, prerendered } from '$app/manifest';
import { version } from '$app/env';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));
const CACHE = `mools-${version}`;
// Manifest paths are relative to the base path (/tools), which is the scope this worker is registered for.
const toPathname = (path) => new URL(path.replace(/^\//, ''), sw.registration.scope).pathname;
const ASSETS = new Set([...immutable, ...assets, ...prerendered].map(({ path }) => toPathname(path)));

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...ASSETS])));
	// A new version waits until the page asks for it, so a tool is never swapped out while it is being used.
});

sw.addEventListener('message', (event) => {
	if (event.data === 'SKIP_WAITING') sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key.startsWith('mools-') && key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	// Only our own GET requests; calls to other sites (GitHub, Telegram) always go straight to the network.
	if (request.method !== 'GET' || url.origin !== sw.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			if (request.mode === 'navigate') {
				// Pages: fresh from the network when online, from the cache when not.
				try {
					return await fetch(request);
				} catch {
					return (
						(await cache.match(request, { ignoreSearch: true, ignoreVary: true })) ??
						(await cache.match(url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`)) ??
						(await cache.match(`${new URL(sw.registration.scope).pathname}`)) ??
						Response.error()
					);
				}
			}

			// Built files and static assets: the cache first, and remember anything else that was fetched.
			const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
			if (cached) return cached;
			const response = await fetch(request);
			if (response.ok && ASSETS.has(url.pathname)) cache.put(request, response.clone());
			return response;
		})()
	);
});
