import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import send from 'koa-send';
import * as path from 'path';
import colors from 'colors';

const Port = 8765;

const AssetPath = path.join(__dirname, '..', '..', 'todo-app');

interface Todo {
  id: number;
  completed: boolean;
  title: string;
}

let todos: Todo[] = [
  { id: 1, title: 'Hello world!', completed: true },
];

const router = new Router();

router.use(cors({ exposeHeaders: ['date'] }));
router.use(bodyParser());

function queryMatcher(query: { [key: string]: string }, todo: Todo) {
  return (
    (!('id' in query) || todo.id === parseInt(query.id, 10)) &&
    (!('completed' in query) || todo.completed === (query.completed === 'true' ? true : false))
  );
}

/**
 * Query todos
 */
router.get('/todos', async (ctx) => {
  const items = todos
    .filter((todo) => queryMatcher(ctx.query, todo))
    .map((todo) => ({ ...todo, synced: true }));

  console.log(colors.green('GET Todos count: ' + items.length));

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
  console.log(colors.red('DELETE Todo'));

  ctx.body = todos = todos.filter((todo) => !queryMatcher(ctx.query, todo));
});

/**
 * Insert a new todo
 */
router.post('/todos', async (ctx) => {
  const todo = ctx.request.body as Todo;

  console.log(colors.blue('POST Todo ID: ' + todo.id));

  todos.push({ ...todo });

  ctx.body = todo;
});

/**
 * Update an existing todo
 */
router.patch('/todos/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const changes = ctx.request.body as Partial<Todo>;

  console.log(colors.yellow('PATCH Todo ID: ' + id));

  const todo = todos.find((todo) => todo.id === id);

  Object.assign(todo, changes);

  ctx.body = todo;
});

const app = new Koa();

app.use(router.routes());

/**
 * Serve static assets
 */
app.use(async (ctx) => {
  console.log('Serving:', colors.cyan(ctx.path));

  const path = ctx.path !== '/' ? ctx.path : 'index.html';

  await send(ctx, path, { root: AssetPath });
});

app.listen(Port);

console.info(`Listening on http://localhost:${Port}/`);
