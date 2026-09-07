# 插畫版視覺規格

2026-09-07 使用者要求每頁至少一個插圖，並提升整體 UI/UX。延續原先奶油紙色、墨色與暖橘的手冊方向，使用內建 Image Gen 生成新版概念和原創插圖集，未使用外部付費 API。

## 設計與素材

- 概念：`visual-direction-v2.png`。手機作答、結果、分享三種畫面；首頁沿用既有書冊主視覺，關於／錯誤頁延伸相同字體、線條與插圖規則。
- 素材：`../../src/assets/illustration-atlas-v2.png`，單一 4×4 圖集，保留生成結果的透明背景。由 Illustration 元件顯示相應格子，圖片不包含 UI 文案或操作元件。
- 色彩：paper #f8f5ee、ink #262620、accent #c84717，插圖輔以灰綠／沙色；紙卡底色 #fffcf6、選中底色 #f6e8d8。
- 字體：既有繁中宋／明體標題和系統黑體正文。題目桌機 28px、手機 21–23px；選項 16px，最小操作高度 50px。
- 桌機作答圖文雙欄；手機插圖在題目前、底部操作列隨捲動保留。點選不自動跳題，保留 radio、上一題與可見焦點。
- 結果完整呈現五段說明；分享用橘色書脊、紙張錯層和角色圖，桌機卡片／操作雙欄，手機上下排列。
- 所有動畫為短暫進場與操作回饋，無循環；reduced motion 全部停用。

## 圖集提示詞

Use case illustration-story. Create ONE production illustration sprite atlas for a Traditional Chinese playful human-manual quiz. Exact regular 4 columns by 4 rows, 16 equally sized square cells, large square image preferably 2048x2048. NO text, NO numbers, NO grid borders. Every cell has a complete distinct illustration centered within its own square with at least 12% empty padding on ALL edges; absolutely no artwork crosses cells. Entire background is perfectly flat solid #f8f5ee (RGB248245238), NOT white, no gradient or overall texture. Ink editorial book illustration, fine imperfect charcoal linework, limited muted burnt orange #c84717, sage and pale sand flat watercolor shapes inside subjects. Charming sophisticated friendly simple rounded characters, small dot eyes and expressive arms. Unify line weight and scale. Need actual richly drawn illustration vignettes not minimal icons. Sparse small props, each vignette balanced landscape composition inside square. Row1 left-to-right: 1 round-headed person wearing orange sweater at an empty dinner table, looking at phone, tiny empty speech bubble, plant; 2 round-headed traveler with a small orange suitcase and folded map, distant hill; 3 two small friends one tired on a bench, other offering tea and listening; 4 person waiting by a large round clock outside a tiny cafe. Row2: 1 puzzled person studying a phone with a large blank speech bubble; 2 three little friends at a branching directional sign consulting a map; 3 person relaxing under a crescent moon with a book and a cup; 4 person opening a beautifully tied orange surprise gift box. Row3 SIX ROLE CHARACTER portraits begin: 1 friendly cylindrical cream BATTERY with orange cap, arms feet, relaxing beside a small cushion and a leaf (low battery helper); 2 anthropomorphic orange RADIATOR/HEATER smiling waving next to plant and tea stool (social heater); 3 anthropomorphic small vintage FILM CAMERA with two circular reels, holding a little clapper board (inner director); 4 energetic anthropomorphic orange SNEAKER with face arms and feet, taking a step near a tiny flag (action human). Row4: 1 anthropomorphic PAINT PALETTE with orange and sage paint spots holding a brush, little flower pot (freeform artist); 2 anthropomorphic rounded cream HOUSE with orange roof, smile and arms, gently holding an umbrella near tiny plant (steady keeper); 3 two round-headed friends reading a large open manual together at a little table (about page); 4 puzzled round-headed explorer holding a magnifying glass beside an open book with one loose page flying (404 missing page). All 16 must be in exact described row-major positions. No letters or typography. Same cream solid background to integrate directly into web page. Do not include any UI, device frames, drop shadow around cells, signatures or watermark.

## 比對記錄

- 已對照概念與實際 375px／1440px 截圖：紙色、橘色選中、圖文層級、分段進度、角色紙卡一致；使用實際生成的圖集，非從概念擷取 UI。
- 概念生成器自行加入了收合箭頭和縮寫文案；實作遵守原題庫完整呈現要求，維持五段全文直接閱讀，也保留原有分享主操作。
- 手機插圖依 320px 小螢幕調為 170–180px，讓選項與下一步維持可操作；桌機擴成圖文雙欄。
- 16 格插圖對應定義集中於 src/data/illustrations.ts，不影響題庫與計分。首頁沿用原有書冊；結果和分享使用同一角色，關於與錯誤入口另有情境圖。
