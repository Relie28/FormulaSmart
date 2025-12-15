import applyAnswerToDeck from '../src/utils/deckUtils';

describe('applyAnswerToDeck', () => {
  it('removes current card when correct and returns finished when no more cards', () => {
    const deck = [1];
    const { newDeck, finished } = applyAnswerToDeck(deck, true);
    expect(newDeck).toEqual([]);
    expect(finished).toBe(true);
  });

  it('removes current card when correct and not finished when more cards exist', () => {
    const deck = [1, 2, 3];
    const { newDeck, finished } = applyAnswerToDeck(deck, true);
    expect(newDeck).toEqual([2, 3]);
    expect(finished).toBe(false);
  });

  it('re-inserts incorrect card into deck at random position', () => {
    const deck = [1, 2, 3, 4];
    const { newDeck, finished } = applyAnswerToDeck(deck, false);
    expect(newDeck.length).toBe(3 + 1); // rest length + reinserted
    expect(newDeck).toContain(1);
    expect(finished).toBe(false);
  });
});
