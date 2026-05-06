# [專題名稱]

## Proposal Report

### 動機與目標
<!-- 說明為什麼想做這個專題 -->
現代學生與工作者面臨嚴重的分心問題，番茄鐘、待辦清單等工具雖然普遍，但缺乏持續使用的動力。
FOCO 的核心概念是：把「專注」這個行為遊戲化——使用者每完成一段專注計時，就能為自己農場裡的寵物帶來成長資源，累積作物、解鎖道具。

目標：
- 讓使用者「想要」開始專注，而不只是「應該」專注
- 透過寵物與農場的長期經營，建立每日回訪習慣
- 提供任務紀錄與數據視覺化，幫助使用者了解自身專注模式
---

### 競品比較
<!-- 比較目前已經存在可取得的類似工具或應用 -->

| 功能特色 | FOCO ★ | Forest | Habitica | WaterDo | YPT |
|----------|--------|--------|----------|---------|-----|
| 專注計時器 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 分心原因追蹤 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 微反思機制 | ✅ | ❌ | ❌ | ❌ | △ |
| 遊戲化回饋 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 個人風格洞察 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 情緒 / 心理陪伴 | ✅ | △ | ❌ | △ | ❌ |
 
> △ = 部分支援　❌ = 不支援　✅ = 完整支援

**差異化重點：** 競品普遍只做到「計時＋遊戲化獎勵」，但缺乏對專注品質的深度洞察。FOCO 額外提供分心原因追蹤、任務後微反思，以及根據個人行為模式產生的風格洞察，搭配情緒 / 心理陪伴的寵物設計，形成競品難以複製的差異化優勢。

---

 
### 預期功能
<!-- 列出預計實作的功能 -->

### 使用者系統
- Email 註冊 / 登入（含 Token 持久化）
- 個人化暱稱、頭像設定
- 寵物命名與初始選擇

### 專注任務
- 自訂任務名稱與計時長度
- 倒數計時器（可中斷、完成、失敗）
- 完成後發放寵物資源（可種植食物的種子或可購賣商品的金幣）
- 歷史任務紀錄（已完成 / 失敗）

### 寵物系統
- 虛擬寵物（以 emoji 表示）
- 根據使用者專注表現提升等級
- 寵物狀態顯示（心情、等級、經驗值）
### 背包系統
- 道具分類管理
- 道具使用（加速農場、給寵物補充能量等）
### 數據統計
- 每日 / 每週專注時長圖表
- 完成任務數量、連續天數
---

 
### 使用技術
<!-- 使用的語言、框架、工具等 -->

| 層級 | 技術 |
|------|------|
| 框架 | React Native（Expo SDK 54） |
| 路由 | Expo Router v6（file-based routing） |
| 狀態管理 | Zustand v5 |
| HTTP 客戶端 | Axios（含 interceptor） |
| 本地儲存 | expo-secure-store（Token）、AsyncStorage（快取） |
| 語言 | TypeScript |
| 樣式 | StyleSheet（自定義 Design Tokens） |
| 後端（規劃） | Node.js + REST API |
 
---
### Prototype 預計可驗證內容

1. **Onboarding 流程可走通**：Welcome → 註冊 → 設定暱稱 → 選擇寵物 → 同意條款 → 進入主畫面
2. **任務計時核心**：建立任務、倒數計時、完成後顯示結果畫面
3. **專注任務timer**：點擊開始專注 → 倒數 → 收穫
4. **寵物畫面顯示**：顯示寵物狀態（等級、心情）並隨任務完成更新
5. **UI 設計語言一致**：黑白極簡 iOS 風格，全站統一 Design Token

---

## Prototype Report

### 目前進度
<!-- 完成了什麼 -->

- ✅ 完成專案架構建立（Expo Router + Zustand + TypeScript）
- ✅ 完成 Onboarding 全流程畫面（6 個頁面）
- ✅ 完成主應用畫面（Home、Farm、Stats、Backpack、Missions）
- ✅ 建立 Zustand Stores（authStore、userStore、gameStore）
- ✅ 建立 API 服務層（auth、user、game）
- ✅ Design Token 系統（顏色、字體、間距、圓角）
- ✅ PetAvatar 元件（動畫浮動、表情切換）
- ✅ 成功在 iPhone 上透過 Expo Go 執行
### 遇到的困難
<!-- 遇到什麼問題、如何解決或打算如何解決 -->

**1. Expo SDK 版本與 Expo Go 不相容**
- 問題：原始 package.json 使用 SDK 51，但 iPhone 上的 Expo Go 僅支援 SDK 54
- 解法：手動升級所有 Expo 相關套件至 SDK 54 對應版本
**2. New Architecture 啟動崩潰**
- 問題：`app.json` 中設定 `"newArchEnabled": false` 導致 TurboModuleRegistry 錯誤
- 解法：移除該設定，讓 Expo Go 使用預設的 New Architecture
**3. Expo Router 進入點設定錯誤**
- 問題：`package.json` 的 `main` 指向 `index.ts`，導致 Expo Router 無法接管路由
- 解法：改為 `"expo-router/entry"`
**4. `@/` 路徑別名無法解析**
- 問題：tsconfig 缺少 `baseUrl` 與 `paths` 設定
- 解法：補上 `"baseUrl": "."` 與 `"paths": { "@/*": ["./*"] }`
**5. 套件缺失（babel-preset-expo、expo-linking、expo-splash-screen）**
- 問題：部分 Expo 核心套件未安裝在 node_modules
- 解法：逐一透過 `npm install --legacy-peer-deps` 補裝
### 下一步計畫
<!-- 接下來要做什麼 -->

- [ ] 串接後端 API（登入 / 任務 CRUD）
- [ ] 實作任務計時器的 foreground 持續運作
- [ ] 農場倒數計時與收穫邏輯完整實作
- [ ] 寵物等級系統與動畫細化
- [ ] 數據統計圖表（專注時長、連續天數）
- [ ] 背包道具使用效果串接農場 / 寵物

---



## Final Report
 
### 專案說明
 
FOCO 是一款專為學生與工作者設計的專注力養成行動應用程式，結合番茄鐘計時、分心原因追蹤、農場種植與虛擬寵物培育，形成「**專注 → 反思 → 獎勵 → 回訪**」的正向循環。
 
#### 核心模組
 
**1. 專注任務（Missions）**
使用者建立任務並設定計時時長，倒數期間若提前放棄可記錄分心原因（如：手機、社群、環境噪音等）。任務完成後進入微反思畫面，引導使用者回顧本次專注狀態，並發放農場資源（種子、金幣）作為獎勵。
 
**2. 專注計時器（Timer）**
使用者設定一段專注時間後啟動計時，期間系統持續為寵物累積能量與金幣。時間結束後，獎勵自動結算並進入背包，寵物狀態也隨之更新。計時器設計強調「專注即有所得」的即時回饋感，讓每一次坐下來專注都有具體的進展可見。
 
**3. 寵物系統（Pet）**
每位使用者擁有一隻虛擬寵物，寵物等級與心情反映使用者的專注表現——連續完成任務可讓寵物升級，長時間未互動則情緒下滑。寵物以動態 emoji 呈現，具備浮動動畫與心情切換效果。
 
**4. 個人風格洞察（Stats）**
系統記錄每日與每週的專注時長、任務完成率、常見分心原因，並產生個人專注風格標籤（如：「衝刺型」、「穩定型」），幫助使用者了解自身習慣並調整策略。
 
**5. 背包系統（Backpack）**
收穫的農作物與道具存放於背包，道具可用於加速農場生長、補充寵物能量或延長下次任務的獎勵倍率。
 
 
#### 技術架構
 
```
foco-app/
├── app/
│   ├── _layout.tsx          # Root layout，含 session 恢復與路由守衛
│   ├── (auth)/              # 未登入流程：歡迎、註冊、個人設定、選寵物、同意、完成
│   └── (app)/               # 主應用：首頁、計時、任務、統計、背包
├── stores/
│   ├── authStore.ts         # 登入狀態、Token 管理（SecureStore 持久化）
│   ├── userStore.ts         # 使用者資料、寵物狀態、等級計算
│   └── gameStore.ts         # 任務倒數、背包道具
├── services/                # Axios API 層（auth、user、game）
├── components/              # 共用元件（PetAvatar、AppHeader 等）
└── constants/theme.ts       # Design Tokens（顏色、字體、間距、圓角）
```
 
---
 
### 使用方式
 
#### 環境需求
 
- Node.js 18 以上
- iPhone 安裝 **Expo Go**（App Store 免費下載，需支援 Expo SDK 54）
- 與開發電腦連接至**同一個 Wi-Fi 網路**
#### 安裝與啟動
 
```bash
# 1. 進入專案目錄
cd foco-app
 
# 2. 安裝相依套件
npm install --legacy-peer-deps
 
# 3. 啟動 Metro 開發伺服器（--clear 清除快取）
npx expo start --clear
```
 
#### 在 iPhone 執行
 
1. 開啟 iPhone 上的 **Expo Go**
2. 點選「Scan QR Code」
3. 掃描 terminal 顯示的 QR Code
4. App 即自動載入，支援 Hot Reload（存檔即更新）
