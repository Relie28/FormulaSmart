import { hintForWordProblem } from '../src/utils/wordHints';
import { cards } from '../src/data/cards';

describe('word problem hints', () => {
  it('provides specific keywords for rectangle area prompt and does not reveal numbers', () => {
    const card = cards.find((c) => c.id === 'word-1');
    expect(card).toBeDefined();
    const hint = hintForWordProblem(card!.prompt);
    expect(/wide|tall/i.test(hint)).toBe(true);
    // should not include digits of the answer
    expect(/[0-9]/.test(hint)).toBe(false);
  });

  it('provides right-triangle hint for legs (pythagorean) and avoids numeric answers', () => {
    const card = cards.find((c) => c.id === 'word-pyth-1');
    expect(card).toBeDefined();
    const hint = hintForWordProblem(card!.prompt);
    expect(/legs|right|pythagor/i.test(hint)).toBe(true);
    expect(/[0-9]/.test(hint)).toBe(false);
  });

  it('detects rate/distance problems from miles/hour phrasing', () => {
    const card = cards.find((c) => c.id === 'word-2');
    expect(card).toBeDefined();
    const hint = hintForWordProblem(card!.prompt);
    expect(/rate|distance|time|per/i.test(hint)).toBe(true);
    expect(/[0-9]/.test(hint)).toBe(false);
  });

  it('detects ratio/parts problems', () => {
    const card = cards.find((c) => c.id === 'word-4');
    expect(card).toBeDefined();
    const hint = hintForWordProblem(card!.prompt);
    expect(/ratio|parts/i.test(hint)).toBe(true);
    expect(/[0-9]/.test(hint)).toBe(false);
  });

  it('gives correct hint for factors questions and does not mislead with "of" as multiplication', () => {
    const prompt = 'What are the factors of 12?';
    const hint = hintForWordProblem(prompt);
    expect(/factor|factors/i.test(hint)).toBe(true);
    // should not suggest a non-specific 'of' multiplication hint
    expect(/\bof\b/i.test(hint)).toBe(false);
    expect(/[0-9]/.test(hint)).toBe(false);
  });

  it('does not match factor inside factorial (no false positive)', () => {
    const prompt = 'What is 5 factorial?';
    const hint = hintForWordProblem(prompt);
    // should not incorrectly suggest 'factors' for factorial
    expect(/factor\b/i.test(hint)).toBe(false);
  });

  it('detects percent/of patterns and suggests percent handling', () => {
    const prompt = 'What is 30% of 20?';
    const hint = hintForWordProblem(prompt);
    expect(/percent/i.test(hint)).toBe(true);
    // we intentionally do not include a generic 'of' hint to avoid misleading hints for other contexts
    expect(/[0-9]/.test(hint)).toBe(false);
  });

  it('recommends PEMDAS for expressions with parentheses or multiple operators without defining it', () => {
    const prompt = 'Evaluate 3 + (4 * 2)';
    const hint = hintForWordProblem(prompt);
    expect(/pemdas/i.test(hint)).toBe(true);
    expect(/[0-9]/.test(hint)).toBe(false);
    // should not spell out the letters of PEMDAS in the hint
    expect(/parentheses.*exponents|addition.*subtraction/i.test(hint)).toBe(false);
  });
});
