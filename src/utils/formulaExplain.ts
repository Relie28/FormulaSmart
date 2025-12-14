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
      case 'right triangle':
        return 'The Pythagorean theorem applies to right triangles: a² + b² = c² (c is the hypotenuse). Use it to find a missing side or the diagonal of rectangles/squares by forming a right triangle.';
      case 'parallelogram':
        return 'The area of a parallelogram is base times height — similar to a rectangle once you drop a perpendicular height.';
      case 'trapezoid':
        return 'The area of a trapezoid is half the sum of the bases times the height: A = ½ × (b₁ + b₂) × h.';
      case 'rhombus':
        return 'A rhombus has equal sides; area can be found by A = ½ × d₁ × d₂ (half the product of the diagonals) or base × height.';
      default:
        return null;
    }
  }

  if (card.type === 'definition') {
    const p = card.prompt.toLowerCase();
    if (p.includes('average')) return 'Average (mean) is calculated by summing all the values and dividing by the number of values.';
    if (p.includes('percent')) return 'Percent relates a part to a whole; part = percent × whole, and whole = part ÷ percent.';
    if (p.includes('rate') || p.includes('speed')) return 'Rate (speed) is calculated as distance divided by time.';
    if (p.includes('perimeter')) return 'Perimeter is the total distance around a shape — add up the lengths of all sides.';
    if (p.includes('perimeter') && p.includes('rectangle')) return 'Perimeter of a rectangle is P = 2l + 2w (add twice the length and twice the width).';
    if (p.includes('perimeter') && p.includes('square')) return 'Perimeter of a square is P = 4s (add four equal sides, or multiply one side by 4).';
    if (p.includes('circumference')) return 'Circumference is the distance around a circle: C = 2πr (or C = πd).';
    if (p.includes('radius') || p.includes('diameter')) return 'Radius is the distance from the center to the edge of a circle; diameter is twice the radius (d = 2r).';
    if (p.includes('volume')) return 'Volume measures the space inside a 3D object. For rectangular solids multiply length × width × height (V = lwh).';
    if (p.includes('cube')) return 'Volume of a cube is V = s³ (side length cubed).';
    if (p.includes('cylinder')) return 'Volume of a cylinder is V = π r² h (area of circular base times height).';
    if (p.includes('pythagorean') || p.includes('pythagor')) return 'Pythagorean theorem relates the sides of a right triangle: a² + b² = c² (c is the hypotenuse).';
    if (p.includes('diagonal')) return 'Diagonal of rectangles and squares comes from the Pythagorean theorem: d = √(l² + w²) (square: d = s√2).';
    if (p.includes('work')) return 'Work problems: work = rate × time. For multiple workers, add their rates (combined rate = r1 + r2).';
    if (p.includes('exponent') || p.includes('square root') || p.includes('square')) return 'Exponents and roots: x² means x × x; √x is the number which when squared gives x.';
    if (p.includes('percent')) return 'Percent as a decimal: 25% = 0.25; percent = part ÷ whole.';
    // fallback: if the answer looks like a formula (contains = or × or / or π)
    if (/=|×|\*|\/|π|r\^?2|\^2/.test(card.answer)) {
      return 'This formula shows how to calculate the requested quantity — read the right side as the operations to perform on the variables.';
    }
  }

  return null;
}
