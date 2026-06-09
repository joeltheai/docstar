# Docstar

Collaborative document editor built with React, Effect v4, TipTap, and Yjs.

## Stack

- **Frontend**: React 19, `@effect/atom-react`, TipTap 3, Yjs, `y-websocket`, `y-indexeddb`
- **Backend**: Effect v4 HttpApi, SQLite (`better-sqlite3`), Yjs WebSocket + `y-leveldb`
- **Shared contracts**: `@docstar/domain` with Effect Schema + HttpApi definitions

## Development

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

- Web app: http://localhost:5173
- API: http://localhost:3001/api
- Yjs WebSocket: ws://localhost:3002 (proxied via Vite at `/yjs`)

Open the same document in two tabs to test real-time collaboration.
