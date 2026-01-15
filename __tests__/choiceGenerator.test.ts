import { generateChoices } from '../src/utils/choiceGenerator';

describe('choiceGenerator', () => {
  it('returns 4 choices with 1 correct and 3 distractors', () => {
    const res = generateChoices('20', 1);
    expect(res.choices.length).toBe(4);
    const correctCount = res.choices.filter((c) => c === '20').length;
    expect(correctCount).toBe(1);
  });

  it('includes partial distractor for tier >=3', () => {
    const res = generateChoices('100', 4);
    // check that distractor_logic includes at least one 'partial'
    const vals = Object.values(res.distractor_logic);
    expect(vals.some((v) => v === 'partial')).toBeTruthy();
  });

  it('uses rounding for tier < 3', () => {
    const res = generateChoices('13.37', 2);
    const vals = Object.values(res.distractor_logic);
    expect(vals.some((v) => v === 'rounding')).toBeTruthy();
  });

  it('distributes correct index roughly evenly', () => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 400; i++) {
      const r = generateChoices(String(50 + (i % 7)), (i % 6) + 1);
      const idx = r.choices.findIndex((c) => c === String(50 + (i % 7)));
      counts[idx]++;
    }
    // none should be zero and max-min should be within a reasonable range
    expect(counts.every((c) => c > 0)).toBeTruthy();
    const diff = Math.max(...counts) - Math.min(...counts);
    expect(diff).toBeLessThan(100);
  });
});
