import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"
import {
  CreateDocumentRequest,
  DocumentId,
  DocumentMeta,
  DocumentNotFound,
  PersistenceError,
  UpdateTitleRequest
} from "@docstar/domain"
import { DateTime, Effect, Layer, ServiceMap } from "effect"

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDbPath = join(__dirname, "../../../data/docstar.db")

interface DocumentRow {
  readonly id: string
  readonly title: string
  readonly created_at: string
  readonly updated_at: string
  readonly deleted_at: string | null
}

const rowToMeta = (row: DocumentRow): DocumentMeta =>
  new DocumentMeta({
    id: row.id as DocumentId,
    title: row.title,
    createdAt: DateTime.makeUnsafe(row.created_at),
    updatedAt: DateTime.makeUnsafe(row.updated_at)
  })

export class DocumentRepository extends ServiceMap.Service<
  DocumentRepository,
  {
    readonly list: () => Effect.Effect<ReadonlyArray<DocumentMeta>, PersistenceError>
    readonly create: (
      request: CreateDocumentRequest
    ) => Effect.Effect<DocumentMeta, PersistenceError>
    readonly get: (id: DocumentId) => Effect.Effect<DocumentMeta, DocumentNotFound | PersistenceError>
    readonly updateTitle: (
      id: DocumentId,
      request: UpdateTitleRequest
    ) => Effect.Effect<DocumentMeta, DocumentNotFound | PersistenceError>
    readonly delete: (id: DocumentId) => Effect.Effect<void, DocumentNotFound | PersistenceError>
  }
>()("DocumentRepository") {}

const makeRepository = (dbPath: string) =>
  Effect.sync(() => {
    mkdirSync(dirname(dbPath), { recursive: true })
    const db = new Database(dbPath)
    db.pragma("journal_mode = WAL")

    const listStmt = db.prepare(`
      SELECT id, title, created_at, updated_at, deleted_at
      FROM documents
      WHERE deleted_at IS NULL
      ORDER BY updated_at DESC
    `)

    const getStmt = db.prepare(`
      SELECT id, title, created_at, updated_at, deleted_at
      FROM documents
      WHERE id = ? AND deleted_at IS NULL
    `)

    const insertStmt = db.prepare(`
      INSERT INTO documents (id, title, created_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, NULL)
    `)

    const updateTitleStmt = db.prepare(`
      UPDATE documents
      SET title = ?, updated_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `)

    const deleteStmt = db.prepare(`
      UPDATE documents
      SET deleted_at = ?, updated_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `)

    const wrap = <A>(fn: () => A): Effect.Effect<A, PersistenceError> =>
      Effect.try({
        try: fn,
        catch: (cause) =>
          new PersistenceError({
            message: cause instanceof Error ? cause.message : "Database error"
          })
      })

    return DocumentRepository.of({
      list: () =>
        wrap(() => (listStmt.all() as Array<DocumentRow>).map(rowToMeta)),

      create: (request) =>
        wrap(() => {
          const now = DateTime.formatIso(DateTime.nowUnsafe())
          const id = crypto.randomUUID() as DocumentId
          const title = request.title ?? "Untitled document"
          insertStmt.run(id, title, now, now)
          const timestamp = DateTime.makeUnsafe(now)
          return new DocumentMeta({
            id,
            title,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        }),

      get: (id) =>
        Effect.gen(function* () {
          const row = yield* wrap(() => getStmt.get(id) as DocumentRow | undefined)
          if (row === undefined) {
            return yield* Effect.fail(new DocumentNotFound({ documentId: id }))
          }
          return rowToMeta(row)
        }),

      updateTitle: (id, request) =>
        Effect.gen(function* () {
          const now = DateTime.formatIso(DateTime.nowUnsafe())
          const result = yield* wrap(() => updateTitleStmt.run(request.title, now, id))
          if (result.changes === 0) {
            return yield* Effect.fail(new DocumentNotFound({ documentId: id }))
          }
          const row = yield* wrap(() => getStmt.get(id) as DocumentRow | undefined)
          if (row === undefined) {
            return yield* Effect.fail(new DocumentNotFound({ documentId: id }))
          }
          return rowToMeta(row)
        }),

      delete: (id) =>
        Effect.gen(function* () {
          const now = DateTime.formatIso(DateTime.nowUnsafe())
          const result = yield* wrap(() => deleteStmt.run(now, now, id))
          if (result.changes === 0) {
            return yield* Effect.fail(new DocumentNotFound({ documentId: id }))
          }
        })
    })
  })

export const DocumentRepositoryLive = Layer.effect(
  DocumentRepository,
  makeRepository(process.env.DOCSTAR_DB_PATH ?? defaultDbPath)
)
