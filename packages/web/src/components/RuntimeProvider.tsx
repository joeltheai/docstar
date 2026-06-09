import { useAtomMount } from "@effect/atom-react"
import type { ReactNode } from "react"
import { DocstarClient } from "../atoms/api.ts"

export const RuntimeProvider = ({ children }: { readonly children: ReactNode }) => {
  useAtomMount(DocstarClient.runtime)
  return children
}
