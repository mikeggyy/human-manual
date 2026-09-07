# GitHub 與公開網站：發布準備
實際發布使用 .github/workflows/deploy.yml；deployment-templates/ 保留為參考範本。
第一版選擇 GitHub repository 保存原始碼，GitHub Pages 提供公開靜態網站。

## 為什麼第一版適合
題庫與結果固定，計分、儲存、圖片輸出都可在瀏覽器做，不需要應用伺服器或 AI API。
GitHub Pages 是靜態託管服務；GitHub Free 可用公開 repository 啟用 Pages。[1]
這不表示無限流量，也不包含自行購買網域、未來資料庫或 AI 服務費用。
網站訪問 IP 可能依 GitHub 的安全用途被記錄；不要宣稱包含主機在內完全不記錄資料。[1]

## 發布目標
使用者於 2026-09-07 明確授權建立 mikeggyy/human-manual 公開 repository 並啟用 GitHub Pages。
Repository 已建立：https://github.com/mikeggyy/human-manual 。Pages 使用 GitHub Actions，HTTPS 已啟用。
後續更新 main 會自動檢查、建置及發布；應確認 Actions 成功並驗收公開網站，不能以 push 成功代替部署成功。
目前可先公開為試玩版：可完整作答、查看六角色結果及分享連結；localStorage 保存、PNG 儲存、原生分享尚未實作。
未選定授權前不要擅自加入 MIT／Apache 等 LICENSE。

## 1. 在本機完成與驗證
Codex 建立 React 19 + TypeScript + Vite 專案，保留本包資料，新增 npm scripts 與 package-lock.json。
Node 版本要符合當時官方穩定版與套件需求，不以本包測試核心用的 v22.16.0 當成 Vite 相容保證。[2]
要求以下 scripts 真正可執行：typecheck、lint、test:unit、build、test:e2e。
先本機測過 production build，而不只開發伺服器。
React Router 用 HashRouter，且分享 link 使用實際 origin、BASE_URL 與 hash 路徑；不可硬編 localhost。[3]

## 2. 經授權後設定 repository
確認內容已完成敏感資料掃描，並保留 .gitignore；上傳原始碼與 lockfile，不上傳 node_modules。
將 deployment-templates/github-pages.yml 複製到 .github/workflows/deploy.yml。
workflow 所需 npm scripts 和 package-lock.json 必須已存在。
Repository 的 Settings → Pages → Build and deployment → Source 選 GitHub Actions。[4]
第一次上線以實際 GitHub owner／repo 為準，不自行填入看似存在的公開網址。

## 3. 設定 base 並驗證真實網址
對專案站 https://<owner>.github.io/<repo>/，Vite base 為 '/<repo>/'。[4]
對帳號首頁站或自訂網域，base 通常為 '/'，需按實際部署設定調整。[4]
範本預設一般專案站，使用 repository 名稱產生 VITE_BASE_PATH；改成首頁站或自訂網域時要覆寫成 '/'。
Vite 設定可採 deployment-templates/vite.config.ts；不是直接取代已有設定，應保留 alias 等既有選項。
部署後依 Actions 真正回報的 Pages URL，逐一驗證首頁、做測驗、結果直達、reload、分享。PNG 與原生分享須等功能完成後另行驗收。
發佈成功後才把真實 Live Demo 和 GitHub URL 加入 README 與網站。

## 分享預覽的範圍
hash route 是前端導航，不是各角色各自的 HTML 檔。[3]
第一版只承諾共用品牌 OG 圖；各社群是否顯示預覽，還需真實平台測試，不能預先保證。
要每種角色有獨立社群預覽，下一版建立 6 份預渲染結果 HTML 與各自的 OG metadata；這和「可以分享結果連結」是兩件事。

## 官方依據（查核日期：2026-09-07）
[1] GitHub Pages 功能與資料紀錄：https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
[2] React from scratch：https://react.dev/learn/build-a-react-app-from-scratch
[3] React Router HashRouter：https://reactrouter.com/api/declarative-routers/HashRouter
[4] Vite 靜態部署：https://vite.dev/guide/static-deploy
[5] Codex 規劃模式：https://developers.openai.com/codex/learn/best-practices
[6] Codex AGENTS.md：https://developers.openai.com/codex/agent-configuration/agents-md

## 範本的限制
Workflow 中的五個 GitHub Action SHA 已於 2026-09-07 透過各官方 repository 的 GitHub API 查核存在。環境相容性仍須由實際 CI 驗證。
範本先建置 production dist，再執行瀏覽器測試。CI 由 Playwright 管理 preview 的啟動與停止；測試基址及 Vite base 使用相同 repository 子路徑。
實際 GitHub 執行與網站驗收紀錄見 docs/IMPLEMENTATION-PLAN.md；本機驗證與公開發布分別記錄。
