// Helpers for managing a flashcard deck in-session
export function applyAnswerToDeck<T>(prevDeck: T[], correct: boolean): { newDeck: T[]; finished: boolean } {
  if (!prevDeck || prevDeck.length === 0) return { newDeck: [], finished: true };
  const [current, ...rest] = prevDeck;
  if (!correct) {
    const insertAt = Math.floor(Math.random() * (rest.length + 1));
    const newDeck = [...rest.slice(0, insertAt), current, ...rest.slice(insertAt)];
    return { newDeck, finished: false };
  }
  const finished = rest.length === 0;
  return { newDeck: rest, finished };
}

export default applyAnswerToDeck;
