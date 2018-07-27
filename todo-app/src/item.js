/**
 * The variables in this file are not real variables but are placeholders to allow type information to be exported.
 */

/**
 * @typedef {!{id: number, completed: boolean, title: string, synced: boolean}} Item
 */
export var Item = 0;

/**
 * @typedef {!Array<Item>} ItemList
 */
export var ItemList = 0;

/**
 * Empty ItemQuery type
 *
 * @typedef {{}} EmptyItemQuery
 */
export var EmptyItemQuery = 0;

/**
 * Reference to the only EmptyItemQuery instance.
 *
 * @type {!ItemQuery}
 */
export const emptyItemQuery = Object.freeze({});

/**
 * @typedef {!({id?: number, completed?: boolean})} ItemQuery
 */
export var ItemQuery = 0;

/**
 * @typedef {!{id: number, completed: boolean, title: string}} ItemInsert
 */
export var ItemInsert = 0;

/**
 * @typedef {!({id: number, title: string}|{id: number, completed: boolean})} ItemUpdate
 */
export var ItemUpdate = 0;

/**
 * @typedef FindResult
 * @property items {ItemList}
 * @property counts {{ total: number, active: number, completed: number }}
 * @property date {Date}
 */
export var FindResult = 0;


/**
 * @typedef Store
 * @property find {(query: ItemQuery) => Promise<FindResult>}
 * @property update {(update: ItemUpdate) => Promise<void>}
 * @property insert {(item: ItemInsert) => Promise<void>}
 * @property remove {(query: ItemQuery) => Promise<void>}
 */
export var Store = 0;
