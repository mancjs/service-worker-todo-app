name: inverse
layout: true
class: center, middle, inverse
---
template: inverse

# Introduction to Service Workers

---
layout: false

# Problem

- Complex web apps are large and slow to load
- Desire to replace need for native apps
- Patchy connections still exist (probably always will)

---
template: inverse

# Potential Solution?

What if we could ship a minature HTTP server along with our app?

---

# Meet service workers...

- Available in all modern browsers
- Effectively proxy servers, but can fulfil HTTP requests by themselves too
- Direct assess to browser cache. Your script has control: Cache / Don't cache / Expire...
- Superset of Web Workers. They run as threads, but also outlive the page lifecycle.
- Access to IndexedDB (but not Local Storage)
- Single instance per origin
- Trigger push events in your worker remotely (and display notifications)
- Coming soon (periodic sync)

---

# Service worker lifecycle

- Install event
    - Only occurs once for each version of the service worker
    - Pre-fetch vital application assets (HTML / JS / CSS files)
    - Can force upgrade of the service worker (if there is a previous service worker, optional)

- Activated event
    - Ready serve, but not necessarily serving
    - Clean up cache files from previous service worker (if there was one)
    - Can force the service worker to immediately take over browser fetches (optional)

- Fetch event
    - Occurs everytime the browser fetches a resource
    - How the service worker responds to this is entirely up to you

---
template: inverse

# Where do we store all this data?

---

# Cache Storage API...

- Programmatic access to your browser's cache
- Separate from memory / disk caches
- Request is the key, Response is the value
- Spec suggests a 'least recently used' clean up pattern (Best effort)
- Persistence can be obtained under certain circumstances
- Can also be accessed on main JavaScript thread

---

# Service worker development

In your application:

```javascript
const registration = 
    await navigator.serviceWorker.register('service-worker.js', 
    { scope: '/' }
);
```

Don't change the name of your service worker script!

Bare minimum Service Worker script (does nothing except passthrough and log):

```javascript
self.addEventListener('fetch', (e) => e.respondWith((async () => {
    console.log('[ServiceWorker] Fetch:', e.request.url);
    const response = await fetch(e.request);
    return response;
})()));
```

Using async because I (personally) prefer the syntax.

---

# Synthetic responses

Service workers can deliver responses all by themselves...

```javascript
return new Response('<p>Hello from Service Worker</p>', {
    status: 200,
    headers: new Headers({
        'content-type': 'text/html',
    }),
});
```

---

# Things to be aware of

- Requires HTTPS, but will work on localhost on HTTP
- Beware the "Vary" and "Origin" headers...
- Must be at the root of your site to be able to handle all requests
- Use the same path for your script even after updates
- Chrome honours "cache-control: max-age=..." headers for service worker script

## For development

- Use "Update on reload" feature to ensure worker script is always current
- Use "Offline" to simulate a network outage
- Chrome also offers a range of other tools to debug your workers

---

# Common service worker patterns

- Pre-fetch and deliver if available
- Deliver if available, otherwise fetch and cache, then deliver
- Always fetch first, fallback to cache if offline
- Fetch race
- Background sync of content generated whilst offline

---

# Sync event

Calling this in your app (one or many times) will enqueue a sync:

```javascript
registration.sync.register('my-sync-event');
```

Handling a sync event:

```javascript
self.addEventListener('sync', (e) => e.waitUntil((async () => {

    if (e.tag === 'my-sync-event') {
        await mySyncFunction();
    }

})()));
```

A promise rejection inside a sync event will cause the browser to reschedule.

---

# Novel service worker uses

- Polyfill support for new image formats
- Load balancing
- Serve your whole app out of a single ZIP file
- Generating placeholders
- Transpilation

    - SCSS -> CSS
    - TS -> JS
    - JSX -> JS

---

# Tutorial

Clone this repository and follow the instructions :-)

```
https://github.com/mancjs/service-worker-todo-app
```
