# 視覺與素材紀錄

2026-09-07，內建 imagegen 產生；使用者已接受 visual-direction-v1.png 的介面方向。此圖是四畫面總覽，並非可直接使用的 UI。所有互動與介面文字以原生 HTML 實作。原創生成圖仍待第三階段公開素材檢查，不替專案套用開源授權。

## 生產素材與最終生成提示

- src/assets/manual-book.png：1024×1536、RGBA 透明背景。從核准圖抽取書冊。
- src/assets/battery-mascot.png：1024×1536、RGBA 透明背景。從核准圖抽取微笑圓柱電池人物。

Book: Extract and faithfully regenerate ONLY the illustrated standing instruction-manual BOOK shown in the homepage panel of this approved UI concept as a standalone production image asset. No UI or buttons or surrounding screen. Preserve the same three-quarter upright book perspective, ivory paper, hand-drawn black ink outlines, subtle paper/pencil shading, and orange-accent smiling battery mascot on its front. Exact cover Traditional Chinese text 人類使用說明書 in two/three neatly set lines, no additional copy. Portrait composition with full book and comfortable 8% clear margins, transparent background with alpha, no ground rectangle, no color overlay. High quality polished faithful asset matching the reference.

Mascot: Extract and faithfully regenerate ONLY the smiling battery-person mascot from the result panel of this approved UI concept as a standalone production image asset. Keep exact original design: a white/ivory cylindrical battery with black hand-drawn ink contours, a burnt orange stripe beneath top terminal, simple dot eyes and small smile, little bent arms with hands near hips, two tiny legs and shoes, small black lightning symbol on body. No book, no UI, no text. Full character centered, portrait composition, comfortable transparent margins, truly transparent background with alpha. Clean illustration with subtle pencil grain, polished and faithful to reference.

其他圖示為程式原生 SVG（方向箭頭、插頭、電池、時鐘、注意、星號、勾選），依核准圖的功能與線條描繪。字型使用本機系統字型，沒有引入外部字型服務。

## 2026-09-07 插畫版

新增 `src/assets/illustration-atlas-v2.png`（1254×1254、保留透明背景），由內建 Image Gen 產生 4×4 插圖集：8 個作答情境、6 個獨立角色，以及關於／錯誤頁。首頁繼續使用書冊；原電池圖保留於原始素材，不再作為全部結果的共用圖。生成提示、設計規格及比對見 [ILLUSTRATED-EDITION.md](ILLUSTRATED-EDITION.md)。
