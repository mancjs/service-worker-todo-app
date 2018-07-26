/**
 * @typedef {!{id: number, completed: boolean, title: string}} Item
 */
export var Item = 0;

/**
 * @typedef {!Array<Item>} ItemList
 */
export var ItemList = 0;

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
 */
export var EmptyItemQuery = 0;

/**
 * Reference to the only EmptyItemQuery instance.
 *
 * @type {ItemQuery}
 */
export const emptyItemQuery = Empty.Record;

/**
 * @typedef {!({id?: number, completed?: boolean})} ItemQuery
 */
export var ItemQuery = 0;

/**
 * @typedef {!({id: number, title: string}|{id: number, completed: boolean})} ItemUpdate
 */
export const ItemUpdate = 0;

/**
 * @typedef FindResult
 * @property items {ItemList}
 * @property counts {{ total: number, active: number, completed: number }}
 * @property date {Date}
 */
export const FindResult = 0;


/**
 * @typedef Store
 * @property find {(query: ItemQuery) => Promise<FindResult>}
 * @property update {(update: ItemUpdate) => Promise<void>}
 * @property insert {(item: Item) => Promise<void>}
 * @property remove {(query: ItemQuery) => Promise<void>}
 */
export const Store = 0;
