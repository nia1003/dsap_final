// DISC 專注類型分類器 — 兩種演算法
//
// 輸入維度（均來自每次 session 結束後的行為數據）：
//   completed       — 是否完成目標時長
//   pauseCount      — 主動暫停次數
//   leftAppCount    — 切出 App 次數
//   qualityScore    — 品質分（0–100，由 calcQualityScore 產生）
//   earlyStop       — 是否提前放棄

import type { FocusType } from '@/types';

export interface DiscInput {
  completed: boolean;
  pauseCount: number;
  leftAppCount: number;
  qualityScore: number;
  earlyStop?: boolean;
}

// ── 方法 A：規則優先梯（Rule-based Priority Ladder） ──────────
//
// 用一組互斥的 if-else 條件，依優先序判斷 DISC 類型。
// 優點：邏輯透明、可預測、易於向使用者解釋「為什麼」。
// 缺點：邊界附近的 session 容易被一個條件搶走，不夠細緻。
//
// 判斷順序（優先序由高到低）：
//   1. Conscientiousness — 完成 + 高品質（≥75）
//   2. Dominance         — 完成 + 中斷少（≤3 次）
//   3. Steadiness        — 未完成 + 幾乎無中斷（≤2 次）
//   4. Influence         — 其餘（分心多、未完成）
export function calcFocusTypeRuleBased(input: DiscInput): FocusType {
  const { completed, pauseCount, leftAppCount, qualityScore } = input;
  const totalInterrupts = pauseCount + leftAppCount;

  if (completed && qualityScore >= 75) return 'conscientiousness';
  if (completed && totalInterrupts <= 3) return 'dominance';
  if (!completed && totalInterrupts <= 2) return 'steadiness';
  return 'influence';
}

// ── 方法 B：加權評分（Weighted Scoring） ─────────────────────
//
// 對四種 DISC 類型各自獨立計算一個分數，取最高者。
// 每個類型的分數由「與該類型行為特徵吻合程度」的多個維度加總而來。
// 優點：行為訊號更細緻；邊界 session 不會硬切；分數差距可供前端顯示。
// 缺點：閾值為人工設定，仍有主觀判斷空間。
//
// 四種類型的核心行為特徵：
//   D (Dominance)        — 完成任務、低中斷、高意志力
//   I (Influence)        — 切出 App 多、容易分心、未完成
//   S (Steadiness)       — 主動暫停而非切出 App、未完成但沒放棄
//   C (Conscientiousness)— 完成任務、高品質、幾乎零中斷

export interface DiscScores {
  dominance: number;
  influence: number;
  steadiness: number;
  conscientiousness: number;
}

export function calcDiscScores(input: DiscInput): DiscScores {
  const { completed, pauseCount, leftAppCount, qualityScore, earlyStop = false } = input;
  const totalInterrupts = pauseCount + leftAppCount;

  // ── Dominance ──────────────────────────────────────────────
  // 完成任務 +35，品質 ≥60 +20（否則按比例），中斷 ≤3 +30（每多1次-6），沒提前放棄 +5
  let d = 0;
  if (completed) d += 35;
  d += qualityScore >= 60 ? 20 : Math.round(qualityScore * 0.3);
  d += totalInterrupts <= 3
    ? 30
    : Math.max(0, 30 - (totalInterrupts - 3) * 6);
  if (!earlyStop) d += 5;

  // ── Influence ─────────────────────────────────────────────
  // 切出 App ≥3 +35（否則每次 +10），未完成 +20，品質 <55 +20，主動暫停 ≥2 +15
  let i = 0;
  i += leftAppCount >= 3 ? 35 : leftAppCount * 10;
  if (!completed) i += 20;
  if (qualityScore < 55) i += 20;
  if (pauseCount >= 2) i += 15;

  // ── Steadiness ────────────────────────────────────────────
  // 未完成 + 中斷 ≤2 +40，暫停 ≥ 切出 App（代表主動休息而非被動分心）+25，
  // 品質 35–74（努力但未達最佳）+20，沒提前放棄（撐到計時器結束）+15
  let s = 0;
  if (!completed && totalInterrupts <= 2) s += 40;
  if (pauseCount >= leftAppCount) s += 25;
  if (qualityScore >= 35 && qualityScore < 75) s += 20;
  if (!earlyStop) s += 15;

  // ── Conscientiousness ─────────────────────────────────────
  // 完成任務 +30，品質 ≥75 +45（≥60 +15），中斷 ≤1 +25（≤3 +10）
  let c = 0;
  if (completed) c += 30;
  if (qualityScore >= 75) c += 45;
  else if (qualityScore >= 60) c += 15;
  if (totalInterrupts <= 1) c += 25;
  else if (totalInterrupts <= 3) c += 10;

  return { dominance: d, influence: i, steadiness: s, conscientiousness: c };
}

export function calcFocusTypeWeighted(input: DiscInput): FocusType {
  const scores = calcDiscScores(input);

  // 同分時優先序：C > D > S > I（代表更高品質的預設）
  const order: FocusType[] = ['conscientiousness', 'dominance', 'steadiness', 'influence'];
  return order.reduce((best, type) =>
    scores[type] > scores[best] ? type : best
  );
}

// ── 預設匯出：目前採用的演算法 ───────────────────────────────
// 改變這裡即可全局切換策略，而不用修改呼叫端。
export function calcFocusType(input: DiscInput): FocusType {
  return calcFocusTypeWeighted(input);
}
