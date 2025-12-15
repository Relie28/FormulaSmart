import type { Card } from '../data/cards';

type Result = { id: string; correct: boolean };

export function computeSessionSummary(results: Result[], allCards: Card[]) {
  // Map by card id to whether it was answered correctly at least once
  const map: Record<string, { correct: boolean }> = {};
  results.forEach((r) => {
    if (!map[r.id]) map[r.id] = { correct: false };
    if (r.correct) map[r.id].correct = true;
  });

  const total = allCards.length;
  const uniqueIds = Object.keys(map);
  const score = uniqueIds.filter((id) => map[id].correct).length;

  const countsByType: Record<string, { correct: number; total: number }> = {};
  // Count by type across all cards (use initial deck as ground truth)
  allCards.forEach((c) => {
    const t = c.type ?? 'definition';
    if (!countsByType[t]) countsByType[t] = { correct: 0, total: 0 };
    countsByType[t].total += 1;
    if (map[c.id] && map[c.id].correct) countsByType[t].correct += 1;
  });

  return { score, total, countsByType };
}

export default computeSessionSummary;
