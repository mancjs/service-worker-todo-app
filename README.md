# Service Worker Tutorial

To use the optional type information with this tutorial, using Visual Studio Code is recommended.

When the tutorial asks you to go offline, use the "Offline" checkbox in your browser's developer tools.

## Running the Todo app

The Todo is run from a NodeJS server. After clone this repository, run this from your terminal:

```bash
cd todo-server
yarn
yarn start
```

The web app itself is contained within the `todo-app` folder. Open this folder with your favourite editor.

## Add a service worker boilerplate to the Todo app

Create a new JavaScript file in the root of `todo-app` called `service-worker.js`:

```javascript
/// <reference path="./types/service-worker.d.ts" />

self.addEventListener('install', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Installed');

})()));

self.addEventListener('activate', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Activated');

})()));

self.addEventListener('fetch', (e) => e.respondWith((async () => {

    console.log('[ServiceWorker] Fetch:', e.request.url);
    const response = await fetch(e.request);
    return response;

})()));
```

Add a function to register the service worker in `src/app.js`:

```javascript
async function registerServiceWorker() {
    try {
        if ('serviceWorker' in navigator) {
            // Register a service worker for the root scope
            // This means all pages within our site will defer to the service worker for HTTP requests
            const registration = await navigator.serviceWorker.register('service-worker.js', { scope: '/' });

            console.log('Service Worker registered successfully', registration);
        }
    } catch (err) {
        alert('Failed to install the service worker');
    }
}

registerServiceWorker();
```

The `registration` object is not needed for the moment, but it will come in useful later.

Our new service doesn't really do very much. It just intercepts HTTP requests from the user agent and hands back the reply unmodified.

> Add some todos in the app. Do you see the fetches happening in the log?

If you've just added your service worker script, it will not take over responsibility for handling requests immediately. This default behaviour is for consistency so that your app is either served entirely by the service worker, or entirely not, never a mix of the two. The service worker not take over until we re-open our app. 

We can however force the service worker to take over if desired by using `clients.claim()`.

> Make the following change to your service workers `activate` event:

```javascript
self.addEventListener('activate', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Activated');

    // Immediately grab clients and start handling fetches
    await clients.claim();

})()));
```

You should now see fetches happening in the log. This means your service worker is now handling HTTP requests for your app.

## Updating service workers

> Make a change to the log inside your service worker's fetch event. Do you see the change take place when you refresh?

Updated service workers to do automatically take over immediately from the previous worker. Again this is for consistency.

> Make the following change to your service workers `install` event:

```javascript
self.addEventListener('install', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Installed');

    // Don't wait for old server worker to shutdown. Instantly take over responsibility for serving requests
    skipWaiting();

})()));
```

> Refresh the page. Has the change applied now?

If we are only worried about the ease of development, the Chrome developer tools offers an "Update on reload" feature to force update your service worker whenever you refresh your page. However it is important not to become too reliant on this feature.

## Pre-emptively caching your apps assets for offline use

We need to cache your apps most important assets so it can still be loaded offline.

> Inside your `install` event use the Cache API to store the necessary assets needed for your app to function:

```javascript
    ...

    // Open the cache
    const cache = await caches.open(CacheName);

    // Add essential files like our app's assets to the cache
    console.log('[ServiceWorker] Caching cacheFiles');

    await cache.addAll(Assets);

    ...
```

There are two constants which need to be defined for the above sample code to work:

`CacheName` is the origin scoped name for your cache. You might call this `assets-v1`.

`Assets` is an array of strings which are relative paths to your apps assets. The console output from the `todo-server` will give you a hint which assets your app requires. If you want to be really smart, you can modify the server to generate this array for you.

> Inside your `fetch` event, before a remote fetch, interrogate the Cache API for a potential match and deliver it if there is one 

```javascript
    ...

    // Check in cache for the request being made
    const response = await caches.match(e.request);

    // If the request is in the cache
    if (response) {
        // Return the cached version
        console.log('[ServiceWorker] Found in Cache:', e.request.url);

        return response;
    }

    ...
```

> Are there now no longer requests to the server for assets?

> What happens when you go offline and try reloading the app?

## Provide a synthetic response

We could provide a synthetic response for the offline use case.

```javascript
    ...

    try {
        const response = await fetch(e.request);

        console.log('[ServiceWorker] Sending new response:', e.request.url);
        return response;

    } catch (err) {
        if (e.request.method === 'GET' && e.request.url.endsWith('/todos')) {
            const date = new Date();

            const data = {
                items: [{ id: -1, title: 'Check your internet connection???', complete: false, synced: true }],
                counts: { total: 1, active: 1, completed: 0 },
            };

            const json = JSON.stringify(data);

            return new Response(json, {
                headers: new Headers({
                    'content-type': 'application/json',
                    'date': date.toUTCString(),
                }),
            });
        }

        throw err;
    }

    ...
```

Whilst this is not terribly useful to the user, it does demonstrate the service worker's ability to synthesise responses from scratch. This will be useful later.

## Cache on-demand for additional resources

We can also cache on-demand those resources which aren't known about until they're requested.

> Inside your `fetch` event, immediately after the fetch itself, but before we return the response, add code to update the cache with the newly acquired response:

```javascript
        ...

        // We need to clone the response as we can only read from it once
        const requestClone = e.request.clone();
        const responseClone = response.clone();

        // Immediate invocation of anonymous async function so we don't hold up the reply...
        (async () => {
            // Open the cache
            const cache = await caches.open(CacheName);

            // Store what we just fetched
            await cache.put(requestClone, responseClone);

            console.log('[ServiceWorker] Cached new resource:', e.request.url);
        })();

        ...
```

Notice how we take clones of the request and response objects. This is because we can only read the response once and we don't want to affect the original response that will get forwarded to the navigator.

The use of an IIAFE (immediately invoked async function expression) is so that we don't hold up the delivery of the response whilst we wait for cache storage to finish writing.

> Go online and reload the app, then go offline.

The last known state of the todo list should appear, but you might be warned that the information is stale. This is true even if we go back online. This is because our service worker is configured to return a cache hit before it tries to a remote fetch.

You may also notice that issues with catching responses that are not replies to a `GET` method. This restriction is because these other methods are not idempotent and therefore forbidden from cache storage.

## Further challenges

Now try some challenges...

> Configure the service worker to always try a remote fetch to the REST API and then only fallback to cache in the event of a network failure. Asset files should always come from the cache first as these are not volatile (faster load times).

> Capture post requests when offline and store them in local storage.

### Tips

Here is how you might intercept a POST request:

```javascript
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
```

In the file `idb.js` there are some useful storage methods for persisting and retrieving todos.

> Intercept the GET requests for todos and merge in the unsynced todos.

### Tips

Here is a way to retrieve the last successful GET, and merge in the unsynced todos:

```javascript
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
```

> Add a sync event to inform the service worker to attempt to synchronise when it next can

### Tips

Here is a simple synchronisation function. It is triggered when the `todo-sync` sync tag is registered.

If it fails with a promise rejection, the sync will be rescheduled to occured at some time in the future.

```javascript
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
```

We can schedule a `todo-sync` event in our app like this...

```javascript
const registration = await navigator.serviceWorker.getRegistration()

if (registration) {
    await registration.sync.register('todo-sync');
}
```