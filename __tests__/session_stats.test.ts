import computeSessionSummary from '../src/utils/sessionStats';

describe('computeSessionSummary', () => {
  const allCards = [
    { id: 'a', type: 'word' },
    { id: 'b', type: 'word' },
    { id: 'c', type: 'shape' }
  ] as any;

  it('counts unique corrects and totals', () => {
    const results = [{ id: 'a', correct: true }, { id: 'a', correct: false }, { id: 'b', correct: false }];
    const { score, total, countsByType } = computeSessionSummary(results as any, allCards as any);
    expect(total).toBe(3);
    // only 'a' was correct at least once
    expect(score).toBe(1);
    expect(countsByType.word.total).toBe(2);
    expect(countsByType.word.correct).toBe(1);
    expect(countsByType.shape.total).toBe(1);
    expect(countsByType.shape.correct).toBe(0);
  });

  it('returns zero score when no correct answers', () => {
    const results: any[] = [];
    const { score, total } = computeSessionSummary(results, allCards as any);
    expect(score).toBe(0);
    expect(total).toBe(3);
  });
});
