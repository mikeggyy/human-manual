# 實作計畫

更新：2026-09-07。使用者已接受 visual-direction-v1.png 的介面方向，並要求採用適合 AI 開發的技術；因此將原始 Vue 選型改成 React。現有試玩版已獲授權發布到 GitHub Pages；下方早期紀錄保留當時狀態，最新發布紀錄位於文末。

## 技術決策

- React 19 + TypeScript + Vite；React Router HashRouter，支援靜態主機與專案子路徑。
- React context + reducer + useQuiz hook 管理單次作答；計分為獨立純函式，資料沿用 core/quiz.v1.json。
- CSS variables 與原生 HTML 表單；不用 UI 套件改變已核准的手冊風格。
- npm 單一 lockfile、ESLint、Vitest、Playwright；不增加後端或外部服務。
- 2026-09-07 查核 npm 官方 registry：本機 Node 24.14.0 / npm 11.9.0。TypeScript 最新 7.0.2，但 typescript-eslint 8.69.0 要求 <6.1，因此使用相容穩定版 6.0.3。其他版本以 package.json 與 lockfile 為準。
- 官方依據：https://react.dev/learn/build-a-react-app-from-scratch 、https://vite.dev/guide/ 。

## 里程碑 1：視覺與基礎（已完成本機驗收）

- [x] 保存啟動包、確認介面方向、確認技術調整。
- [x] 建立 React 基礎、hash 路由、嚴格型別、版本化題庫、元件與樣式。
- [x] 首頁 → 8 題原生 radio 作答 → 完整結果；單次記憶體狀態、返回修改與重測。
- [x] 結果角色模板與分享介面、可操作的複製連結；未知路由的恢復入口。
- [x] 375 / 768 / 1440px 畫面、鍵盤與焦點、型別/lint/build/計分一致性與瀏覽器驗證。

本階段需要真實計分才能讓可操作結果頁成立；這部分提前完成。跨重整保存、PNG 與完整原生分享仍屬第二階段，不顯示假成功或未接線的按鈕。

## 里程碑 2：完整體驗（待開始）

- [ ] localStorage 版本化保存、合法性檢查、損壞／禁用／寫入失敗降級、繼續與清除確認。
- [ ] 1080×1350 PNG 實際產出、字型／插畫／長句換行、失敗與重試。
- [ ] 原生分享、取消處理、複製失敗的可選取網址、分享不影響訪客進度。
- [ ] 完整分享／儲存測試，六角色與另一瀏覽器驗收。

## 里程碑 3：展示與發布準備（部分提前進行）

- [ ] 擴充 Playwright、根路徑和專案子路徑 production build 驗收、最終截圖。
- [ ] 完成展示 README、實際測試紀錄、素材來源、發布範本；遠端與 Pages 仍待單獨授權。
- [ ] 記錄尚未測的 iOS Safari 實機、App 內嵌瀏覽器、3 位真人試玩；不以模擬代替。

## 設計規格與檔案

參照 docs/design/visual-direction-v1.png。奶油白紙面、墨色字、暖橘操作、細分隔線、小圓角、少量手繪插畫；手機單欄，桌機首頁文字和書冊雙欄，閱讀區維持窄行寬。原生 UI 不烘焙為圖片。

- 背景 #f8f5ee、字色 #262620、橘色 #c84717；正文系統黑體，標題採系統宋／明體回退；16–18px 正文、1.8 行高，44px 以上觸控目標。
- 首頁只使用既定品牌、標語、玩法、CTA、關於入口；不加假數字、徽章或新模組。
- 選項有原生 radio、橘色選中框；未答不可前進，換題移焦點。
- 結果保留題庫完整文案（概念圖的短句不是可刪減資料的規格）；分享卡採三段摘要。
- 分享回饋依操作單獨出現，概念圖並列成功／失敗僅為狀態展示。
- 小電池先作為全站共用插畫，不代表六角色皆是省電型；六角色專屬插畫尚未設計。

新增 package.json、package-lock.json、index.html、vite.config.ts、tsconfig.json、eslint.config.js、playwright.config.ts；src 下分 pages、components、state、domain、data、services、styles。更新 AGENTS.md、README.md、PRD.md、DEPLOY.md 與部署範本的技術名稱，保留原始核心。

## 驗證紀錄

2026-09-07：Windows、Node 24.14.0、npm 11.9.0、Edge 152.0.4191.66（Playwright 1.63.0）。測試 production build，暫時網址 http://127.0.0.1:5180 。

| 驗證 | 實際結果 |
| --- | --- |
| npm ci / typecheck / lint / build | 全部通過，鎖定的依賴可重裝 |
| test:unit | 3 檔、6 測試通過；6,561 條路徑與參考核心完全一致 |
| test:core | 8 測試通過；1,781 個平手案例、6 角色皆可到達 |
| test:e2e | 4 測試通過；375×900 / 768×900 / 1440×900 |
| 流程 | 開始 → 鍵盤選答 → 下一題 → 回上題修改 → 8 題完成 → 正確結果 → 分享 fallback → 新分頁直達與重整 → 重測清空 |
| 全角色與錯誤入口 | 六份完整文案、未知版本／角色／路由的回首頁入口通過 |
| 渲染健康 | 非空白、正確標題、無 Vite overlay、無 console error / pageerror、無橫向溢出 |
| Codex 內建瀏覽器 | 首頁、radio 選取、進度與題目焦點、分享頁的真實複製成功回饋通過；不是僅跑 build |

第一輪瀏覽器測試遇到 JSON import 缺少 type: json，已補上，後續全數通過。測試工具 NO_COLOR / FORCE_COLOR 警告來自執行環境，不是頁面錯誤。

## 視覺比對與範圍

使用 view_image 開啟核准概念圖與最後一輪瀏覽器截圖逐項目視比對。概念是 1254×1254 四欄總覽，而非一個 1254px 的產品頁；實作使用 375 / 768 / 1440px 響應式畫面，未宣稱逐像素複製總覽外框。

| 比對點 | 結果與修正 |
| --- | --- |
| 文案與首屏 | 保留品牌、標語、玩法與原 CTA；未增加假數字或徽章；修正手機把「那本」拆開的斷行 |
| 色彩 | 保留奶油白、墨色、暖橘；依可读性選定 CSS tokens，未加漸層與覆色 |
| 字體層級 | 宋／明體標題、清楚的正文和按鈕；完整結果採題庫全文，所以比總覽中的摘要更長 |
| 版面 | 手機單欄、桌機標語／書冊雙欄、窄行寬結果；不加入卡片網格 |
| 插畫 | 由概念抽取透明書冊與電池素材；實際 alpha 已檢查，無方形底色或裁切 |
| 選項與圖示 | 原生 radio、橘色選中邊框；手冊章節配對插頭／電池／時鐘／注意／星號 |
| 焦點與分享 | 換題移到標題；修正全頁截圖中意外出現的隱藏 skip link；成功／失敗只按實際操作顯示 |

本階段的基礎畫面已依核准視覺方向驗證。明確保留的階段差異：尚未接 PNG 與原生分享，所以相應按鈕尚未上線；六角色暫用共用電池插畫。不能宣稱整份四畫面功能已完整完成或 10/10 最終交付。

截圖保留於 本機交付產物 human-manual-m1/ ，含 home、quiz、result、share 的三種寬度。素材提示見 docs/design/ASSETS.md。

未驗證：localStorage、PNG、原生分享、iOS Safari 實機、App 內嵌瀏覽器、子路徑 production build、公開 CI／Pages、真人試玩；這些依第二、三階段續做。

資源結案：持續保留背景預覽的 Start-Process 操作被自動審查拒絕（僅回覆 blocked by policy），改為前景執行的暫時驗收預覽。完成後關閉本次瀏覽器分頁，resource guard 清理成功，PID 34172 已停止、5180 無 listener、工作階段 temp 已移除，沒有保留背景程序。截圖為交付產物，繼續保留。

## 2026-09-07 互動修整（里程碑 1 後續）

使用者要求：拖曳不要出現藍色反白，重新作答不要使用系統 alert。

- 文字禁止拖曳選取，插畫停用原生拖圖；分享 fallback 的網址輸入框仍可選取，選取色改為暖紙色。
- 首頁重新開始、結果重測與關於頁清除統一使用 ConfirmDialog：奶油白紙面、暖橘按鈕、遮罩與原生 HTML dialog。移除全部 window.confirm，未使用 alert。
- 取消／Esc 保留狀態並回復觸發按鈕焦點；開啟時先聚焦「先保留」，Tab／Shift+Tab 在視窗兩個按鈕間循環，背景不可操作且停止滾動。
- 型別、lint、production build 通過。Playwright 6 個測試通過，包含原 375／768／1440 流程、真正滑鼠拖選／拖圖、手動選取分享網址、取消／Esc／焦點循環、確認清除和無系統彈窗。
- 第一輪抓到原生 dialog 的 Tab 會離開內容區，補上明確焦點循環後通過。手機目視比對後縮短確認說明，避免「開始」拆成兩行。
- 已目視檢查桌機與手機確認視窗；未新增圖片或改變已確認的頁面設計。截圖在既有 visualizations 工作階段目錄下的 interaction-polish/confirm-375.png 與 confirm-1440.png。
- 重用使用者已要求保留的 5181 預覽；本次未新增背景伺服器。內建瀏覽器更新後保留供操作，外部瀏覽器舊分頁需重新整理載入新版。

## 2026-09-07 首頁文字與動畫修整

- 依使用者要求，從首頁 DOM 刪除「免登入 · 8 題 · 娛樂測驗」整段與 home-meta 樣式，並非單純隱藏。其餘文案保留。
- 加入約 0.7 秒的標題／副標／操作区依序進場、0.95 秒書冊輕展開，桌機滑鼠停留時書冊輕抬起；不使用循環浮動。
- 換題以 question ID 重建題目區，觸發 0.34 秒輕翻頁；進度條平滑前進、選項與按鈕提供小幅位移回饋。結果章節依序浮現，確認視窗／遮罩柔和進場。
- 動畫主要使用 transform / opacity，保留原排版、焦點及點擊時機；prefers-reduced-motion: reduce 時全部停用。
- 型別、lint、production build 通過；6 個瀏覽器流程測試通過。額外實際檢查首頁 DOM 已無該段文字、正常模式有 4 個進場動畫、減少動態模式為 0 個動畫且按鈕 transition 為 0s，減少動態模式仍可選答與換題。
- 375／768／1440px 無橫向溢出，375 與 1440 首頁截圖已目視檢查；截圖採結束動畫後的畫面，保存於 visualizations 工作階段目錄的 motion-polish/。
- 內建瀏覽器已重整至新版，原先保留的 5181 預覽繼續供使用者操作；驗證瀏覽器已結束，暫存腳本和測試輸出由 resource guard 清理。

## 2026-09-07 公開試玩版發布準備

- 使用者提出 GitHub 與公開網頁意願。先準備現有功能的試玩版；第二階段未完成項目維持如實揭露。
- 修正 Pages workflow 順序：build 後才做瀏覽器驗收，CI 由 Playwright 管理 preview。Vite base 和 E2E_BASE_URL 採一致的 repository 子路徑，測試導航改為相對基址。
- 本機以 /human-manual/ 子路徑獨立建置，typecheck、lint、6 個單元測試、8 個參考核心測試、6 個瀏覽器測試全部通過。包含三種寬度完整流程、圖片、結果直達／重新整理、分享及重測確認；原先 5181 的根路徑預覽未被覆寫。
- 五個 Action 固定 SHA 已向各官方 GitHub repository 查核存在；尚無 GitHub Actions 執行紀錄。
- README 與發布文件已更新；移除文件中的個人電腦絕對路徑。尚未初始化 Git、建立遠端、push 或啟用 Pages。帳號、名稱與公開原始碼／網站授權待使用者確認。
- 上述子路徑驗證取代前文當時的「子路徑未驗證」狀態；公開 CI／Pages、iOS Safari、真人試玩與未實作功能仍未驗證。

## 2026-09-07 公開試玩版發布完成

- 使用者確認使用 mikeggyy/human-manual、公開程式碼並啟用 Pages；已建立公開 repository，main 已推送，HTTPS 已啟用。
- 公開網站：https://mikeggyy.github.io/human-manual/ 。原始碼：https://github.com/mikeggyy/human-manual 。Repository 首頁欄位已指向試玩網址。
- 首次發布程式碼 commit：5944e2edbf2964436e2db9068440ec8c3083ab74。GitHub Actions build 與 deploy 皆成功：https://github.com/mikeggyy/human-manual/actions/runs/34088185187 。後續文件紀錄提交不變更已驗收的程式碼。
- CI 實際完成 npm ci、typecheck、lint、6 個單元測試、8 個核心測試、production build、6 個 Chromium 瀏覽器測試及 Pages artifact 發布。
- 對公開 HTTPS 網址另執行 6 個 Edge 瀏覽器測試，全部通過：375／768／1440px 完整作答、回頭修改、六角色完整結果、分享訪客直達與重新整理、未知路由、重測確認與拖選行為。首頁 HTTP 200；內建瀏覽器已開啟公開網站並目視確認圖片和排版。
- 未上傳 node_modules、dist、環境檔或測試暫存；未指定開源 LICENSE。Git 僅此專案使用 GitHub noreply 提交信箱。
- 第二階段尚未實作的 localStorage、PNG 與原生分享，以及實機／真人驗收，仍維持未完成；此次交付為目前功能的公開試玩版。

## 2026-09-07 每頁插圖與 UI/UX 升級

- 依使用者要求，從原手冊風格延伸新版視覺；內建 Image Gen 先產生作答／結果／分享概念，再製作 16 格原創圖集。
- 首頁保留書冊、縮短空白與加強主操作；8 題各有情境插圖，六角色各有獨立造型，分享沿用对应角色，關於／錯誤頁有獨立場景。全部介面文字仍為 HTML。
- 桌機作答與結果採圖文雙欄，分享為卡片／操作雙欄；手機採單欄與可隨捲動保留的下一步操作列。分段進度、暖色選中、清楚焦點、按語句斷行與短進場動畫；減少動態效果時停用動畫。
- 保留原生 radio、未答禁用、焦點移動、返回修改、完整結果五段文案、分享 fallback 和頁內重測確認；計分和題庫未更動。
- 本機 typecheck、lint、production build、6 個單元測試通過；7 個瀏覽器測試通過，涵蓋 320／375／768／1440px、全部题目和角色插圖、完整流程、圖片載入、減少動態效果與小螢幕操作列。已用內建瀏覽器點選作答並比對概念與實際截圖。
- 設計與素材來源：docs/design/ILLUSTRATED-EDITION.md。本次公開發布結果於部署完成後補記；既有第二階段功能缺口未包含於本次視覺升級。

### 插畫版公開驗收

- 程式碼 a04ba29b4c76ae6a6f8172e09585d09d4d86bd66 的 GitHub Actions build／deploy 成功：https://github.com/mikeggyy/human-manual/actions/runs/34089883041 。公開網址保持 https://mikeggyy.github.io/human-manual/ 。
- 公開網站 7 個 Edge 瀏覽器測試全部通過（25.8 秒），覆蓋新插圖、320px 窄螢幕、375／768／1440px 完整流程、角色直達、重測與分享。
- 第一轮公開測試遇到圖片下載尚未完成便立即檢查的測試時序問題；改為等待圖片載入且有有效尺寸後檢查，完整重跑通過。後續僅提交此測試等待修正與驗收文件，不變更已發布的應用程式。
- 內建瀏覽器已重新載入公開新版並開啟第一題供使用者試玩；本機驗收分頁已關閉，暫時預覽 PID 44036 已由 resource guard 停止，測試暫存已清理。
