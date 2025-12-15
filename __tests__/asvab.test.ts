import { buildAsvabPool, computeAfqtEstimate } from '../src/utils/asvab';
import { cards } from '../src/data/cards';

test('buildAsvabPool selects 45 questions and includes word problems', () => {
    const pool = buildAsvabPool(cards, 45, 10);
    expect(pool.length).toBe(45);
    const wp = pool.filter((c) => c.subject === 'Word Problems').length;
    expect(wp).toBeGreaterThanOrEqual(0);
    // If the dataset has at least 10 word problems, ensure we included 10
    const totalWordInData = cards.filter((c) => c.subject === 'Word Problems').length;
    if (totalWordInData >= 10) expect(wp).toBeGreaterThanOrEqual(10);
});

test('computeAfqtEstimate maps correct/total to 0-99 scale', () => {
    expect(computeAfqtEstimate(0, 45)).toBe(0);
    expect(computeAfqtEstimate(45, 45)).toBe(99);
    expect(computeAfqtEstimate(22, 45)).toBe(Math.round((22 / 45) * 100));
});
