import { ItemInsert, ItemQuery, ItemUpdate, Store } from './item.js';

export class NetworkError extends Error {
    /**
     * @param {string} message 
     * @param {Error} innerError
     */
    constructor(message, innerError) {
        super(message);

        this.innerError = innerError;
    }
}

export class ServerError extends Error {
    /**
     * @param {string} message 
     * @param {number} statusCode
     * @param {string} statusText 
     */
    constructor(message, statusCode, statusText) {
        super(message);

        this.statusCode = statusCode;
        this.statusText = statusText;
    }
}

export default class StoreRemote {
	/**
	 * @param {!string} baseUrl Endpoint URL
	 */
    constructor(baseUrl) {
        /**
         * Assert that this class correctly implements Store.
         * @type {Store}
         */
        const instance = this;

        this.baseUrl = baseUrl;
    }

    /**
     * @param {string} method
     * @param {string} path
     * @param {object?} data
     * @returns {Promise<{ json: T, date: Date }>}
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

        let response;

        try {
            response = await fetch(url, options);
        } catch (err) {
            throw new NetworkError('Could not fetch', err);
        }

        if (!response.ok) {
            throw new ServerError('Server responded with an error', response.status, response.statusText);
        }

        const dateString = response.headers.get('date');

        if (!dateString) throw new Error('No date header');

        const date = new Date(dateString);
        const json = await response.json();

        return {
            json,
            date,
        };
    }

	/**
	 * Find items with properties matching those on query.
	 *
	 * @param {ItemQuery} query Query to match
	 */
    async find(query) {
        const { json: { items, counts }, date } = await this.remoteRequest('GET', 'todos', query);

        return {
            items,
            counts,
            date,
        };
    }

	/**
	 * Update an item in the Store.
	 *
	 * @param {Partial<ItemUpdate>} update Record with an id and a property to update
	 */
    async update(update) {
        await this.remoteRequest('PATCH', `todos/${update.id}`, update);
    }

	/**
	 * Insert an item into the Store.
	 *
	 * @param {ItemInsert} item Item to insert
	 */
    async insert(item) {
        await this.remoteRequest('POST', 'todos', item);
    }

	/**
	 * Remove items from the Store based on a query.
	 *
	 * @param {ItemQuery} query Query matching the items to remove
	 */
    async remove(query) {
        await this.remoteRequest('DELETE', 'todos', query);
    }
}
