// Minimal type declarations for the parts of the Cloudflare Workers runtime this app uses.

interface DurableObjectId {}

interface DurableObjectStub {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface DurableObjectNamespace {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId, options?: { locationHint?: string }): DurableObjectStub;
}

interface DurableObjectStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  get<T = unknown>(keys: string[]): Promise<Map<string, T>>;
  list<T = unknown>(options?: { prefix?: string; limit?: number }): Promise<Map<string, T>>;
  put(entries: Record<string, unknown>): Promise<void>;
  delete(keys: string[]): Promise<number>;
  deleteAll(): Promise<void>;
  getAlarm(): Promise<number | null>;
  setAlarm(scheduledTime: number): Promise<void>;
  deleteAlarm(): Promise<void>;
}

interface CfWebSocket extends WebSocket {
  serializeAttachment(value: unknown): void;
  deserializeAttachment(): unknown;
}

interface DurableObjectState {
  storage: DurableObjectStorage;
  blockConcurrencyWhile<T>(fn: () => Promise<T>): Promise<T>;
  acceptWebSocket(ws: WebSocket, tags?: string[]): void;
  getWebSockets(tag?: string): CfWebSocket[];
  setWebSocketAutoResponse(pair?: WebSocketRequestResponsePair): void;
  getWebSocketAutoResponseTimestamp(ws: WebSocket): Date | null;
}

declare class WebSocketRequestResponsePair {
  constructor(request: string, response: string);
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

declare class WebSocketPair {
  0: WebSocket;
  1: CfWebSocket;
}

interface ResponseInit {
  webSocket?: WebSocket | null;
}
