import { ItemList } from './item.js';
import { qs, $on, $delegate } from './helpers.js';
import Template from './template.js';

/** @type {(element: HTMLElement) => number} */
const _itemId = element => {
	const { parentNode } = element;

	if (parentNode instanceof HTMLLIElement && parentNode.dataset.id) {
		return parseInt(parentNode.dataset.id, 10);
	}

	throw new Error('ID on LI element not found');
}

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

export default class View {
	/**
	 * @param {!Template} template A Template instance
	 */
	constructor(template) {
		this.template = template;
		this.$todoList = qs('.todo-list');
		this.$todoListDate = qs('.todo-list-date');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$toggleAll = /** @type {HTMLInputElement} */ (qs('.toggle-all'));
		this.$newTodo = /** @type {HTMLInputElement} */ (qs('.new-todo'));
		$delegate(this.$todoList, 'li label', 'dblclick', ({ target }) => {
			this.editItem(/** @type {HTMLLabelElement} */(target));
		});
	}


	/**
	 * Put an item into edit mode.
	 *
	 * @param {!HTMLLabelElement} target Target Item's label Element
	 */
	editItem(target) {
		const listItem = target.parentElement;

		if (!(listItem instanceof HTMLLIElement)) throw new Error('Not an LI element');

		listItem.classList.add('editing');

		const input = document.createElement('input');
		input.className = 'edit';

		input.value = target.innerText;
		listItem.appendChild(input);
		input.focus();
	}

	/**
	 * Populate the todo list with a list of items.
	 *
	 * @param {ItemList} items Array of items to display
	 * @param {Date} date Date data was retrieved
	 */
	showItems(items, date) {
		const secondsOld = Math.floor((new Date().getTime() - date.getTime()) / 1000);

		this.$todoList.innerHTML = this.template.itemList(items);
		this.$todoListDate.innerHTML = `Retrieved ${secondsOld} seconds ago`;

		if (secondsOld > 5) {
			this.$todoListDate.innerHTML += ' <b>Warning, this information is stale!</b>';
		}
	}

	/**
	 * Remove an item from the view.
	 *
	 * @param {number} id Item ID of the item to remove
	 */
	removeItem(id) {
		const elem = qs(`[data-id="${id}"]`);

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	}

	/**
	 * Set the number in the 'items left' display.
	 *
	 * @param {number} itemsLeft Number of items left
	 */
	setItemsLeft(itemsLeft) {
		this.$todoItemCounter.innerHTML = this.template.itemCounter(itemsLeft);
	}

	/**
	 * Set the visibility of the "Clear completed" button.
	 *
	 * @param {boolean|number} visible Desired visibility of the button
	 */
	setClearCompletedButtonVisibility(visible) {
		this.$clearCompleted.style.display = !!visible ? 'block' : 'none';
	}

	/**
	 * Set the visibility of the main content and footer.
	 *
	 * @param {boolean|number} visible Desired visibility
	 */
	setMainVisibility(visible) {
		this.$main.style.display = !!visible ? 'block' : 'none';
	}

	/**
	 * Set the checked state of the Complete All checkbox.
	 *
	 * @param {boolean|number} checked The desired checked state
	 */
	setCompleteAllCheckbox(checked) {
		this.$toggleAll.checked = !!checked;
	}

	/**
	 * Change the appearance of the filter buttons based on the route.
	 *
	 * @param {string} route The current route
	 */
	updateFilterButtons(route) {
		qs('.filters>.selected').className = '';
		qs(`.filters>[href="#/${route}"]`).className = 'selected';
	}

	/**
	 * Clear the new todo input
	 */
	clearNewTodo() {
		this.$newTodo.value = '';
	}

	/**
	 * Render an item as either completed or not.
	 *
	 * @param {!number} id Item ID
	 * @param {!boolean} completed True if the item is completed
	 */
	setItemComplete(id, completed) {
		const listItem = qs(`[data-id="${id}"]`);

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		/** @type {HTMLInputElement} */ (qs('input', listItem)).checked = completed;
	}

	/**
	 * Bring an item out of edit mode.
	 *
	 * @param {!number} id Item ID of the item in edit
	 * @param {!string} title New title for the item in edit
	 */
	editItemDone(id, title) {
		const listItem = qs(`[data-id="${id}"]`);

		const input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.classList.remove('editing');

		qs('label', listItem).textContent = title;
	}

	/**
	 * @param {(title: string) => void} handler Function called on synthetic event.
	 */
	bindAddItem(handler) {
		$on(this.$newTodo, 'change', ({ target }) => {
			const title = /** @type {HTMLInputElement} */ (target).value.trim();
			if (title) {
				handler(title);
			}
		});
	}

	/**
	 * @param {EventListener} handler Function called on synthetic event.
	 */
	bindRemoveCompleted(handler) {
		$on(this.$clearCompleted, 'click', handler);
	}

	/**
	 * @param {(completed: boolean) => void} handler Function called on synthetic event.
	 */
	bindToggleAll(handler) {
		$on(this.$toggleAll, 'click', ({ target }) => {
			handler(/** @type {HTMLInputElement} */(target).checked);
		});
	}

	/**
	 * @param {(id: number) => void} handler Function called on synthetic event.
	 */
	bindRemoveItem(handler) {
		$delegate(this.$todoList, '.destroy', 'click', ({ target }) => {
			if (!(target instanceof HTMLButtonElement)) throw new Error('Not an input element');

			handler(_itemId(target));
		});
	}

	/**
	 * @param {(id: number, completed: boolean) => void} handler Function called on synthetic event.
	 */
	bindToggleItem(handler) {
		$delegate(this.$todoList, '.toggle', 'click', ({ target }) => {
			if (!(target instanceof HTMLInputElement)) throw new Error('Not an input element');

			handler(_itemId(target), (target).checked);
		});
	}

	/**
	 * @param {(id: number, title: string) => void} handler Function called on synthetic event.
	 */
	bindEditItemSave(handler) {
		$delegate(this.$todoList, 'li .edit', 'blur', ({ target }) => {
			if (!(target instanceof HTMLInputElement)) throw new Error('Not an input element');

			if (!(target).dataset.iscanceled) {
				handler(_itemId(target), (target).value.trim());
			}
		}, true);

		// Remove the cursor from the input when you hit enter just like if it were a real form
		$delegate(this.$todoList, 'li .edit', 'keypress', ({ target, keyCode }) => {
			if (keyCode === ENTER_KEY) {
				/** @type {HTMLInputElement} */ (target).blur();
			}
		});
	}

	/**
	 * @param {(id: number) => void} handler Function called on synthetic event.
	 */
	bindEditItemCancel(handler) {
		$delegate(this.$todoList, 'li .edit', 'keyup', ({ target, keyCode }) => {
			if (!(target instanceof HTMLInputElement)) throw new Error('Not an input element');

			if (keyCode === ESCAPE_KEY) {
				target.dataset.iscanceled = 'true';
				target.blur();

				handler(_itemId(target));
			}
		});
	}
}
