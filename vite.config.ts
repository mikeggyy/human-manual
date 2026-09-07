import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const base = process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH ?? '/'
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) {
    throw new Error('VITE_BASE_PATH 必須是 / 或 /human-manual/ 格式。')
  }
  return { plugins: [react()], base }
})
