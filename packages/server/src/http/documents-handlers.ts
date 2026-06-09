import { DocstarApi, DocumentId, DocumentList } from "@docstar/domain"
import { Effect, Layer } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { DocumentRepository, DocumentRepositoryLive } from "../db/DocumentRepository.ts"

export const DocumentsHandlers = HttpApiBuilder.group(DocstarApi, "documents", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.gen(function* () {
        const repo = yield* DocumentRepository
        const documents = yield* repo.list()
        return new DocumentList({ documents })
      })
    )
    .handle("create", ({ payload }) =>
      Effect.gen(function* () {
        const repo = yield* DocumentRepository
        return yield* repo.create(payload)
      })
    )
    .handle("get", ({ params }) =>
      Effect.gen(function* () {
        const repo = yield* DocumentRepository
        return yield* repo.get(params.id as DocumentId)
      })
    )
    .handle("updateTitle", ({ params, payload }) =>
      Effect.gen(function* () {
        const repo = yield* DocumentRepository
        return yield* repo.updateTitle(params.id as DocumentId, payload)
      })
    )
    .handle("delete", ({ params }) =>
      Effect.gen(function* () {
        const repo = yield* DocumentRepository
        yield* repo.delete(params.id as DocumentId)
      })
    )
).pipe(Layer.provide(DocumentRepositoryLive))
