// 範例，須合併到已建立的 React 專案；不是本啟動包可獨立執行的設定。
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH ?? '/';
  if (!base.startsWith('/') || !base.endsWith('/')) {
    throw new Error('VITE_BASE_PATH 必須以 / 開始和結束，例如 /human-manual/。');
  }
  return { plugins: [react()], base };
});
