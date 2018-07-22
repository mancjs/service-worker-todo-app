import Controller from './controller.mjs';
import {$on} from './helpers.mjs';
import Template from './template.mjs';
import Store from './store.mjs';
import View from './view.mjs';

const store = new Store('todos-vanilla-es6');

const template = new Template();
const view = new View(template);

/**
 * @type {Controller}
 */
const controller = new Controller(store, view);

const setView = () => controller.setView(document.location.hash);
$on(window, 'load', setView);
$on(window, 'hashchange', setView);
