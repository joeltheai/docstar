import { mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { setPersistence } from "./utils.ts"

const require = createRequire(import.meta.url)
const yLeveldbRoot = dirname(require.resolve("y-leveldb/package.json"))
const { LeveldbPersistence } = require(join(yLeveldbRoot, "dist/y-leveldb.cjs")) as {
  LeveldbPersistence: new (location: string) => {
    getYDoc: (docName: string) => Promise<{ destroy: () => void }>
    storeUpdate: (docName: string, update: Uint8Array) => void
  }
}
const Y = require("yjs") as typeof import("yjs")

const __dirname = dirname(fileURLToPath(import.meta.url))
const persistenceDir = process.env.YPERSISTENCE ?? join(__dirname, "../../../data/yjs")

export const initYjsPersistence = () => {
  mkdirSync(persistenceDir, { recursive: true })
  const ldb = new LeveldbPersistence(persistenceDir)

  setPersistence({
    provider: ldb,
    bindState: async (docName, ydoc) => {
      const persistedYdoc = await ldb.getYDoc(docName)
      const persistedState = Y.encodeStateAsUpdate(persistedYdoc)
      Y.applyUpdate(ydoc, persistedState)
      persistedYdoc.destroy()

      ydoc.on("update", (update: Uint8Array) => {
        ldb.storeUpdate(docName, update)
      })
    },
    writeState: async () => {}
  })

  console.log(`Yjs persistence enabled at ${persistenceDir}`)
}
