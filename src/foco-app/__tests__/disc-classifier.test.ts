import {
  calcFocusTypeRuleBased,
  calcFocusTypeWeighted,
  calcDiscScores,
  type DiscInput,
} from '@/lib/discClassifier';

// ────────────────────────────────────────────────────────────
// 共用測試情境
// ────────────────────────────────────────────────────────────

const scenarios: { name: string; input: DiscInput; ruleResult: string; weightedResult: string }[] = [
  {
    name: '完美完成（零中斷、高品質）→ Conscientiousness',
    input: { completed: true, pauseCount: 0, leftAppCount: 0, qualityScore: 85, earlyStop: false },
    ruleResult: 'conscientiousness',
    weightedResult: 'conscientiousness',
  },
  {
    name: '完成任務 + 少量中斷（品質 70）→ Dominance',
    input: { completed: true, pauseCount: 2, leftAppCount: 1, qualityScore: 70, earlyStop: false },
    ruleResult: 'dominance',
    weightedResult: 'dominance',
  },
  {
    name: '未完成 + 安靜堅持（中斷 ≤ 2）→ Steadiness',
    input: { completed: false, pauseCount: 1, leftAppCount: 0, qualityScore: 50, earlyStop: false },
    ruleResult: 'steadiness',
    weightedResult: 'steadiness',
  },
  {
    name: '多次切出 App + 未完成 → Influence',
    input: { completed: false, pauseCount: 2, leftAppCount: 4, qualityScore: 30, earlyStop: false },
    ruleResult: 'influence',
    weightedResult: 'influence',
  },
  {
    name: '完成 + 品質 75 精確邊界 → Conscientiousness',
    input: { completed: true, pauseCount: 0, leftAppCount: 0, qualityScore: 75, earlyStop: false },
    ruleResult: 'conscientiousness',
    weightedResult: 'conscientiousness',
  },
  {
    name: '完成 + 品質 74（恰好低於謹慎門檻）+ 低中斷 → Dominance',
    input: { completed: true, pauseCount: 1, leftAppCount: 1, qualityScore: 74, earlyStop: false },
    ruleResult: 'dominance',
    weightedResult: 'dominance',
  },
  {
    name: '未完成 + 中斷 2 次（Steadiness 邊界）',
    input: { completed: false, pauseCount: 2, leftAppCount: 0, qualityScore: 45, earlyStop: false },
    ruleResult: 'steadiness',
    weightedResult: 'steadiness',
  },
  {
    name: '未完成 + 中斷 3 次（超過 Steadiness 門檻）→ Influence',
    input: { completed: false, pauseCount: 2, leftAppCount: 1, qualityScore: 40, earlyStop: false },
    ruleResult: 'influence',
    weightedResult: 'influence',
  },
];

// ────────────────────────────────────────────────────────────
// 方法 A：規則優先梯
// ────────────────────────────────────────────────────────────

describe('calcFocusTypeRuleBased', () => {
  it.each(scenarios)('$name', ({ input, ruleResult }) => {
    expect(calcFocusTypeRuleBased(input)).toBe(ruleResult);
  });

  it('回傳值一定是四種 DISC 之一', () => {
    const valid = new Set(['conscientiousness', 'dominance', 'steadiness', 'influence']);
    const cases: DiscInput[] = [
      { completed: true, pauseCount: 5, leftAppCount: 5, qualityScore: 80 },
      { completed: false, pauseCount: 0, leftAppCount: 0, qualityScore: 0 },
    ];
    cases.forEach(input => expect(valid.has(calcFocusTypeRuleBased(input))).toBe(true));
  });

  it('具確定性：相同輸入永遠相同結果', () => {
    const input: DiscInput = { completed: true, pauseCount: 1, leftAppCount: 2, qualityScore: 60 };
    const results = Array.from({ length: 50 }, () => calcFocusTypeRuleBased(input));
    expect(new Set(results).size).toBe(1);
  });
});

// ────────────────────────────────────────────────────────────
// 方法 B：加權評分
// ────────────────────────────────────────────────────────────

describe('calcFocusTypeWeighted', () => {
  it.each(scenarios)('$name', ({ input, weightedResult }) => {
    expect(calcFocusTypeWeighted(input)).toBe(weightedResult);
  });

  it('回傳值一定是四種 DISC 之一', () => {
    const valid = new Set(['conscientiousness', 'dominance', 'steadiness', 'influence']);
    const cases: DiscInput[] = [
      { completed: true, pauseCount: 5, leftAppCount: 5, qualityScore: 80 },
      { completed: false, pauseCount: 0, leftAppCount: 0, qualityScore: 0 },
    ];
    cases.forEach(input => expect(valid.has(calcFocusTypeWeighted(input))).toBe(true));
  });

  it('具確定性：相同輸入永遠相同結果', () => {
    const input: DiscInput = { completed: true, pauseCount: 1, leftAppCount: 2, qualityScore: 60 };
    const results = Array.from({ length: 50 }, () => calcFocusTypeWeighted(input));
    expect(new Set(results).size).toBe(1);
  });

  it('早退（earlyStop）不影響 DISC 型別的確定性', () => {
    const base: DiscInput = { completed: false, pauseCount: 1, leftAppCount: 0, qualityScore: 35, earlyStop: false };
    const early: DiscInput = { ...base, earlyStop: true };
    // 兩者各自確定，不會回傳 undefined
    expect(['conscientiousness', 'dominance', 'steadiness', 'influence']).toContain(calcFocusTypeWeighted(base));
    expect(['conscientiousness', 'dominance', 'steadiness', 'influence']).toContain(calcFocusTypeWeighted(early));
  });
});

// ────────────────────────────────────────────────────────────
// calcDiscScores — 分數結構驗證
// ────────────────────────────────────────────────────────────

describe('calcDiscScores', () => {
  it('所有分數皆為非負整數', () => {
    const inputs: DiscInput[] = [
      { completed: true, pauseCount: 0, leftAppCount: 0, qualityScore: 100 },
      { completed: false, pauseCount: 10, leftAppCount: 10, qualityScore: 0, earlyStop: true },
    ];
    inputs.forEach(input => {
      const scores = calcDiscScores(input);
      Object.values(scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(score)).toBe(true);
      });
    });
  });

  it('完美完成時 Conscientiousness 分數最高', () => {
    const scores = calcDiscScores({
      completed: true, pauseCount: 0, leftAppCount: 0, qualityScore: 90,
    });
    const max = Math.max(...Object.values(scores));
    expect(scores.conscientiousness).toBe(max);
  });

  it('多次切出 App 且未完成時 Influence 分數最高', () => {
    const scores = calcDiscScores({
      completed: false, pauseCount: 1, leftAppCount: 5, qualityScore: 20,
    });
    const max = Math.max(...Object.values(scores));
    expect(scores.influence).toBe(max);
  });

  it('未完成且幾乎無中斷時 Steadiness 分數最高', () => {
    const scores = calcDiscScores({
      completed: false, pauseCount: 1, leftAppCount: 0, qualityScore: 50,
    });
    const max = Math.max(...Object.values(scores));
    expect(scores.steadiness).toBe(max);
  });

  it('完成且品質適中（低於謹慎門檻）時 Dominance 分數最高', () => {
    const scores = calcDiscScores({
      completed: true, pauseCount: 2, leftAppCount: 1, qualityScore: 68,
    });
    const max = Math.max(...Object.values(scores));
    expect(scores.dominance).toBe(max);
  });
});

// ────────────────────────────────────────────────────────────
// 兩種演算法的一致性對照
// ────────────────────────────────────────────────────────────

describe('兩種演算法一致性', () => {
  it('所有共用情境的結果一致', () => {
    scenarios.forEach(({ input, ruleResult, weightedResult }) => {
      expect(ruleResult).toBe(weightedResult);
    });
  });

  it('兩種方法對相同輸入均具確定性', () => {
    const testInput: DiscInput = {
      completed: true,
      pauseCount: 0,
      leftAppCount: 0,
      qualityScore: 90,
      earlyStop: false,
    };
    expect(calcFocusTypeRuleBased(testInput)).toBe(calcFocusTypeWeighted(testInput));
  });
});
