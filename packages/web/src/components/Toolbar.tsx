import type { Editor } from "@tiptap/core"

export const Toolbar = ({ editor }: { readonly editor: Editor | null }) => {
  if (!editor) return null

  const button = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      className={`toolbar-btn${active ? " toolbar-btn--active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  )

  return (
    <div className="toolbar">
      {button("B", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run())}
      {button("I", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run())}
      {button("S", editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run())}
      {button("H1", editor.isActive("heading", { level: 1 }), () =>
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      )}
      {button("H2", editor.isActive("heading", { level: 2 }), () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      )}
      {button("•", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
      {button("1.", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run())}
      {button("❝", editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run())}
      {button("</>", editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run())}
      {button("—", false, () => editor.chain().focus().setHorizontalRule().run())}
      {button("Undo", false, () => editor.chain().focus().undo().run())}
      {button("Redo", false, () => editor.chain().focus().redo().run())}
    </div>
  )
}
