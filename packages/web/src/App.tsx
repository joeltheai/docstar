import { Route, Routes } from "react-router-dom"
import { DocList } from "./components/DocList.tsx"
import { EditorPage } from "./components/EditorPage.tsx"
import { RuntimeProvider } from "./components/RuntimeProvider.tsx"

export const App = () => (
  <RuntimeProvider>
    <Routes>
      <Route path="/" element={<DocList />} />
      <Route path="/doc/:id" element={<EditorPage />} />
    </Routes>
  </RuntimeProvider>
)
