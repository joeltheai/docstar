import { useAtomRefresh, useAtomValue } from "@effect/atom-react"
import { AsyncResult } from "effect/unstable/reactivity"
import { DateTime } from "effect"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { documentsListAtom } from "../atoms/api.ts"

const formatDate = (value: DateTime.Utc) => {
  const date = DateTime.toDateUtc(value)
  return date.toLocaleString()
}

export const DocList = () => {
  const navigate = useNavigate()
  const result = useAtomValue(documentsListAtom)
  const refreshDocuments = useAtomRefresh(documentsListAtom)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const handleCreate = async () => {
    setCreateError(null)
    setCreating(true)
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled document" })
      })
      if (!response.ok) {
        throw new Error(`Failed to create document (${response.status})`)
      }
      const doc = (await response.json()) as { id: string }
      refreshDocuments()
      navigate(`/doc/${doc.id}`)
    } catch (error) {
      console.error(error)
      setCreateError("Could not create document. Is the server running?")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Docstar</h1>
          <p className="subtitle">Collaborative documents powered by Yjs and Effect</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => void handleCreate()} disabled={creating}>
          {creating ? "Creating…" : "New document"}
        </button>
      </header>

      {createError ? <div className="card error">{createError}</div> : null}

      {AsyncResult.builder(result)
        .onInitial(() => <div className="card">Loading documents…</div>)
        .onWaiting(() => <div className="card">Loading documents…</div>)
        .onFailure(() => <div className="card error">Failed to load documents.</div>)
        .onSuccess(({ documents }) =>
          documents.length === 0 ? (
            <div className="card empty">
              <p>No documents yet.</p>
              <button type="button" className="primary-btn" onClick={() => void handleCreate()} disabled={creating}>
                {creating ? "Creating…" : "Create your first document"}
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
