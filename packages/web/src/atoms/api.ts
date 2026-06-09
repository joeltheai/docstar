import { DocstarApi } from "@docstar/domain"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { AtomHttpApi } from "effect/unstable/reactivity"

export class DocstarClient extends AtomHttpApi.Service<DocstarClient>()("DocstarClient", {
  api: DocstarApi,
  httpClient: FetchHttpClient.layer,
  baseUrl: ""
}) {}

export const documentsListAtom = DocstarClient.query("documents", "list", {
  reactivityKeys: ["documents"],
  timeToLive: "30 seconds"
})

export const createDocumentMutation = DocstarClient.mutation("documents", "create")

export const documentMetaAtom = (id: string) =>
  DocstarClient.query("documents", "get", {
    params: { id },
    reactivityKeys: ["documents", id],
    timeToLive: "30 seconds"
  })

export const updateTitleMutation = DocstarClient.mutation("documents", "updateTitle")

export const deleteDocumentMutation = DocstarClient.mutation("documents", "delete")

export const ApiLayer = DocstarClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
