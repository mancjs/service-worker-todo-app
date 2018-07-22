/**
 * @typedef {!{id: number, completed: boolean, title: string}} Item
 * @type {any}
 */
export var Item;

/**
 * @typedef {!Array<Item>} ItemList
 * @type {any}
 */
export var ItemList;

/**
 * Enum containing a known-empty record type, matching only empty records unlike Object.
 *
 * @type {{Record: {}}}
 */
const Empty = {
	Record: {}
};

/**
 * Empty ItemQuery type
 *
 * @typedef {{}} EmptyItemQuery
 * @type {any}
 */
export var EmptyItemQuery;

/**
 * Reference to the only EmptyItemQuery instance.
 *
 * @type {ItemQuery}
 */
export const emptyItemQuery = Empty.Record;

/**
 * @typedef {!({id?: number, completed?: boolean})} ItemQuery
 * @type {any}
 */
export var ItemQuery;

/**
 * @typedef {!({id: number, title: string}|{id: number, completed: boolean})} ItemUpdate
 * @type {any}
 */
export var ItemUpdate;
