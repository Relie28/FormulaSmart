import type { Card } from '../data/cards';

export function explainFormula(card: Card): string | null {
  if (card.type === 'shape') {
    const s = card.shape.toLowerCase();
    switch (s) {
      case 'circle':
        return 'The area of a circle is pi times the square of the radius — it measures the space inside the circle.';
      case 'rectangle':
        return 'The area of a rectangle is width multiplied by height — multiply the two side lengths to get the area.';
      case 'square':
        return 'The area of a square is the side length squared — multiply the side by itself.';
      case 'triangle':
        return 'The area of a triangle is one half times the base times the height — multiply base and height and divide by two.';
      default:
        return null;
    }
  }

  if (card.type === 'definition') {
    const p = card.prompt.toLowerCase();
    if (p.includes('average')) return 'Average (mean) is calculated by summing all the values and dividing by the number of values.';
    if (p.includes('percent')) return 'Percent relates a part to a whole; part = percent × whole, and whole = part ÷ percent.';
    if (p.includes('rate') || p.includes('speed')) return 'Rate (speed) is calculated as distance divided by time.';
    // fallback: if the answer looks like a formula (contains = or × or / or π)
    if (/=|×|\*|\/|π|r\^?2|\^2/.test(card.answer)) {
      return 'This formula shows how to calculate the requested quantity — read the right side as the operations to perform on the variables.';
    }
  }

  return null;
}
