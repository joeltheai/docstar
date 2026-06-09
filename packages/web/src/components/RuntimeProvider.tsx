import { useAtomMount, useAtomValue } from "@effect/atom-react"
import { AsyncResult } from "effect/unstable/reactivity"
import type { ReactNode } from "react"
import { DocstarClient } from "../atoms/api.ts"

export const RuntimeProvider = ({ children }: { readonly children: ReactNode }) => {
  useAtomMount(DocstarClient.runtime)
  const runtime = useAtomValue(DocstarClient.runtime)

  if (runtime._tag === "Initial" || runtime.waiting) {
    return <div className="card">Starting API client…</div>
  }

  if (runtime._tag === "Failure") {
    return <div className="card error">Failed to start API client.</div>
  }

  return children
}
