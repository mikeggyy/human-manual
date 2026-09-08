# 動態繪本

2026-09-08。沿用已確認的精裝繪本、紙色、暖橘與灰綠。使用者在第一版動態發布後要求更精緻，現行版本改為原畫局部分層，以下先記錄精修版，後段保留第一版素材與生成歷史。

## 精修版：同一張原畫，連續的小動作

整張四姿勢硬切會讓外型、地面與道具跳位，也使旗子／花盆忽隱忽現。現行版本由 `CharacterRig` 共用原始 illustration-atlas-v2.png，以 SVG 裁切和遮罩分離局部；靜止底層永遠不做位移。未重新生成圖片或新增套件。

| 角色 | 動作與節奏 | 保持固定 |
| --- | --- | --- |
| 省電型熱心人 | 小幅抬手，慢慢回位；約 8.6 秒一輪 | 本體、坐墊、鞋與地面 |
| 氣氛組暖爐 | 手腕揮動，三縷熱氣錯開流動；約 7.8 秒一輪 | 暖爐、盆栽、茶杯與椅凳 |
| 腦內小劇場導演 | 兩個膠捲平滑轉一圈後停留；12 秒一輪 | 機身、外圈、打板與腳 |
| 人間行動派 | 雙手前後小幅蓄勢，回到原姿勢；約 6.9 秒一輪 | 鞋身、旗子、草地與石頭 |
| 隨興生活藝術家 | 畫筆與握筆手一起輕擺，有起勢與回位；約 9.4 秒一輪 | 調色盤、帽子、花盆與腳 |
| 安定感守護者 | 傘面緩慢輕擺，煙囪的煙徐徐上升；約 9.8 秒一輪 | 房屋、傘柄、植栽與底座 |

各角色短眨眼約 0.14–0.20 秒，間隔與手勢錯開；CSS 動作有平滑插值與停留，不以不同圖片替換整個身體。首頁書冊起伏縮至 4px、旋轉小於半度，星芒明暗變化降低；場景只在 2px 內緩慢起伏。首頁小角色的滑入反應縮為 3px，不再大幅搖晃。

### 素材、效能與控制

- 靜態底稿與所有局部層共用同一張原圖 URL；production build 不再包含約 2.17MB 的 character-motion-v1.png。舊檔保留，沒有清理歷史素材。
- 原畫以同一套裁切比例顯示，載入時保留 HTML 靜圖；SVG 載入失敗可繼續呈現靜圖。SVG 僅做裝飾，外層保留一份角色替代文字。
- 沿用全站暫停／播放、跨路由狀態、離屏／隱藏頁籤暫停、即時 reduced motion 靜圖模式；按鈕維持 44px 以上觸控高度。
- 題庫、分數、分享 URL 與 1080×1350 靜態 PNG 匯出不受影響。

### 精修驗收與差異處理

| 比對項目 | 發現與處理 | 驗證 |
| --- | --- | --- |
| 主體與道具 | 第一版整張替換會跳動或缺道具；現在固定原畫底層 | 六角色固定底層無動畫，休息／動作／眨眼放大目視 |
| 膠捲 | 初次分層的中心偏移會使孔洞斷開 | 校正兩圓盤中心與完整內圈，檢查旋轉最大姿勢 |
| 畫筆與手腕 | 手套裁切太窄會切掉指尖，關節轉動會露白 | 擴大完整握筆輪廓，保留原畫關節重疊，逐角度檢查 |
| 動作連續性 | 只看時間推進不足以驗證平滑 | 實際 seek 中間時刻，比對每個角色局部 transform 持續插值 |
| 控制及閱讀 | 不讓暫停後的新頁面停在透明進場 | 暫停／恢復、跨頁、即時減少動態、離屏與回退測試 |
| 手機與原流程 | 沿用紙卡構圖、分享操作優先、原畫細節 | 320px 控制區、375／1440px 畫面、35 個完整瀏覽器案例 |

本機 typecheck、lint、build、44 個單元測試、8 個核心測試及 35 個 Edge 瀏覽器測試通過。內建瀏覽器另實際操作暫停跨頁、恢復及 PNG 儲存；正常畫面無 page error。六角色錄影為 12 秒真實 DOM 播放，並保留 rest／peak／blink 比對與手機／桌機截圖於本機工作階段的 refined-motion 目錄。

SVG 錯誤與頁籤隱藏測試使用受控事件；iOS Safari 與 App 內嵌實機仍未驗證。CI 與公開站結果另記於 [實作計畫](../IMPLEMENTATION-PLAN.md)。

## 第一版逐格動態（歷史紀錄）

以下內容記錄第一版的素材及限制，已由上方原畫分層方式取代。

## 畫面動態

- 首頁：書冊輕搖與浮動、兩顆小星芒；六角色陳列錯開播放，沒有增加文案或等待步驟。
- 結果與分享預覽：電池眨眼舉手、暖爐揮手冒熱氣、攝影機打板、球鞋輕跳、調色盤揮筆、小屋撐傘與煙囪冒煙。
- 作答／關於／找不到頁：既有場景只有 4px 內的緩慢起伏，不改題目閱讀與作答操作。
- 原生按鈕提供全站暫停／播放，至少 44px 觸控高度。暫停跨路由保留；新頁面的標題及插圖直接呈現，不能停在透明進場。
- 系統減少動態即時生效並改回原插圖；離開視口及頁籤隱藏時暫停。載入失敗保留原圖。
- 網頁使用可暫停的 sprite 逐格動畫；匯出的 1080×1350 PNG 仍是靜態角色卡片。

## 素材

新增 [character-motion-v1.png](../../src/assets/character-motion-v1.png)，1024×1536、約 2.17MB，六列各四個姿勢。由內建 imagegen 產生，未使用 CLI 或另接外部 API；保留原圖集與 PNG 匯出素材。

初版背景意外畫出棋盤格，未採用；第二次只修正成白底。輸出為 RGB，並非真正 alpha；網頁使用 multiply 融合紙面，邊緣輕微淡出。各列有獨立裁切範圍，暖爐另外調整橫向圖格，避免相鄰盆栽滲入。調色盤眨眼格缺少花盆，因此該時段沿用完整休息姿勢，只播放揮筆動作。

### 最終生成提示

第一輪使用原 illustration-atlas-v2.png 作為角色與筆觸參考：

```text
Use case: illustration-story.
Asset type: one production sprite animation atlas for the existing six Human Manual storybook mascots.
Reference image: preserve the six mascot identities in cells 9–14 of the supplied 4x4 atlas (third row battery/radiator/camera/shoe, fourth row palette/house). Discard all human scene cells.
Create ONE sprite sheet, portrait 2:3 ratio, ideally 1536x2304, an EXACT tightly registered 4 COLUMN by 6 ROW grid of equal SQUARE cells. No gaps or drawn borders, no captions or text. True transparent background (alpha), not a checkerboard or colored paper. Every subject fully contained within its own square with 10% clear margin. All four frames of each row must maintain IDENTICAL character size, facial features, materials, props, ground line and position. This is for stepped looping animation; change limbs/eyes only with coherent pose registration, not redrawing four unrelated pictures.
Rows top to bottom:
1: Same orange-and-cream battery resting on sage cushion with little orange shoes. Frames left-to-right: relaxed smiling open eyes, eyes closed gentle blink, eyes open and right gloved finger raised waving, return toward relaxed.
2: Same orange radiator with sage scarf, plant left and tea stool right. Frames: smiling neutral, eyes closed blink, right gloved hand waving outward and three warm steam curls risen, hand returning and steam drifting.
3: Same vintage movie camera with twin dark film reels, little boots and tiny clapperboard. Frames: smile neutral, blink with clapper slightly opening, happy face and fully raised clapper plus reels rotated a quarter, returning clapper.
4: Same orange high-top sneaker character with white laces, gloved fists, orange shoes and little flag. Frames: standing ready, squat down and determined closed eyes, little hop up with lifted fists, soft landing with bent legs.
5: Same cream paint-palette character, orange beret and brush, sage/orange/yellow paint spots, flowerpot. Frames: smile and brush upright, blink with brush tilted inward, happy wave of brush outward, return brush halfway. No added paint splashes outside cell.
6: Same little cream house with orange tile roof, orange umbrella, plant and chimney. Frames: smile neutral, blink and umbrella tilted slightly left, smile and umbrella tilted slightly right plus chimney puff rises, umbrella returns near center.
Style: match reference exactly: warm textured watercolor and crayon, hand-drawn dark ink outlines, friendly round faces, terracotta orange, cream, muted sage green, softly irregular contours. Preserve cute object-characters and their signature props. Static props stay exactly fixed between frames. Motion should be readable but restrained, maximum body displacement 4% of cell.
Critical: total 24 complete individual mascot frames, 4 frames PER ROW, 6 rows. Character is repeated four times in its row, not one character stretched across columns. No extra humans, no titles, no lettering, no cropping, no altered identity.
```

第二輪以第一輪 atlas 為編輯目標，只修正背景：

```text
Use case: precise-object-edit. This is a production 4-column by 6-row animation sprite atlas. Change ONLY the background: replace ALL fake gray-and-white checkerboard everywhere in the image with perfectly uniform solid PURE WHITE (#FFFFFF, RGB 255 255 255). The finished image must contain NO checkerboard, no gray squares, no paper background texture, no gray vignette. The whole exterior around each mascot must be clean solid white. Preserve ALL 24 original mascot frames, their colors, their ink texture, facial expressions, poses, placement and dimensions exactly; preserve floor shadows and props. Keep exactly the same 1024x1536 canvas and frame positions; do not shift or crop any artwork. No other changes. Return a single production sprite sheet with a solid white background, not a mockup.
```

## 驗收紀錄

對照既有精裝繪本概念與本輪實際手機／桌機截圖：

| 檢查面向 | 結果 |
| --- | --- |
| 品牌與構圖 | 保留原書冊與角色，延續橘、紙色、灰綠；動態不改版面位置 |
| 字體與內容 | 標題／文案／操作仍是原生 HTML，不放入圖格 |
| 手機操作 | 320px 無橫向溢出，控制按鈕觸控區充足，分享操作仍在卡片之前 |
| 真正動作 | 觀察角色完整影格的 transform 改變、時間推進；暫停後兩者固定 |
| 連續閱讀 | reduced motion 全部動畫為 0，暫停後跨頁標題與插圖可見；原流程與靜態 PNG 回歸 |

實際截圖與錄影保存在本機工作階段的 motion-review；最終測試及公開部署狀態記於 [實作計畫](../IMPLEMENTATION-PLAN.md)。手繪姿勢是有意停頓的逐格動態，並非高影格率 3D 影片；iOS 實機仍未驗證。
