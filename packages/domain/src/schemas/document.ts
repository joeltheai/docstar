import { Brand, Schema } from "effect"

export const DocumentId = Schema.String.pipe(Schema.brand("DocumentId"))
export type DocumentId = string & Brand.Brand<"DocumentId">

export class DocumentMeta extends Schema.Class<DocumentMeta>("DocumentMeta")({
  id: DocumentId,
  title: Schema.String,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
}) {}

export class CreateDocumentRequest extends Schema.Class<CreateDocumentRequest>(
  "CreateDocumentRequest"
)({
  title: Schema.optional(Schema.String)
}) {}

export class UpdateTitleRequest extends Schema.Class<UpdateTitleRequest>("UpdateTitleRequest")({
  title: Schema.String.check(Schema.isMinLength(1))
}) {}

export class DocumentList extends Schema.Class<DocumentList>("DocumentList")({
  documents: Schema.Array(DocumentMeta)
}) {}
