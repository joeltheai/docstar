import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)
const yWebsocketRoot = dirname(require.resolve("y-websocket/package.json"))
const utils = require(join(yWebsocketRoot, "bin/utils.cjs")) as {
  setupWSConnection: (
    conn: import("ws").WebSocket,
    req: import("node:http").IncomingMessage,
    opts?: { docName?: string; gc?: boolean }
  ) => void
  setPersistence: (persistence: {
    provider: unknown
    bindState: (docName: string, ydoc: import("yjs").Doc) => Promise<void>
    writeState: (docName: string, ydoc: import("yjs").Doc) => Promise<void>
  }) => void
}

export const setupWSConnection = utils.setupWSConnection
export const setPersistence = utils.setPersistence
