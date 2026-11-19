import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The base path must match your GitHub repo name (case-sensitive).
// Your site lives at https://taiteathailand.github.io/Invis-mafioso/
export default defineConfig({
  base: '/Invis-mafioso/',
  plugins: [react()],
})
