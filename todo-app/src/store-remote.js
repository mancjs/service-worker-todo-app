import { Item, ItemList, ItemQuery, ItemUpdate, emptyItemQuery } from './item.js';

export default class StoreRemote {
	/**
	 * @param {!string} baseUrl Endpoint URL
	 */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * @param {string} method
     * @param {string} path
     * @param {object?} data
     * @returns {Promise<T>}
     * @template T
     */
    async remoteRequest(method, path, data = undefined) {
        /** @type RequestInit */
        const options = {
            method,
        };

        let queryString;

        if (data) {
            if (method === 'GET' || method === 'DELETE') {
                queryString = Object.keys(data).map((key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
                ).join('&');
            } else {
                options.body = JSON.stringify(data);
                options.headers = new Headers({ 'content-type': 'application/json' });
            }
        }

        const url = `${this.baseUrl}/${path}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, options);

        return await response.json();
    }

	/**
	 * Find items with properties matching those on query.
	 *
	 * @param {ItemQuery} query Query to match
	 */
    async find(query) {
        return await this.remoteRequest('GET', 'todos', query);
    }

	/**
	 * Update an item in the Store.
	 *
	 * @param {ItemUpdate} update Record with an id and a property to update
	 */
    async update(update) {
        return await this.remoteRequest('PATCH', `todos/${update.id}`, update);
    }

	/**
	 * Insert an item into the Store.
	 *
	 * @param {Item} item Item to insert
	 */
    async insert(item) {
        return await this.remoteRequest('POST', 'todos', item);
    }

	/**
	 * Remove items from the Store based on a query.
	 *
	 * @param {ItemQuery} query Query matching the items to remove
	 */
    async remove(query) {
        return await this.remoteRequest('DELETE', 'todos', query);
    }

	/**
	 * Count total, active, and completed todos.
	 */
    async count() {
        return await this.remoteRequest('GET', 'todos/count');
    }
}
