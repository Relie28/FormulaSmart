import type { Card } from '../data/cards';

const SHAPES = ['right triangle', 'square', 'rectangle', 'circle', 'triangle', 'parallelogram', 'trapezoid', 'rhombus', 'pentagon', 'hexagon', 'ellipse', 'oval', 'kite', 'cylinder', 'cube', 'rectangular solid', 'rectangular'];

export function detectShapeFromCard(card: Card): string | null {
  if (card.type === 'shape') return (card.shape || '').toLowerCase() || null;

  const prompt = (card.prompt || '').toLowerCase();
  const answer = (card.answer || '').toLowerCase();
  const hay = `${prompt} ${answer}`;

  // ignore generic overview-like prompts
  if (/\b(common|overview|when to use|summary)\b/.test(prompt)) return null;

  // only accept a shape mention in definition/word cards when context indicates it's shape-specific
  const contextKeywords = /\b(area|perimeter|volume|diagonal|circumference|radius|diameter|height|length|width|hypotenuse)\b/;
  const hasContext = contextKeywords.test(hay) || /\bwhat is\b|\bfind\b|\bcalculate\b/.test(prompt);

  if (!hasContext) return null;

  for (const s of SHAPES) {
    if (hay.includes(s)) return s;
  }

  return null;
}

export default detectShapeFromCard;
