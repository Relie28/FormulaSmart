import { shouldPromptLeave } from '../src/utils/navigationUtils';

describe('shouldPromptLeave', () => {
  it('returns false when not focused even if quiz in progress (submitted)', () => {
    expect(shouldPromptLeave(1, 0, false, false, true)).toBe(false);
  });

  it('returns false when not in progress (not submitted)', () => {
    expect(shouldPromptLeave(0, 0, false, true, false)).toBe(false);
  });

  it('returns true when focused and in progress (submitted or ASVAB active)', () => {
    expect(shouldPromptLeave(0, 0, false, true, true)).toBe(true);
    expect(shouldPromptLeave(0, 0, true, true, false)).toBe(true);
  });
});
