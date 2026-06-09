import { mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, "../../../data")
const dbPath = join(dataDir, "docstar.db")

mkdirSync(dataDir, { recursive: true })

const db = new Database(dbPath)
const schema = readFileSync(join(__dirname, "schema.sql"), "utf8")
db.exec(schema)
db.close()

console.log(`Migrated database at ${dbPath}`)
