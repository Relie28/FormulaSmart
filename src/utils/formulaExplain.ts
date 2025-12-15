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
      case 'pentagon':
        return 'For a regular pentagon, area can be found using the apothem and perimeter: A = ½ × perimeter × apothem, or split into triangles.';
      case 'hexagon':
        return 'A regular hexagon area can be calculated as A = (3√3/2) × s² (s is side length), or A = ½ × perimeter × apothem.';
      case 'ellipse':
        return 'An ellipse is like a stretched circle — its area is A = π × a × b where a and b are the semi-major and semi-minor axes.';
      case 'kite':
        return 'A kite is a quadrilateral with two pairs of adjacent equal sides; its area is half the product of its diagonals: A = ½ × d₁ × d₂.';
      default:
        return null;
    }
  }

  if (card.type === 'definition') {
    const p = card.prompt.toLowerCase();
    // helper: try to detect a shape mentioned in the card (prompt or answer)
    function detectShape() {
      const shapes = ['right triangle', 'square', 'rectangle', 'circle', 'triangle', 'parallelogram', 'trapezoid', 'rhombus', 'pentagon', 'hexagon', 'ellipse', 'oval', 'kite'];
      const hay = (card.prompt + ' ' + card.answer).toLowerCase();
      if ((card as any).shape) {
        const s = String((card as any).shape).toLowerCase();
        if (shapes.includes(s)) return s;
      }
      for (const s of shapes) if (hay.includes(s)) return s;
      return null;
    }
    const detectedShape = detectShape();
    if (p.includes('sum')) return 'A sum is the total you get when you add two or more numbers together.';
    if (p.includes('difference')) return 'The difference is the result when you subtract one number from another.';
    if (p.includes('product')) return 'A product is the result of multiplying two or more numbers together.';
    if (p.includes('quotient')) return 'A quotient is the result of dividing one number by another.';
    if (p.includes('average') || p.includes('mean')) return 'Average (mean) is the total of all values divided by the number of values.';
    if (p.includes('percent')) return 'Percent expresses a part out of 100 (25% = 25 out of 100 = 0.25 as a decimal); use part = percent × whole or whole = part ÷ percent.';
    if (p.includes('rate') || p.includes('speed')) return 'Rate (speed) describes how much per unit time — typically speed = distance ÷ time.';
    if (p.includes('perimeter')) return 'Perimeter is the distance around a shape — add the lengths of all the sides to get it.';
    if (p.includes('perimeter') && p.includes('rectangle')) return 'Perimeter of a rectangle is P = 2l + 2w (add twice the length and twice the width).';
    if (p.includes('perimeter') && p.includes('square')) return 'Perimeter of a square is P = 4s (add four equal sides or multiply one side by 4).';
    if (p.includes('circumference')) return 'Circumference is the distance around a circle: C = 2πr (or C = πd).';
    if (p.includes('radius') || p.includes('diameter')) return 'Radius is the distance from the center to the edge of a circle; diameter is twice the radius (d = 2r).';
    if (p.includes('volume')) return 'Volume measures the space inside a 3D object (for a rectangular solid, V = length × width × height).';
    if (p.includes('cube')) return 'A cube is a 3D object with equal side lengths; its volume is V = s³ (side length cubed).';
    if (p.includes('cylinder')) return 'A cylinder has circular bases; its volume is V = π r² h (area of the base times the height).';
    if (p.includes('pythagorean') || p.includes('pythagor')) return 'The Pythagorean theorem relates the sides of a right triangle: a² + b² = c² (c is the hypotenuse). Use it to find a missing side or diagonals.';
    if (p.includes('diagonal')) return 'A diagonal of a rectangle or square is found using the Pythagorean theorem: d = √(l² + w²) (for a square, d = s√2).';
    if (p.includes('work')) return 'Work problems combine rates: total work = (sum of individual rates) × time; use additive rates when multiple workers contribute.';
    if (p.includes('exponent') || p.includes('square root') || p.includes('square')) return 'Exponents show repeated multiplication (x² = x × x); square root is the inverse (√x is the number which when squared gives x).';
    // fallback: if the answer looks like a formula (contains = or × or / or π) then
    // try to convert the right-hand expression into a plain-English explanation
    if (/=|×|\*|\/|π|r\^?2|\^2/.test(card.answer)) {
      // helper to replace tokens by readable words
      const varMap: Record<string, string> = {
        a: 'side a',
        b: 'side b',
        c: 'side c (often the hypotenuse)',
        r: 'radius',
        d: 'diameter/diagonal',
        l: 'length',
        w: 'width',
        h: 'height',
        s: 'side length',
        v: 'speed/velocity',
        t: 'time',
        p: 'part',
        m: 'mean/average'
      };

      function tokenReplace(str: string) {
        // replace common symbols and operators with words
        let out = str
          .replace(/√\(([^)]+)\)/g, 'square root of $1')
          .replace(/sqrt\(([^)]+)\)/gi, 'square root of $1')
          .replace(/\b(\w)\^2\b/g, (_m, v) => `${varMap[v] ?? v} squared`)
          .replace(/\u00B2/g, ' squared') // unicode superscript 2
          .replace(/\*/g, ' times ') // '*' -> times
          .replace(/×/g, ' times ')
          .replace(/÷/g, ' divided by ')
          .replace(/\//g, ' divided by ')
          .replace(/\+/g, ' plus ')
          .replace(/\-/g, ' minus ')
          .replace(/π/g, 'pi')
          .replace(/\^/g, ' power ') // fallback for other exponents
          .replace(/\(/g, ' (')
          .replace(/\)/g, ') ')
          .replace(/\s+/g, ' ')
          .trim();

        // replace single-letter variable names using word boundaries
        Object.keys(varMap).forEach((k) => {
          const re = new RegExp('\\b' + k + '\\b', 'g');
          out = out.replace(re, varMap[k]);
        });

        return out.replace(/\s+/g, ' ').trim();
      }

      const eq = card.answer.split('=');
      if (eq.length >= 2) {
        const lhs = eq[0].trim();
        const rhs = eq.slice(1).join('=').trim();
        const rhsWords = tokenReplace(rhs);
        // friendly label for common left-hand symbols
        const lhsName = (lhs.match(/\bA\b/i) && 'area') || (lhs.match(/\bP\b/i) && 'perimeter') || (lhs.match(/\bC\b/i) && 'circumference') || (lhs.match(/\bV\b/i) && 'volume') || lhs;
        // if we detected a shape, mention it explicitly: 'The area of a rectangle is calculated as...'
        if (detectedShape) {
          return `The ${lhsName} of a ${detectedShape} is calculated as ${rhsWords}.`;
        }
        return `The ${lhsName} is calculated as ${rhsWords}.`;
      }

      // if there is no '=', try to describe the expression directly
      return `This formula computes ${tokenReplace(card.answer as string)}.`;
    }
  }

  return null;
}
