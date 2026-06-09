import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { EditorContent } from "@tiptap/react"
import { AsyncResult } from "effect/unstable/reactivity"
import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { documentMetaAtom, updateTitleMutation } from "../atoms/api.ts"
import { useCollaborativeEditor } from "../editor/useCollaborativeEditor.ts"
import { getEditorUser } from "../lib/user.ts"
import { ConnectionBadge } from "./ConnectionBadge.tsx"
import { Toolbar } from "./Toolbar.tsx"

export const EditorPage = () => {
  const { id = "" } = useParams()
  const user = useMemo(() => getEditorUser(), [])
  const metaResult = useAtomValue(documentMetaAtom(id))
  const updateTitle = useAtomSet(updateTitleMutation, { mode: "promise" })
  const [title, setTitle] = useState<string | null>(null)
  const { editor, status, synced } = useCollaborativeEditor({ documentId: id, user })

  const resolvedTitle = AsyncResult.builder(metaResult)
    .onSuccess((doc) => doc.title)
    .orElse(() => "Untitled document")

  const displayTitle = title ?? (typeof resolvedTitle === "string" ? resolvedTitle : "Untitled document")

  const saveTitle = async () => {
    if (!title || title.trim().length === 0) return
    await updateTitle({
      params: { id },
      payload: { title: title.trim() },
      reactivityKeys: ["documents", id]
    })
    setTitle(null)
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="editor-header-left">
          <Link to="/" className="back-link">
            ← Documents
          </Link>
          <input
            className="title-input"
            value={displayTitle}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void saveTitle()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur()
              }
            }}
          />
        </div>
        <div className="editor-header-right">
          <ConnectionBadge status={status} />
          <button
            type="button"
            className="ghost-btn"
            onClick={() => void navigator.clipboard.writeText(shareUrl)}
          >
            Copy link
          </button>
          <span className="user-chip" style={{ backgroundColor: user.color }}>
            {user.name}
          </span>
        </div>
      </header>

      {AsyncResult.builder(metaResult)
        .onInitial(() => <div className="card">Loading document…</div>)
        .onWaiting(() => <div className="card">Loading document…</div>)
        .onFailure(() => <div className="card error">Document not found.</div>)
        .onSuccess(() => (
          <>
            <Toolbar editor={editor} />
            <div className="editor-shell">
              {!synced ? <div className="editor-overlay">Connecting to collaborators…</div> : null}
              <EditorContent editor={editor} />
            </div>
          </>
        ))
        .render()}
    </div>
  )
}
