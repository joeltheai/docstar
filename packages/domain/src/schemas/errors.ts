import { Schema } from "effect"
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema"

export class DocumentNotFound extends Schema.TaggedErrorClass<DocumentNotFound>()(
  "DocumentNotFound",
  {
    documentId: Schema.String
  },
  { httpApiStatus: 404 }
) {}

export class PersistenceError extends Schema.TaggedErrorClass<PersistenceError>()(
  "PersistenceError",
  {
    message: Schema.String
  },
  { httpApiStatus: 500 }
) {}
