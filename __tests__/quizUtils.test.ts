import { isQuizInProgress } from '../src/utils/quizUtils';

describe('isQuizInProgress', () => {
  it('returns false when index=0, score=0, asvab=false', () => {
    expect(isQuizInProgress(0, 0, false)).toBe(false);
  });

  it('returns true when index>0', () => {
    expect(isQuizInProgress(1, 0, false)).toBe(true);
  });

  it('returns true when score>0', () => {
    expect(isQuizInProgress(0, 1, false)).toBe(true);
  });

  it('returns true when asvabActive is true', () => {
    expect(isQuizInProgress(0, 0, true)).toBe(true);
  });
});
