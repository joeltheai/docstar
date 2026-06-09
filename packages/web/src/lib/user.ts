const STORAGE_KEY = "docstar-user"

export interface EditorUser {
  readonly name: string
  readonly color: string
}

const colors = [
  "#e57373",
  "#f06292",
  "#ba68c8",
  "#9575cd",
  "#7986cb",
  "#64b5f6",
  "#4db6ac",
  "#81c784",
  "#ffb74d",
  "#ff8a65"
]

const randomColor = () => colors[Math.floor(Math.random() * colors.length)] ?? "#64b5f6"

export const getEditorUser = (): EditorUser => {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored) as EditorUser
  }

  const user: EditorUser = {
    name: `User ${Math.floor(Math.random() * 900) + 100}`,
    color: randomColor()
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}
