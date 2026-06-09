import { createServer } from "node:http"
import { WebSocketServer } from "ws"
import { setupWSConnection } from "./utils.ts"
import { initYjsPersistence } from "./persistence.ts"

const PORT = Number(process.env.YJS_PORT ?? 3002)
const HOST = process.env.HOST ?? "127.0.0.1"

export const startYjsServer = () => {
  initYjsPersistence()

  const wss = new WebSocketServer({ noServer: true })

  const server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" })
    response.end("docstar yjs")
  })

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`)

    wss.handleUpgrade(request, socket, head, (ws) => {
      const docName = url.pathname.replace(/^\//, "").split("?")[0] ?? ""
      if (!docName) {
        ws.close()
        return
      }
      setupWSConnection(ws, request, { docName, gc: true })
    })
  })

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Yjs port ${PORT} is already in use`)
      return
    }
    throw error
  })

  server.listen(PORT, HOST, () => {
    console.log(`Yjs WebSocket server running at ws://${HOST}:${PORT}`)
  })

  return server
}
