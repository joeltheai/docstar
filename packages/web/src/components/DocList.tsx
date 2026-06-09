import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { AsyncResult } from "effect/unstable/reactivity"
import { DateTime } from "effect"
import { Link, useNavigate } from "react-router-dom"
import { createDocumentMutation, documentsListAtom } from "../atoms/api.ts"

const formatDate = (value: DateTime.Utc) => {
  const date = DateTime.toDateUtc(value)
  return date.toLocaleString()
}

export const DocList = () => {
  const navigate = useNavigate()
  const result = useAtomValue(documentsListAtom)
  const createDocument = useAtomSet(createDocumentMutation, { mode: "promise" })

  const handleCreate = async () => {
    const doc = await createDocument({ payload: { title: "Untitled document" } })
    navigate(`/doc/${doc.id}`)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Docstar</h1>
          <p className="subtitle">Collaborative documents powered by Yjs and Effect</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => void handleCreate()}>
          New document
        </button>
      </header>

      {AsyncResult.builder(result)
        .onInitial(() => <div className="card">Loading documents…</div>)
        .onWaiting(() => <div className="card">Loading documents…</div>)
        .onFailure(() => <div className="card error">Failed to load documents.</div>)
        .onSuccess(({ documents }) =>
          documents.length === 0 ? (
            <div className="card empty">
              <p>No documents yet.</p>
              <button type="button" className="primary-btn" onClick={() => void handleCreate()}>
                Create your first document
              </button>
            </div>
          ) : (
            <ul className="doc-list">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <Link to={`/doc/${doc.id}`} className="doc-card">
                    <span className="doc-title">{doc.title}</span>
                    <span className="doc-meta">Updated {formatDate(doc.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        )
        .render()}
    </div>
  )
}
