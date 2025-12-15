import fs from 'fs';
import path from 'path';

describe('Flashcards guard for empty deck', () => {
  it('contains an early return when card is undefined and shows a finished message', () => {
    const filePath = path.join(__dirname, '..', 'src', 'screens', 'Flashcards.tsx');
    const src = fs.readFileSync(filePath, 'utf8');
    expect(src).toContain('if (!card)');
    expect(src).toContain("No more cards — session finished");
  });

  it('declares the auto-advance effect before the early return to avoid hooks mismatch', () => {
    const filePath = path.join(__dirname, '..', 'src', 'screens', 'Flashcards.tsx');
    const src = fs.readFileSync(filePath, 'utf8');
    const effectIndex = src.indexOf('React.useEffect');
    const guardIndex = src.indexOf('if (!card)');
    expect(effectIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeGreaterThan(-1);
    expect(effectIndex).toBeLessThan(guardIndex);
    // allow other unrelated effects (we schedule session finish from an effect), but
    // ensure at least one auto-advance effect exists and it appears before the guard.
    const occurrences = (src.match(/React\.useEffect/g) || []).length;
    expect(occurrences).toBeGreaterThanOrEqual(1);
    // ensure the scheduled-finish effect (uses shouldFinish) is declared before the guard
    const finishEffectIndices = [] as number[];
    let idx = src.indexOf('if (!shouldFinish)');
    while (idx !== -1) {
      finishEffectIndices.push(idx);
      idx = src.indexOf('if (!shouldFinish)', idx + 1);
    }
    expect(finishEffectIndices.length).toBe(1);
    expect(finishEffectIndices[0]).toBeLessThan(guardIndex);
    // ensure uniqueCorrectCount memoization is declared before the guard (prevents hooks mismatch)
    const uniqueIdx = src.indexOf('uniqueCorrectCount');
    expect(uniqueIdx).toBeGreaterThan(-1);
    expect(uniqueIdx).toBeLessThan(guardIndex);

    // We intentionally do not intercept native back behavior anymore, so
    // header back menu disabling and back handlers should not be present.
    const headerOptIdx = src.indexOf('headerBackButtonMenuEnabled');
    expect(headerOptIdx).toBe(-1);
    // ensure the inProgress check still exists (used elsewhere)
    const inProgressIdx = src.indexOf('deck.length > 0 || results.length > 0 || revealed || shouldFinish');
    expect(inProgressIdx).toBeGreaterThan(-1);
    expect(inProgressIdx).toBeLessThan(guardIndex);
    // ensure we are not using usePreventRemove or BackHandler anymore
    expect(src).not.toContain('usePreventRemove');
    expect(src).not.toContain('BackHandler');
    expect(src).not.toContain('gestureEnabled');
    // ensure cancellation ref exists (used in scheduled-finish flow)
    expect(src).toContain('finishCancelledRef');
    // ensure isMountedRef is present and used in finishSession to avoid alerts after unmount
    expect(src).toContain('isMountedRef');
    expect(src).toMatch(/if\s*\(!isMountedRef\.current\)\s*return/);
  });
});
