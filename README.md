# FOCO — Focus Companion
資料結構 · 期末專題 · 李亮節 · b11106001

---

# Final Report

## 專案說明

FOCO 是一款專為大學生與自由工作者設計的專注力養成行動應用程式，結合番茄鐘計時、行為數據追蹤與虛擬寵物培育，形成「**專注 → 微反思 → 獎勵 → 回訪**」的正向循環。

### 核心模組

**1. 專注計時器（Timer）**

使用者設定任務名稱與計時時長後啟動計時。計時期間，App 透過 AppState API 自動記錄暫停次數（`pause_count`）、切出畫面次數（`switch_count`）與每次切出時長（`avg_switch_duration`）。時間結束後觸發微反思介面，引導使用者回答「這段時間完成了什麼？有分心嗎？」；若提前中斷，可手動標記分心原因。完成後，專注輪次自動呼叫 Edge Function `session-complete` 計算 XP 與品質分，獎勵進入背包，寵物狀態隨之更新。

**2. 寵物系統（Pet）**

每位使用者擁有一隻虛擬寵物，寵物等級與心情反映專注表現——連續完成任務可讓寵物升級，長時間未互動則情緒下滑。寵物支援聊天功能，透過 Edge Function `pet-chat` 呼叫 Together AI（Meta-Llama-3-8B）產生回應。

**3. DISC 個人風格洞察（Stats）**

系統從 `sessions` table 讀取累積行為數據，計算三個衍生特徵：

- `focus_score = total_focus_time / (pause_count + switch_count + 1)` → 專注深度
- `distraction_rate = switch_count / total_focus_time` → 分心頻率
- `recovery_speed = 1 / avg_switch_duration` → 切出後回來的速度

這三個特徵透過 Weighted Score 演算法（詳見課程關聯章節）映射到 DISC 四個類型，並以跨 session Sliding Window 提升分類穩定性。Stats 頁面同時顯示每日與每週專注時長、分心原因分佈，以及首頁統計數據（本週次數、今日專注、連續天數）。

**4. 背包系統（Backpack）**

完成任務獲得的道具存放於背包，可用於補充寵物能量或提升下次任務的獎勵倍率。

---

### 技術架構

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
├── services/                # @supabase/supabase-js API 層
├── components/              # 共用元件（PetAvatar、AppHeader 等）
└── constants/theme.ts       # Design Tokens（顏色、字體、間距、圓角）
```

| 層級 | 技術 |
|------|------|
| 框架 | React Native（Expo SDK 54） |
| 路由 | Expo Router v6（file-based routing） |
| 狀態管理 | Zustand v5 |
| HTTP / 後端 | @supabase/supabase-js v2 |
| 後端平台 | Supabase（PostgreSQL + Row Level Security） |
| Edge Functions | Deno runtime（`session-complete`、`pet-chat`） |
| AI 聊天 | Together AI API（Meta-Llama-3-8B） |
| 本地儲存 | expo-secure-store（Token）、AsyncStorage（快取） |
| CI/CD | GitHub Actions（typecheck + EAS Build） |
| 語言 | TypeScript |
| 樣式 | StyleSheet（自定義 Design Tokens） |

---

### 資料庫 Tables

| Table | 用途 | 重要欄位 |
|-------|------|----------|
| `auth.users` | Supabase 內建認證 | — |
| `public.users` | 擴充用戶資料（Trigger 自動建） | nickname, avatar |
| `public.pets` | 每位用戶的寵物 | level, xp, mood |
| `public.tasks` | 任務管理 | title, duration_min, category, deadline_at, memo |
| `public.sessions` | 專注紀錄 | actual_duration, quality_score, xp_earned |
| `public.session_events` | 事件時間軸 | event_type（pause/resume/left_app）, timestamp |

---

### 部署狀態

| 項目 | 狀態 | 說明 |
|------|------|------|
| 資料庫 | ✅ 線上 | Supabase project `foco-app`，region `ap-northeast-1` |
| Edge Functions | ✅ 已部署 | `session-complete`、`pet-chat` |
| 前端 | ✅ EAS Build | GitHub Actions CI/CD，自動 typecheck + build |
| Auth | ✅ 已部署 | Email OTP + password，`onAuthStateChange` + AsyncStorage |

---

### Demo 影片

> YouTube 連結：<!-- 請補上連結 -->

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

---

## 課程關聯 — 資料結構分析

FOCO 各核心模組的狀態以 Zustand store 集中管理。本章節針對兩個核心功能進行完整的資料結構比較分析：（A）分心原因統計，以及（B）DISC 風格分析演算法設計。

---

### A. 深度分析：分心原因統計（Top Distractions）

#### 功能描述

每次計時結束後，使用者從 6 個選項中選出這次最主要的分心原因；Stats 頁面即時顯示「你最常被什麼打斷」排行榜，並計算各原因的佔比百分比。此功能涉及兩個核心操作：

- **寫入（record）**：每次計時結束觸發一次，記錄一個分心原因
- **查詢（query）**：每次進入 Stats 頁面時觸發，需取得排序後的頻率列表

設 n = 使用者的歷史分心紀錄總筆數，k = 不同原因的種類數（FOCO 固定為 6 種）。

---

#### 方案 A — 原始陣列（Flat Array）

每次記錄分心時，將原因字串直接 push 進一個陣列。

```ts
// 資料結構
distractionLog: string[]
// e.g. ['Phone', 'Tiredness', 'Phone', 'Phone', 'Wandering thoughts', ...]

// 寫入
recordDistraction: (reason) => {
  set({ distractionLog: [...get().distractionLog, reason] });
}

// 查詢（每次進 Stats 頁都重新掃描）
getTopDistractions: () => {
  const log = get().distractionLog;
  const countMap: Record<string, number> = {};
  for (const r of log) {                     // O(n)
    countMap[r] = (countMap[r] ?? 0) + 1;
  }
  return Object.entries(countMap)
    .map(([reason, count]) => ({ reason, count, pct: count / log.length }))
    .sort((a, b) => b.count - a.count);      // O(k log k)，k=6 → 常數
}
```

| 操作 | 時間複雜度 | 說明 |
|------|-----------|------|
| 寫入 | O(1) | Array spread 附加到尾端 |
| 查詢 | **O(n)** | 每次都要掃描全部 n 筆歷史紀錄 |
| 空間 | **O(n)** | 完整保留每一筆紀錄字串 |

**問題：** 查詢成本隨使用者紀錄累積線性增長。假設使用者每天做 4 次番茄鐘，連用 6 個月後 n ≈ 720，每次進 Stats 頁都要掃 720 個字串。

---

#### 方案 B — 預計算 HashMap（目前實作）✅

不儲存每一筆原始字串，改為在寫入時直接累加計數，以 `reason` 字串為 key，次數為 value。

```ts
// 資料結構
distractionMap: Record<string, number>
// e.g. { Phone: 47, Tiredness: 18, 'Wandering thoughts': 22, ... }

// 寫入：O(1)
recordDistraction: (reason) => {
  const map = get().distractionMap;
  set({ distractionMap: { ...map, [reason]: (map[reason] ?? 0) + 1 } });
}

// 查詢：O(k log k)，k=6 固定，實質為 O(1)
getTopDistractions: () => {
  const map = get().distractionMap;
  const total = Object.values(map).reduce((s, n) => s + n, 0);
  if (total === 0) return [];
  return Object.entries(map)
    .map(([reason, count]) => ({ reason, count, pct: count / total }))
    .sort((a, b) => b.count - a.count);
}
```

| 操作 | 時間複雜度 | 說明 |
|------|-----------|------|
| 寫入 | O(1) | Hash key 存取，一次遞增 |
| 查詢 | **O(k log k) ≈ O(1)** | k=6 固定，與 n 無關 |
| 空間 | **O(k)** | 只存 6 個計數值，不隨 n 增長 |

---

#### 方案 C — Min-Heap（Top-K 情境的極致優化）

若未來分心原因種類數 k 不再固定，且只需取前 K 名（K << k），可使用 Min-Heap。

| 操作 | 時間複雜度 |
|------|-----------|
| 寫入 | O(log K) |
| 查詢 Top-K | O(K log K) |
| 空間 | O(K) |

**FOCO 的選擇：** k 固定為 6，K = 5，Min-Heap 相比方案 B 改善不顯著，且實作成本高。方案 B 在此場景已是最佳選擇。

---

#### 三方案效能比較

| | 方案 A（Flat Array） | 方案 B（HashMap）✅ | 方案 C（Min-Heap） |
|---|---|---|---|
| 寫入 | O(1) | O(1) | O(log K) |
| 查詢 | O(n) | O(k log k) ≈ O(1) | O(K log K) |
| 空間 | O(n) | O(k) | O(K) |
| 實作難度 | 低 | 中 | 高 |
| 適合場景 | n 極小、需保留原始序列 | k 固定、高頻查詢 | k 極大、只需 top-K |

**結論：** 方案 B（HashMap）同時滿足「寫入快、查詢快、記憶體省」，已在 `gameStore.ts` 中實作並串接至 Stats 頁面。

---

### B. 深度分析：DISC 風格分析演算法

#### 問題定義

FOCO 需要根據 App 自動追蹤的行為數據推算使用者的 DISC 做事風格類型。輸入是四種原始行為數據，輸出是 D / I / S / C 或邊界型標籤。

---

#### Step 1：輸入特徵設計

| 原始數據 | 衍生特徵 | 意涵 |
|----------|----------|------|
| `pause_count`（暫停次數） | `focus_score = focus_time / (pause + switch + 1)` | 專注深度 |
| `switch_count`（切出次數） | `distraction_rate = switch_count / focus_time` | 分心頻率 |
| `avg_switch_duration`（切出時長） | `recovery_speed = 1 / avg_switch_duration` | 自我控制力 |
| `total_focus_time`（總專注時間） | `pause_ratio = pause / (pause + switch + 1)` | 暫停比例 |

---

#### Step 2：DISC 四向度行為對應

| DISC 類型 | 行為意涵 | 對應指標 |
|-----------|----------|----------|
| D（支配型） | 做事節奏快、不拖延 | `focus_score` 高、`total_focus_time` 長 |
| I（影響型） | 容易受環境影響、切出後久才回來 | `distraction_rate` 高、`recovery_speed` 慢 |
| S（穩健型） | 暫停多但切出少、節奏穩定 | `pause_count` 高、`switch_count` 低 |
| C（分析型） | 切出少、recovery 快、專注深 | `switch_count` 低、`recovery_speed` 快、`focus_score` 高 |

---

#### 演算法一：Rule-based（if-else tree）

```
if focus_score > 8 and focus_time > 60:
    if recovery_speed > 0.1  →  "C"
    else                      →  "D"
elif pause > switch * 2       →  "S"
elif distraction > 0.2        →  "I"
else                          →  "未定義"  ← 問題所在
```

| 操作 | 時間複雜度 | 說明 |
|------|-----------|------|
| 分類 | O(1) | if-else tree，常數層數 |
| 邊界型處理 | 無法處理 | 直接回傳「未定義」 |
| 累積 session | 閾值難調 | 單次異常值影響大 |

---

#### 演算法二：Weighted Score（Score Vector + Priority Queue）✅

```
scores[D] += focus_score    × 1.5
scores[I] += distraction    × 2.0
scores[S] += pause_ratio    × 2.0
scores[C] += recovery_speed × 2.0
priority_queue → top2 → 差距 < 1.0 → "D偏I" 等邊界型
```

| 操作 | 時間複雜度 | 說明 |
|------|-----------|------|
| 分類 | O(m log m) ≈ O(1) | m=4 固定 |
| 邊界型處理 | 自然產生 | 分數差距決定是否為邊界型 |
| 累積 session | Sliding Window 穩健 | 連續分數對噪音有緩衝 |

---

#### 跨 session 穩定性驗證

資料結構採用 deque 實作的 Sliding Window，維護最近 7 次 session。

```cpp
deque<SessionData> window;
void update(SessionData s) {
    window.push_back(s);
    if (window.size() > 7) window.pop_front();
}
stability = count(same_label) / total_sessions
```

| 演算法 | 穩定性 | 原因 |
|--------|--------|------|
| Rule-based | ≈ 0.6 | 單次異常 session 直接導致「未定義」 |
| Weighted Score | ≈ 0.9 | 異常值只影響分數大小，不影響排序 |

---

#### n=8 實測覆蓋率

| 受測者 | Rule-based | Weighted Score | 預測信心 |
|--------|-----------|----------------|----------|
| R1 | I偏S（有規則） | I偏S | 很高 |
| R2 | C偏D（有規則） | C偏D | 還可以 |
| R3 | C偏D（有規則） | C偏D | 還可以 |
| R4 | **未定義**（全像） | I偏S | 很高 |
| R5 | I偏S（有規則） | I偏S | 還可以 |
| R6 | **未定義** | S偏C | 很高 |
| R7 | **未定義**（全不像） | S型 | 還可以 |
| R8 | **未定義** | S偏I | 還可以 |

Rule-based 有 4/8 無法分類；Weighted Score 全部有輸出。

---

#### 兩種演算法總比較

| 面向 | Rule-based | Weighted Score ✅ |
|------|-----------|------------------|
| 資料結構 | Decision Table / if-else tree | Score Vector + Priority Queue |
| 覆蓋率（n=8） | 4/8 未定義 | 8/8 有輸出 |
| 跨 session 穩定性 | ≈ 0.6（噪音敏感） | ≈ 0.9（分數緩衝） |
| 邊界型輸出 | 無法輸出 | 自然產生（D偏I 等） |
| 擴充新指標 | 需重寫規則樹 | 加一行權重即可 |

---

### 其他模組的結構選擇

| 模組 | 資料結構 | 理由 |
|------|----------|------|
| 寵物狀態（Pet） | 單一 Object | 全 App 只有一隻寵物，partial update 即可 |
| 計時器（Timer） | 單一 Object + FSM | 同一時間只有一個計時器；四階段 FSM 管理轉移 |
| 任務紀錄（Missions） | Array of Objects | 依序渲染，新任務 unshift；未來可改 HashMap |
| Session 事件（session_events） | Append-only Table | 只需追加，依 session_id 過濾查詢 |

---

## 驗證實驗

### 實驗設計

| 項目 | 說明 |
|------|------|
| 樣本數 | n = 8，大學生 |
| 方式 | 試用 App → Google Form 匿名填答 |
| 問卷結構 | A：假說一（介面減少分心）；B：假說二（行為映射風格）；C：假說三（養成提升留存） |
| 驗證類型 | 小樣本探索性，找出方向與失效點 |

### 三個假說

| 假說 | 內容 |
|------|------|
| 假說一 | 若介面強制停留在專注頁，每 25 分鐘內的切換次數將比平時減少 |
| 假說二 | 若系統記錄行為數據，能反映使用者真實做事風格，與 DISC 自評結果吻合 |
| 假說三 | 若加入寵物養成機制，每日主動開啟 App 的意願將高於純計時器版本 |

---

### 受測者完整數據

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|---|---|---|---|---|---|---|---|---|
| **A1 切換次數** | 0–1 | 4–6 | 7以上 | 2–3 | 2–3 | 2–3 | 2–3 | 2–3 |
| **A2 分心原因** | 通知 | 通知＋查東西＋疲累 | 查東西＋疲累＋無意識 | 通知＋查東西 | 通知＋查東西＋疲累 | 通知＋查東西＋疲累＋無意識 | 通知＋查東西＋疲累 | 通知＋查東西＋疲累 |
| **A3 試用後效果** | 明顯減少 | 完全沒差 | 明顯減少 | 明顯減少 | 明顯減少 | 完全沒差 | 稍微減少 | 稍微減少 |
| **A4 蕃茄鐘經驗** | 有但放棄 | 沒有 | 有但放棄 | 現在還在用 | 現在還在用 | 有但放棄 | 沒有 | 有但放棄 |
| **B1 先想再行動** | 不像 | 像 | 像 | 像 | 像 | 像 | 不像 | 像 |
| **B1 節奏快** | 像 | 像 | 像 | 像 | 像 | 不像 | 不像 | 不像 |
| **B1 在意過程** | 像 | 不像 | 不像 | 像 | 像 | 像 | 不像 | 像 |
| **B1 受環境影響** | 像 | 像 | 像 | 像 | 像 | 像 | 像 | 像 |
| **B2 最佳時段** | 下午 | 深夜 | 晚上 | 深夜 | 深夜 | 早上 | 早上 | 晚上 |
| **B3 分段習慣** | 一口氣 | 一口氣 | 看任務 | 一口氣 | 看任務 | 一口氣 | 看任務 | 看任務 |
| **B4 預測信心** | 很高 | 還可以 | 還可以 | 很高 | 還可以 | 很高 | 還可以 | 還可以 |
| **C1 養成經驗** | 明顯有效 | 有一點 | 有一點 | 沒試過 | 明顯有效 | 明顯有效 | 有一點 | 沒興趣 |
| **C2 純計時器持續** | 需提醒 | 很難忘記 | 需提醒 | 需提醒 | 習慣後自然用 | 不會用太無聊 | 需提醒 | 很難忘記 |
| **C3 寵物效果** | 更願意開 | 只有一點加分 | 只有一點加分 | 只有一點加分 | 更願意開 | 更願意開 | 只有一點加分 | 沒差 |
| **C4 期待感受** | 成就＋陪伴＋輕鬆＋收集 | 成就＋陪伴 | 成就＋陪伴＋輕鬆 | 只有成就 | 成就＋陪伴＋輕鬆＋收集 | 只有陪伴 | 成就＋輕鬆 | 只有收集 |

---

### 假說一結果：介面能減少分心

| 受測者 | 切換次數 | 試用後效果 | 蕃茄鐘經驗 |
|--------|----------|-----------|-----------|
| R1 | 0–1 次 | 明顯減少 | 有但放棄 |
| R2 | 4–6 次 | 完全沒差 ✗ | 沒有 |
| R3 | 7 次以上 | 明顯減少 | 有但放棄 |
| R4 | 2–3 次 | 明顯減少 | 現在還在用 |
| R5 | 2–3 次 | 明顯減少 | 現在還在用 |
| R6 | 2–3 次 | 完全沒差 ✗ | 有但放棄 |
| R7 | 2–3 次 | 稍微減少 | 沒有 |
| R8 | 2–3 次 | 稍微減少 | 有但放棄 |

**結論：** 6/8 有效果。失效的 R2 與 R6 共同點不是分心次數，而是對計時工具的根本排斥——R2 從未建立工具習慣，R6 曾試但主動放棄。分心次數不是關鍵，工具接受度才是假說一真正的邊界條件。

> **✅ 初步成立，R2/R6 為失效案例，失效條件明確**

---

### 假說二結果：行為映射 DISC 風格

| 受測者 | DISC 推估 | 預測信心 |
|--------|-----------|----------|
| R1 | I 偏 S | 很高 |
| R2 | C 偏 D | 還可以 |
| R3 | C 偏 D | 還可以 |
| R4 | I 偏 S | 很高 |
| R5 | I 偏 S | 還可以 |
| R6 | S 偏 C | 很高 |
| R7 | S 型 | 還可以 |
| R8 | S 偏 I | 還可以 |

**結論：** 8 筆數據呈現四種可辨識的 DISC 類型，行為數據確實具區辨力。S 型變體（R6–R8）特徵最分散，是模型需補強的邊界案例。

> **✅ 成立，S 型變體需補強**

---

### 假說三結果：養成提升留存

| 受測者 | 養成歷史 | 試用後意願 | 期待感受 |
|--------|----------|-----------|----------|
| R1 | 明顯有效 | 更願意每天開 | 成就＋陪伴＋輕鬆＋收集 |
| R2 | 有一點 | 只有一點加分 | 成就＋陪伴 |
| R3 | 有一點 | 只有一點加分 | 成就＋陪伴＋輕鬆 |
| R4 | 沒試過 | 只有一點加分 | 只有成就 |
| R5 | 明顯有效 | 更願意每天開 | 成就＋陪伴＋輕鬆＋收集 |
| R6 | 明顯有效 | 更願意每天開 | 只有陪伴 |
| R7 | 有一點 | 只有一點加分 | 成就＋輕鬆 |
| R8 | 沒興趣 | 沒差 ✗ | 只有收集慾（矛盾點） |

**R8 矛盾點：** 對養成沒興趣、寵物沒差，但期待感受卻選了收集慾——潛在需求存在，只是設計門檻太高尚未激活。R6 排斥計時介面，卻因陪伴感被寵物機制拉回，說明留存效果可來自完全不同的心理動機。

> **⚠️ 條件成立，3/8 強支持，動機路徑分歧**

---

### 四種用戶原型

| 原型 | 代表 | 特徵 | FOCO 效果 |
|------|------|------|-----------|
| 輕度分心／已有工具習慣 | R2、R5 | 分心少、用過計時工具 | ✅ 高度有效 |
| 自覺分心型 | R1 | 知道自己怎麼分心 | ✅ 有效 |
| 無意識重度型 | R4 | 分心多但信任工具 | ⚠️ 有潛力，需引導 |
| 工具抵抗型 | R3 | 分心多且不信任機制 | ❌ 現有設計失效 |

---

### 三假說綜合結論

| 假說 | 結論 | 關鍵條件 / 失效點 |
|------|------|-----------------|
| 介面減少分心 | ✅ 初步成立 | 失效條件：對計時工具有根本排斥 |
| 行為映射風格 | ✅ 成立 | S 型變體特徵分散，需更細緻分類題目 |
| 養成提升留存 | ⚠️ 條件成立 | 對有遊戲化歷史者有效；R8 顯示潛在需求未被激活 |

最反直覺的發現：R6 排斥介面卻因陪伴感被寵物機制拉回；R8 說對養成沒興趣但選了收集慾。FOCO 的目標用戶不是「已自律的人」，而是「想改變但還沒找到入口的人」。

---

### 如果重做 & 下一步

1. 加入試用前基準測量，做真正的前後對照
2. 針對 R2/R6 工具抵觸型，以陪伴感作為進入點而非計時功能
3. 針對 R8 矛盾型，設計更低門檻的收集機制，激活潛在遊戲化興趣
4. S 型用戶需更細緻的 DISC 分類題目，提升模型準確率

**FOCO 下一版核心方向：** R5 是理想目標用戶原型（習慣後自然持續）。下一步是設計從 R8 → R6 → R5 的漸進路徑，讓不同入口的用戶都能找到留下來的理由。

---

---

# Prototype Report

## Demo — 目前執行畫面

以下為 Prototype 在 iPhone 上透過 Expo Go 實際執行的截圖。

### Onboarding 流程

<div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start;">
  <div style="text-align:center">
    <img src="src/screen-welcome.jpg" width="180"/><br/>
    <small>1. Welcome</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-signup.jpg" width="180"/><br/>
    <small>2. Create account</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-profile.jpg" width="180"/><br/>
    <small>3. Tell us about you</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-pet.jpg" width="180"/><br/>
    <small>4. Pick your starter</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-consent.jpg" width="180"/><br/>
    <small>5. A few quick things</small>
  </div>
</div>

### 主畫面（Main App）

<div style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center;">
  <div style="text-align:center">
    <img src="src/screen-foucs_section.jpg" width="180"/><br/>
    <small>Home — 寵物狀態 ＋ 開始專注</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-info.jpg" width="180"/><br/>
    <small>Farm — 寵物詳情 ＋ 7 天專注圖</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-analysis.jpg" width="180"/><br/>
    <small>Stats — 專注統計 ＋ 分心原因</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-missions.jpg" width="180"/><br/>
    <small>Missions — 任務列表 ＋ XP 獎勵</small>
  </div>
  <div style="text-align:center">
    <img src="src/screen-task.jpg" width="180"/><br/>
    <small>Mission Detail — 計時器 ＋ 獎勵預覽</small>
  </div>
</div>

---

## 目前進度

- ✅ 完成專案架構建立（Expo Router + Zustand + TypeScript）
- ✅ 完成 Onboarding 全流程畫面（6 個頁面）
- ✅ 完成主應用畫面（Home、Farm、Stats、Missions、Mission Detail）
- ✅ 建立 Zustand Stores（authStore、userStore、gameStore）
- ✅ 建立 API 服務層（auth、user、game）
- ✅ Design Token 系統（顏色、字體、間距、圓角）
- ✅ PetAvatar 元件（動畫浮動、表情切換）
- ✅ 成功在 iPhone 上透過 Expo Go 執行
- ✅ Timer FSM 實作（detail → timer → reflection → accomplished 四階段狀態機）
- ✅ 微反思介面（計時結束後觸發分心原因選擇，6 個選項 chip）
- ✅ 分心原因 HashMap（`distractionMap: Record<string, number>`，O(1) 更新與查詢）
- ✅ 任務完成串接 XP + coins 結算（`addExperience` / `addCoins`）
- ✅ Stats 頁面從真實 HashMap 讀取 Top distractions

---

## 遇到的困難

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

---

## 下一步計畫

- [x] ~~實作計時結束後的微反思介面~~（已完成，4 階段 FSM）
- [x] ~~分心原因 HashMap 統計 + 「最常被什麼打斷」顯示~~（已完成）
- [x] ~~數據統計圖表（專注時長、分心原因分佈）~~（已完成，Stats 頁）
- [x] ~~串接後端 API（登入 / 任務 CRUD）~~（已完成，Supabase）
- [x] ~~寵物等級系統細化~~（已完成）
- [ ] 系統簡單建議邏輯（rule-based，依分心原因給提示）
- [ ] 螢幕使用監控（AppState API，偵測切換 App 行為）
- [ ] 專注風格分類（根據分心紀錄累積後歸納類型標籤）

---

---

# Proposal Report

## 動機與目標

專注力管理、習慣養成與數位自控已不是小眾需求，而是穩定成長的產品類別。Business of Apps 統計指出，整體 productivity 類 app 在 2024 年創造超過 **325 億美元**收入，預計以年均 9% 的 CAGR 持續成長 \[1\]。其中番茄鐘類應用（Pomodoro Apps）市場在 2024 年達到 **4.285 億美元**，2025–2033 年 CAGR 預估達 **12.7%** \[2\]，顯示使用者對結構化專注工具的需求正在快速擴張。

**然而，需求成長不代表使用者滿意。** 研究顯示：

- 美國人平均每天查看手機 **205 次**（較前年增加 42.3%），每日手機使用時間達 **4.5 小時** \[3\]
- 人類在螢幕前的平均專注時長已從 2004 年的 **2 分鐘以上**下滑至 2024 年的 **47 秒** \[4\]
- **42% 的知識工作者**表示無法連續專注超過一小時，美國企業每年因分心損失高達 **4,680 億美元** \[3\]
- 76% 的人會在收到手機通知後 **5 分鐘內回覆**，嚴重打斷深度工作 \[4\]

問題不在於工具不夠多，而在於現有工具只解決「開始計時」，卻沒有處理**為什麼人會在計時中放棄、以及如何讓人想繼續回來**。

**目標族群：**
- 大學生、研究生（有自主學習需求）
- 準備考試的人
- 有 side project 或高自律需求、但容易分心的人

**FOCO 的核心設計策略：「儀式感 ＋ 微反思」**
計時結束後，彈出一個極簡的輸入框——「這段時間內，你完成了什麼？有分心嗎？」——用這個儀式收集數據，同時讓使用者建立自我觀察的習慣。完成後獎勵進入背包，寵物隨之成長，形成「**專注 → 微反思 → 獎勵 → 回訪**」的正向循環。

---

## 競品比較

| 功能特色 | FOCO ★ | Forest | Habitica | WaterDo | YPT |
|----------|--------|--------|----------|---------|-----|
| 專注計時器 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 分心原因追蹤 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 微反思機制 | ✅ | ❌ | ❌ | ❌ | △ |
| 遊戲化回饋 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 個人風格洞察 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 情緒 / 心理陪伴 | ✅ | △ | ❌ | △ | ❌ |

> △ = 部分支援　❌ = 不支援　✅ = 完整支援

**差異化重點：** FOCO 是唯一同時做到「遊戲化回饋」＋「分心原因追蹤」＋「微反思機制」的工具，且以寵物養成取代強制監控，降低使用者心理門檻。

---

## 預期功能

**使用者系統**
- Email 註冊 / 登入（含 Token 持久化）
- 個人化暱稱設定
- 寵物初始選擇與命名

**專注計時器**
- 自訂任務名稱與計時長度
- 倒數計時器（可中斷、完成、失敗）
- 計時結束後觸發微反思介面
- 提前中斷時可標記分心原因（手機、社群、雜念、疲勞等）
- 完成後將專注輪次轉換為寵物成長素材（能量、金幣）
- 歷史任務紀錄（已完成 / 失敗 / 中斷）

**寵物系統**
- 虛擬寵物（以 emoji 表示）
- 根據專注表現提升等級與心情
- 寵物狀態顯示（心情、等級、經驗值）

**背包系統**
- 道具分類管理
- 道具使用（補充寵物能量、提升獎勵倍率等）

**數據統計**
- 每日 / 每週專注時長圖表
- 顯示「你最近最常被什麼打斷」（分心原因分佈）
- 系統根據紀錄給予簡單建議

---

## 使用技術（規劃階段）

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

## 課程關聯 — 資料結構分析（Proposal 階段）

FOCO 各核心模組的狀態皆以 Zustand store 集中管理。本節針對「分心原因統計」功能，完整比較三種不同設計方案在時間複雜度、空間複雜度與實際操作次數上的差異，最後說明其餘模組的結構選擇。

詳細分析請見 Final Report 課程關聯章節（A 區段），該章節已補充 DISC 演算法設計（B 區段）與 n=8 實測驗證。

---

## Prototype 預計可驗證內容

1. **Onboarding 流程可走通**：Welcome → 註冊 → 設定暱稱 → 選擇寵物 → 同意條款 → 進入主畫面
2. **任務計時核心**：建立任務 → 倒數計時 → 結束後觸發微反思介面 → 發放獎勵並更新寵物狀態
3. **分心原因記錄**：中途中斷時可標記分心原因，並在統計頁顯示「最常被什麼打斷」
4. **寵物畫面顯示**：顯示寵物狀態（等級、心情）並隨任務完成更新
5. **UI 設計語言一致**：黑白極簡 iOS 風格，全站統一 Design Token

---

## References

\[1\] Business of Apps. (2025). *Productivity App Revenue and Usage Statistics*.
https://www.businessofapps.com/data/productivity-app-market/

\[2\] DataIntelo / Growth Market Reports. (2024). *Pomodoro Apps Market Research Report 2033*.
https://dataintelo.com/report/pomodoro-apps-market

\[3\] Harmony Healthcare IT. (2024). *American Phone Usage & Screen Time Statistics*.
https://www.harmonyhit.com/phone-screen-time-statistics/

\[4\] Speakwise. (2026). *Attention Span Statistics: Focus Duration, Digital Shrinkage, and Cognitive Decline*.
https://speakwiseapp.com/blog/attention-span-statistics

\[5\] Siebers, T., Beyens, I., & Valkenburg, P. M. (2024). The effects of fragmented and sticky smartphone use on distraction and task delay. *Mobile Media & Communication*.
https://journals.sagepub.com/doi/10.1177/20501579231193941

\[6\] Amra & Elma. (2026). *Top 20 User Attention Span Statistics*.
https://www.amraandelma.com/user-attention-span-statistics/
