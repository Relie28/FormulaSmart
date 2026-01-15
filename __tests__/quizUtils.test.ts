import { isQuizInProgress } from '../src/utils/quizUtils';

describe('isQuizInProgress', () => {
  it('returns false when index=0, score=0, asvab=false and not submitted', () => {
    expect(isQuizInProgress(0, 0, false, false)).toBe(false);
  });

  it('returns true when user has submitted at least one answer', () => {
    expect(isQuizInProgress(0, 0, false, true)).toBe(true);
  });

  it('returns true when asvabActive is true (timer started)', () => {
    expect(isQuizInProgress(0, 0, true, false)).toBe(true);
  });
});
