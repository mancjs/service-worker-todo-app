"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@koa/cors"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_send_1 = __importDefault(require("koa-send"));
const path = __importStar(require("path"));
const colors_1 = __importDefault(require("colors"));
const Port = 8765;
const AssetPath = path.join(__dirname, '..', '..', 'todo-app');
let todos = [
    { id: 1, title: 'Hello world!', completed: true },
];
const router = new koa_router_1.default();
router.use(cors_1.default({ exposeHeaders: ['date'] }));
router.use(koa_bodyparser_1.default());
function queryMatcher(query, todo) {
    return ((!('id' in query) || todo.id === parseInt(query.id, 10)) &&
        (!('completed' in query) || todo.completed === (query.completed === 'true' ? true : false)));
}
/**
 * Query todos
 */
router.get('/todos', async (ctx) => {
    const items = todos
        .filter((todo) => queryMatcher(ctx.query, todo))
        .map((todo) => (Object.assign({}, todo, { synced: true })));
    console.log(colors_1.default.green('GET Todos count: ' + items.length));
    const total = todos.length;
    const completed = todos.reduce((prev, todo) => prev + (todo.completed ? 1 : 0), 0);
    const active = total - completed;
    const counts = { total, active, completed };
    ctx.body = { items, counts };
});
/**
 * Delete a todo
 */
router.delete('/todos', async (ctx) => {
    console.log(colors_1.default.red('DELETE Todo'));
    ctx.body = todos = todos.filter((todo) => !queryMatcher(ctx.query, todo));
});
/**
 * Insert a new todo
 */
router.post('/todos', async (ctx) => {
    const todo = ctx.request.body;
    console.log(colors_1.default.blue('POST Todo ID: ' + todo.id));
    todos.push(Object.assign({}, todo));
    ctx.body = todo;
});
/**
 * Update an existing todo
 */
router.patch('/todos/:id', async (ctx) => {
    const id = parseInt(ctx.params.id);
    const changes = ctx.request.body;
    console.log(colors_1.default.yellow('PATCH Todo ID: ' + id));
    const todo = todos.find((todo) => todo.id === id);
    Object.assign(todo, changes);
    ctx.body = todo;
});
const app = new koa_1.default();
app.use(router.routes());
/**
 * Serve static assets
 */
app.use(async (ctx) => {
    console.log('Serving:', colors_1.default.cyan(ctx.path));
    const path = ctx.path !== '/' ? ctx.path : 'index.html';
    await koa_send_1.default(ctx, path, { root: AssetPath });
});
app.listen(Port);
console.info(`Listening on http://localhost:${Port}/`);
