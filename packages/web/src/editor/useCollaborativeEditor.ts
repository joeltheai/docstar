import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCaret from "@tiptap/extension-collaboration-caret"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useState } from "react"
import { IndexeddbPersistence } from "y-indexeddb"
import { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"
import type { EditorUser } from "../lib/user.ts"

export type ConnectionStatus = "connecting" | "connected" | "synced" | "disconnected"

const wsBase = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/yjs`
}

export const useCollaborativeEditor = ({
  documentId,
  user
}: {
  readonly documentId: string
  readonly user: EditorUser
}) => {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider(wsBase(), documentId, ydoc, { connect: true })
    const offline = new IndexeddbPersistence(documentId, ydoc)

    const updateStatus = () => {
      if (provider.wsconnected && provider.synced) {
        setStatus("synced")
        setSynced(true)
      } else if (provider.wsconnected) {
        setStatus("connected")
      } else if (provider.wsconnecting) {
        setStatus("connecting")
      } else {
        setStatus("disconnected")
      }
    }

    provider.on("status", updateStatus)
    provider.on("sync", updateStatus)
    updateStatus()

    const instance = new Editor({
      extensions: [
        StarterKit.configure({
          undoRedo: false,
          link: false
        }),
        Link.configure({
          openOnClick: false,
          autolink: true
        }),
        Placeholder.configure({
          placeholder: "Start writing..."
        }),
        Collaboration.configure({
          document: ydoc
        }),
        CollaborationCaret.configure({
          provider,
          user
        })
      ],
      editorProps: {
        attributes: {
          class: "docstar-editor-content"
        }
      }
    })

    setEditor(instance)

    return () => {
      provider.off("status", updateStatus)
      provider.off("sync", updateStatus)
      instance.destroy()
      provider.destroy()
      offline.destroy()
      ydoc.destroy()
      setEditor(null)
      setSynced(false)
      setStatus("disconnected")
    }
  }, [documentId, user])

  return { editor, status, synced }
}
