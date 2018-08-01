interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface ServiceWorkerNotificationOptions {
  tag?: string;
}

interface ServiceWorkerRegistration {
  getNotifications(options?: ServiceWorkerNotificationOptions): Promise<Array<Notification>>;
  update(): void;
  unregister(): Promise<boolean>;
}

interface ServiceWorkerRegistrationOptions {
  scope?: string;
}

// CacheStorage API

interface Cache {
  add(request: Request): Promise<void>;
  addAll(requestArray: Array<Request>): Promise<void>;
  'delete'(request: Request, options?: CacheStorageOptions): Promise<boolean>;
  keys(request?: Request, options?: CacheStorageOptions): Promise<Array<string>>;
  match(request: Request, options?: CacheStorageOptions): Promise<Response>;
  matchAll(request: Request, options?: CacheStorageOptions): Promise<Array<Response>>;
  put(request: Request | string, response: Response): Promise<void>;
}

interface CacheStorage {
  'delete'(cacheName: string): Promise<boolean>;
  has(cacheName: string): Promise<boolean>;
  keys(): Promise<Array<string>>;
  match(request: Request, options?: CacheStorageOptions): Promise<Response>;
  open(cacheName: string): Promise<Cache>;
}

interface CacheStorageOptions {
  cacheName?: string;
  ignoreMethod?: boolean;
  ignoreSearch?: boolean;
  ignoreVary?: boolean;
}

// Client API

interface Client {
  frameType: ClientFrameType;
  id: string;
  url: string;
}

interface Clients {
  claim(): Promise<any>;
  get(id: string): Promise<Client>;
  matchAll(options?: ClientMatchOptions): Promise<Array<Client>>;
  openWindow(url: string): Promise<WindowClient>;
}

interface ClientMatchOptions {
  includeUncontrolled?: boolean;
  type?: ClientMatchTypes;
}

interface WindowClient {
  focused: boolean;
  visibilityState: WindowClientState;
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient>;
}

type ClientFrameType = "auxiliary" | "top-level" | "nested" | "none";
type ClientMatchTypes = "window" | "worker" | "sharedworker" | "all";
type WindowClientState = "hidden" | "visible" | "prerender" | "unloaded";

// Fetch API

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
}

interface InstallEvent extends ExtendableEvent {
  activeWorker: ServiceWorker
}

interface ActivateEvent extends ExtendableEvent {
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

// ServiceWorkerGlobalScope

declare var caches: CacheStorage;
declare var clients: Clients;
declare var registration: ServiceWorkerRegistration;

declare function skipWaiting(): void;

declare function importScripts(...scripts: string[]): void;

interface ExtendableEventListener<T extends ExtendableEvent> {
  (e: T): void;
}

interface Window {
  addEventListener(type: 'install', listener: (e: InstallEvent) => void): void;
  addEventListener(type: 'activate', listener: (e: ActivateEvent) => void): void;
  addEventListener(type: 'fetch', listener: (e: FetchEvent) => void): void;
  addEventListener(type: 'sync', listener: (e: SyncEvent) => void): void;
}

// IndexedDB stuff...

declare interface Item {
  id: number;
  completed: boolean;
  title: string;
  synced: boolean;
}

declare function getUnsyncedTodos(): Promise<Item[]>;
declare function storeUnsyncedTodo(item: Item): Promise<void>;
declare function clearUnsyncedTodos(): Promise<void>;
