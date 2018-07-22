import { Item, ItemList, ItemQuery, ItemUpdate, emptyItemQuery } from './item.js';

export default class Store {
	/**
	 * @param {!string} name Database name
	 */
	constructor(name) {
		/**
		 * @type {Storage}
		 */
		const localStorage = window.localStorage;

		/**
		 * @type {ItemList}
		 */
		let liveTodos;

		/**
		 * Read the local ItemList from localStorage.
		 *
		 * @returns {ItemList} Current array of todos
		 */
		this.getLocalStorage = () => {
			return liveTodos || JSON.parse(localStorage.getItem(name) || '[]');
		};

		/**
		 * Write the local ItemList to localStorage.
		 *
		 * @param {ItemList} todos Array of todos to write
		 */
		this.setLocalStorage = (todos) => {
			localStorage.setItem(name, JSON.stringify(liveTodos = todos));
		};
	}

	/**
	 * Find items with properties matching those on query.
	 *
	 * @param {ItemQuery} query Query to match
	 *
	 * @example
	 * db.find({completed: true}, data => {
	 *	 // data shall contain items whose completed properties are true
	 * })
	 */
	async find(query) {
		const todos = this.getLocalStorage();

		/**
		 * @type {keyof ItemQuery}
		 */
		let k;

		return todos.filter(todo => {
			for (k in query) {
				if (query[k] !== todo[k]) {
					return false;
				}
			}
			return true;
		});
	}

	/**
	 * Update an item in the Store.
	 *
	 * @param {ItemUpdate} update Record with an id and a property to update
	 */
	async update(update) {
		const id = update.id;
		const todos = this.getLocalStorage();
		let i = todos.length;

		/**
		 * @type {keyof ItemUpdate}
		 */
		let k;

		while (i--) {
			if (todos[i].id === id) {
				for (k in update) {
					todos[i][k] = update[k];
				}
				break;
			}
		}

		this.setLocalStorage(todos);
	}

	/**
	 * Insert an item into the Store.
	 *
	 * @param {Item} item Item to insert
	 */
	async insert(item) {
		const todos = this.getLocalStorage();
		todos.push(item);
		this.setLocalStorage(todos);
	}

	/**
	 * Remove items from the Store based on a query.
	 *
	 * @param {ItemQuery} query Query matching the items to remove
	 */
	async remove(query) {
		/**
		 * @type {keyof ItemQuery}
		 */
		let k;

		const todos = this.getLocalStorage().filter(todo => {
			for (k in query) {
				if (query[k] !== todo[k]) {
					return true;
				}
			}
			return false;
		});

		this.setLocalStorage(todos);

		return todos;
	}

	/**
	 * Count total, active, and completed todos.
	 */
	async count() {
		const data = await this.find(emptyItemQuery);
		const total = data.length;

		let i = total;
		let completed = 0;

		while (i--) {
			completed += data[i].completed ? 1 : 0;
		}

		const active = total - completed;

		return { total, active, completed };
	}
}
