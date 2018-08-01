/// <reference path='./types/service-worker.d.ts' />

importScripts('./idb.js');

const CacheVersion = 3;

const CacheName = `todo-v${CacheVersion}`;

const Assets = [
    '/',
    '/assets/index.css',
    '/src/app.js',
    '/src/controller.js',
    '/src/helpers.js',
    '/src/template.js',
    '/src/store-remote.js',
    '/src/view.js',
    '/src/item.js',
];

self.addEventListener('install', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Installed');

    // Don't wait for old server worker to shutdown. Instantly take over responsibility for serving requests
    skipWaiting();

    // Open the cache
    const cache = await caches.open(CacheName);

    // Add essential files like our app's assets to the cache
    console.log('[ServiceWorker] Caching cacheFiles');

    await cache.addAll(Assets);

})()));

self.addEventListener('activate', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Activated');

    // Immediately grab clients and start handling fetches
    await clients.claim();

})()));

/**
 * Is this an API request?
 * @param {string} url
 */
function isApi(url) {
    return url.indexOf('/todos') !== -1;
}

self.addEventListener('fetch', (e) => e.respondWith((async () => {

    if (isApi(e.request.url)) {
        const requestClone = e.request.clone();

        try {
            const response = await fetch(e.request);

            // We can only cache GETs. Attempts to cache other methods will throw an error
            if (e.request.method === 'GET') {
                // We need to clone the response as we can only read from it once
                const responseClone = response.clone();

                // Immediate invocation of anonymous async function so we don't hold up the reply...
                (async () => {
                    // Open the cache
                    const cache = await caches.open(CacheName);

                    // Store what we just fetched
                    await cache.put(requestClone, responseClone);

                    console.log('[ServiceWorker] Cached new resource:', e.request.url);
                })();
            }

            console.log('[ServiceWorker] Sending new response:', e.request.url);
            return response;

        } catch (err) {

            const date = new Date();

            // We're offline. Intercept the request to see if we can deal with it...
            if (e.request.method === 'POST' && e.request.url.endsWith('/todos')) {

                // We need to store the todo somewhere until we are back online
                const todo = await requestClone.json();

                storeUnsyncedTodo(todo);

                // Return an empty response with status 202 Accepted
                return new Response('{}', {
                    status: 202,
                    headers: new Headers({
                        'content-type': 'application/json',
                        'date': date.toUTCString(),
                    }),
                });
            }

            // Intercept the request to get all todos, and append unsynced todos so the user can still see them
            if (e.request.method === 'GET' && e.request.url.endsWith('/todos')) {

                const response = await caches.match(e.request);

                // Get synced todos from cache (last known state)
                const lastReply = await response.json();

                // Get unsynced todos
                const unsyncedTodos = await getUnsyncedTodos();

                // Combined them and reply
                const json = JSON.stringify({
                    ...lastReply,
                    items: [...lastReply.items, ...unsyncedTodos],
                });

                return new Response(json, {
                    status: 200,
                    headers: new Headers({
                        'content-type': 'application/json',
                        'date': date.toUTCString(),
                    }),
                });
            }

            console.warn('[ServiceWorker] API request failed, falling back to cache:', e.request.url);
        }
    }

    // Check in cache for the request being made
    const response = await caches.match(e.request);

    // If the request is in the cache
    if (response) {
        // Return the cached version
        console.log('[ServiceWorker] Found in Cache:', e.request.url);

        return response;
    }

    // No network and not in the cache, panic!
    throw new Error('Not available');

})()));

async function attemptSync() {
    console.log('[ServiceWorker] Attempting sync...');

    const unsyncedTodos = await getUnsyncedTodos();

    /**
     * Return a promise of all pending todos uploads. If a single promise is rejected, the sync event will reschedule
     */
    await Promise.all(unsyncedTodos.map(async (todo) => {
        const url = '/todos';

        const options = {
            method: 'POST',
            body: JSON.stringify(todo),
            headers: new Headers({ 'content-type': 'application/json' }),
        };

        const req = new Request(url, options);

        await fetch(req);
    }));

    // Clear now that we have successfully synced
    await clearUnsyncedTodos();

    console.log('[ServiceWorker] Sync success');
}

self.addEventListener('sync', (e) => e.waitUntil((async () => {

    // If this promise rejects, sync will be called again at some point in the future with this tag
    if (e.tag === 'todo-sync') {
        await attemptSync();
    }

})()));

self.addEventListener('message', (e) => {
    if (e.data === 'todo-sync-force') {
        attemptSync();
    }
});
