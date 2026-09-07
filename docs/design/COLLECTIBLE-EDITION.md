# 精裝繪本與結果章節

2026-09-07：使用者先要求結局更豐富，接著補充同事認為画面單調，要求更有質感、有趣，並完整設計 title 等細節，產品頁面不得放入工具／模型元素。

## 版面與內容

- 概念圖：result-chapters-concept.png、collectible-edition-concept.png。沿用既有角色造型，加入精裝繪本、灰綠情境底、紙張錯層、書籤、章節捷徑與短揭曉動態。
- 使用原題庫八題、六種結果；不修改權重和結果含義。每個角色新增三種生活場景、誤讀／重新理解、對朋友說的話、三個充電提案和兩段結尾。
- 實際作答回顧只在本人當次完成且結果吻合時呈現；線索來自選項對結果的正向權重，不顯示內部分數或心理百分比。完整八題用原生 details 展開。
- 分享只放版本和角色；獨立訪客看角色模板，沒有作答回顧。從分享頁返回本人結果時保留當次完成狀態。
- 手機單欄、桌機圖文雙欄。章節捷徑移動閱讀位置和鍵盤焦點；上方提供提早分享入口，避免長篇內容把主要操作埋到底部。
- 品牌色 #f8f5ee／#262620／#c84717，輔色 #e1e6d6／#eee2c8。首頁使用既有繁中標語，未添加假數據、宣稱或多餘選單；原生 UI 不烘焙在圖片內。

## 圖像素材與生成紀錄

使用內建 Image Gen。主視覺：src/assets/storybook-ensemble.png（1254×1254），網站分享圖：public/social-cover.png。舊書冊與圖集保留，不破壞原素材。

主提示：Create a standalone premium editorial illustration of an open terracotta-orange linen hardcover, exact cover title 人類使用說明書. Preserve the six character designs from illustration-atlas-v2.png: battery, scarf-wearing orange radiator, film camera with reels and clapperboard, orange sneaker, paint palette, cream house with orange roof and umbrella. All six emerge together from the open book. Hand-drawn ink, watercolor and fine pencil grain; small leaves and four-point stars; full object uncropped, no UI or extra labels.

修正提示：Preserve the exact book, title and six characters; remove the accidentally baked checkerboard and replace the entire exterior with uniform #f8f5ee. No checkerboard, no transparency-grid representation, no change to the artwork. 初次生成的棋盤格背景未採用；使用修正完成的紙色版，實作以 multiply 融入灰綠紙面。

## 分頁、分享與回復

- 首頁、作答、關於、六角色、分享及未知路由都有對應 document.title 和描述。
- HTML 預先提供共用 Open Graph／Twitter 品牌圖、canonical、zh-Hant、theme-color、SVG 書本 favicon；因 HashRouter，社群爬蟲使用共用品牌預覽，不保證角色專屬縮圖或各平台即時刷新。
- 網站介面不包含 AI／模型／生成工具標記。此文件只記錄開發與素材來源。
- 首頁主圖有載入／失敗文字，開始按鈕保持可用。未啟用 JavaScript 有說明；React 非預期錯誤有重新開啟入口，不呈現堆疊或系統 alert。
- 尊重 reduced motion；揭曉直接動畫呈現真實結果，沒有虛構分析或強迫等待。

## 視覺驗收取捨

- 對照概念與實際手機／桌機截圖：書冊群像、暖橘標題、灰綠底、紙卡、書籤、反白和章節層級一致。
- 概念中的抽象章節預覽以已完成的生活场景、相處提醒、充電提案捷徑取代；不添加沒有用途的漢堡選單。
- 完整角色文案保留，長頁採可跳轉章節與提早分享入口；沒有為了符合概念高度刪掉內容。
