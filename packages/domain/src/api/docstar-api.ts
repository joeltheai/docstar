import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"
import { Schema } from "effect"
import {
  CreateDocumentRequest,
  DocumentList,
  DocumentMeta,
  UpdateTitleRequest
} from "../schemas/document.ts"
import { DocumentNotFound, PersistenceError } from "../schemas/errors.ts"

export class DocumentsApi extends HttpApiGroup.make("documents")
  .add(
    HttpApiEndpoint.get("list", "/documents", {
      success: DocumentList,
      error: PersistenceError
    })
  )
  .add(
    HttpApiEndpoint.post("create", "/documents", {
      payload: CreateDocumentRequest,
      success: DocumentMeta,
      error: PersistenceError
    })
  )
  .add(
    HttpApiEndpoint.get("get", "/documents/:id", {
      params: { id: Schema.String },
      success: DocumentMeta,
      error: [DocumentNotFound, PersistenceError]
    })
  )
  .add(
    HttpApiEndpoint.patch("updateTitle", "/documents/:id", {
      params: { id: Schema.String },
      payload: UpdateTitleRequest,
      success: DocumentMeta,
      error: [DocumentNotFound, PersistenceError]
    })
  )
  .add(
    HttpApiEndpoint.delete("delete", "/documents/:id", {
      params: { id: Schema.String },
      success: Schema.Void,
      error: [DocumentNotFound, PersistenceError]
    })
  )
{}

export class DocstarApi extends HttpApi.make("docstar").add(DocumentsApi).prefix("/api") {}
