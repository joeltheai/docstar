import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true
      },
      "/yjs": {
        target: "ws://127.0.0.1:3002",
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yjs/, "")
      }
    }
  }
})
