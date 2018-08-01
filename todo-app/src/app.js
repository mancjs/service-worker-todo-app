import Controller from './controller.js';
import { $on } from './helpers.js';
import StoreRemote from './store-remote.js';
import Template from './template.js';
import View from './view.js';

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

// const store = new StoreLocal('todos-vanilla-es6');
const store = new StoreRemote('http://localhost:8765');

const template = new Template();
const view = new View(template);

/**
 * @type {Controller}
 */
const controller = new Controller(store, view);

const setView = () => controller.setView(document.location.hash);
$on(window, 'load', setView);
$on(window, 'hashchange', setView);

registerServiceWorker();
