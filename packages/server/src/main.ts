import { createServer } from "node:http"
import { DocstarApi } from "@docstar/domain"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { DocumentRepositoryLive } from "./db/DocumentRepository.ts"
import { DocumentsHandlers } from "./http/documents-handlers.ts"
import { startYjsServer } from "./yjs/server.ts"

const PORT = Number(process.env.PORT ?? 3001)
const HOST = process.env.HOST ?? "127.0.0.1"

const AppLayer = HttpApiBuilder.layer(DocstarApi).pipe(Layer.provide(DocumentsHandlers))

const ServerLayer = HttpRouter.serve(AppLayer, {
  disableLogger: false
}).pipe(
  Layer.provide(DocumentRepositoryLive),
  Layer.provide(NodeHttpServer.layer(() => createServer(), { port: PORT, host: HOST }))
)

console.log(`Docstar API running at http://${HOST}:${PORT}`)

startYjsServer()

Layer.launch(ServerLayer).pipe(NodeRuntime.runMain)
