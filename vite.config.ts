import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  /**
   * Firebase `signInWithPopup` still touches the opener (`window.closed`); `same-origin-allow-popups`
   * is not enough in some browsers/extension setups — `unsafe-none` avoids COOP blocking in local dev only.
   */
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
  },
})
