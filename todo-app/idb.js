/**
 * Use IndexedDB to perform a transaction
 * @param {(store: IDBObjectStore) => void} useStore 
 */
function getDb(useStore) {
    return new Promise((resolve) => {
        // Open (or create) the database
        const open = indexedDB.open('MyDatabase', 1);

        // Create the schema
        open.onupgradeneeded = function () {
            /**
             * @type {IDBDatabase}
             */
            const db = open.result;

            db.createObjectStore('todos', { keyPath: 'id' });
        };

        open.onsuccess = () => {
            // Start a new transaction

            /**
             * @type {IDBDatabase}
             */
            const db = open.result;

            const tx = db.transaction('todos', 'readwrite');
            const store = tx.objectStore('todos');

            useStore(store);

            tx.oncomplete = () => {
                db.close();

                resolve();
            };
        }
    });
}

/**
 * @returns {Promise<Item[]>}
 */
async function getUnsyncedTodos() {
    /**
     * @type {Item[]}
     */
    const todos = [];

    await getDb((store) => {
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (e) => {
            // @ts-ignore
            const cursor = e.target.result;

            if (cursor) {
                todos.push(cursor.value);

                cursor.continue();
            }
        };
    });

    return todos;
}

/**
 * Store a todo in local storage
 * @param {Item} todo 
 */
async function storeUnsyncedTodo(todo) {
    await getDb((store) => {
        store.put(todo);
    });
}

async function clearUnsyncedTodos() {
    await getDb((store) => {
        store.clear();
    });
}
