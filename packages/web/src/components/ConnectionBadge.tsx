import type { ConnectionStatus } from "../editor/useCollaborativeEditor.ts"

const labels: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  connected: "Connected",
  synced: "Synced",
  disconnected: "Offline"
}

export const ConnectionBadge = ({ status }: { readonly status: ConnectionStatus }) => (
  <span className={`connection-badge connection-badge--${status}`}>{labels[status]}</span>
)
