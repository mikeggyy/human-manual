# 人類使用說明書

> 出廠時沒附的那本，現在補給你。

8 個日常選擇，翻開一份娛樂角色使用說明書。繁體中文、免登入、手機優先。

目前是**試玩版**，包含里程碑 1 的測驗與分享連結功能。不是心理評估或醫療診斷。

[開啟線上試玩](https://mikeggyy.github.io/human-manual/) · [GitHub 原始碼](https://github.com/mikeggyy/human-manual) · [發布紀錄](https://github.com/mikeggyy/human-manual/actions)

## 技術與協作

使用者確認手冊風格後，要求選用適合 AI 開發的方式；現採 React 19、TypeScript、Vite、React Router HashRouter、CSS variables。以元件、狀態、資料與計分分層，方便 AI 小步實作與測試。第一版沒有後端、LLM API、會員、追蹤或付費功能。

使用者負責產品與視覺方向；Codex 負責實作、測試與文件。視覺概念和書冊／電池插畫由內建 imagegen 產生；頁面文字、表單與控制項皆為 HTML。完整進度見 [實作計畫](docs/IMPLEMENTATION-PLAN.md)。

## 已實作的基礎

- 首頁、8 題單選、返回修改、未答不可前進、完整六角色結果與重測。
- 單次頁面記憶體狀態；換路由不丟失作答，重整會重置。
- 角色模板分享頁、複製連結，複製不可用時顯示可選取網址。
- 分享 URL 僅含版本和角色；未知版本／角色／路由可回首頁。
- 原生 radio 與 fieldset、鍵盤焦點、375 / 768 / 1440px 響應式樣式。

## 尚未完成

第二階段：localStorage 保存與復原、PNG 儲存、原生分享與取消處理、完整錯誤降級。

第三階段：最終展示截圖及完整產品驗收。試玩版 Pages 已公開，CI 與公開網址的 6 項瀏覽器測試通過；iOS Safari 實機、App 內嵌瀏覽器、3 位一般使用者試玩仍未驗證。圖片目前使用同一個全站電池角色，不是六套角色插畫。

## 本機執行

使用 Node 24.14.0 或較新的 Node 24，npm 安裝。實際版本以 package-lock.json 為準。

```powershell
cd human-manual
npm ci
npm run dev -- --port 5180
```

開啟 http://127.0.0.1:5180 。預覽 production build 可改用 `npm run build` 然後 `npm run preview -- --port 5180`。

## 驗證

```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run test:core
npm run build
```

瀏覽器測試需要先啟動上面的本機預覽，再於另一個終端執行：

```powershell
# 首次使用 Playwright 的 Chromium 時才安裝。
npx playwright install chromium
npm run test:e2e
```

Windows 也可使用已安裝的 Edge：`$env:PLAYWRIGHT_CHANNEL = 'msedge'`，然後執行 `npm run test:e2e`。測試網址可由 `E2E_BASE_URL` 指定；未指定時為 http://127.0.0.1:5180 。

2026-09-07 本機已執行：npm ci、typecheck、lint、build、6 個單元測試、8 個參考核心測試、6 個 Playwright 測試；測試環境為 Windows / Node 24.14.0 / Edge Chromium，另在 Codex 內建瀏覽器檢查互動。最終實際結果及限制見實作計畫。

## 架構與計分

- `core/quiz.v1.json`：原始版本化題庫與完整角色文案。
- `src/domain`：型別與計分純函式；不依賴 React。
- `src/state`：reducer、context 與 useQuiz。
- `src/pages`、`src/components`：頁面及共用介面。
- `src/services`：分享 URL；後續加入保存與圖片匯出。
- `tests/unit`、`tests/e2e`：計分對照與實際瀏覽器流程。

每題主類型 3 分、副類型 1 分。最高分決定結果，平手由最後一題往前比較。TypeScript 核心已與提供的參考核心比對全部 6,561 種答案，包含 1,781 個平手案例，六角色皆可到達。這不代表心理效度或真實使用者比例。

## 發布與授權

使用者已授權發布到 `mikeggyy/human-manual`。`.github/workflows/deploy.yml` 在 main 更新後執行檢查、建置、瀏覽器測試及 GitHub Pages 發布；實際結果見 Actions 與 [實作計畫](docs/IMPLEMENTATION-PLAN.md)。未指定開源 LICENSE，公開程式碼不代表授予開源授權。操作方式見 [發布說明](docs/DEPLOY.md)。
