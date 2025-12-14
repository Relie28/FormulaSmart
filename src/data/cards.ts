export type Card =
  | { id: string; type: 'definition'; subject: string; prompt: string; answer: string }
  | {
      id: string;
      type: 'shape';
      subject: string;
      shape: string;
      prompt: string;
      answer: string; // formula
    }
  | {
      id: string;
      type: 'word';
      subject: string;
      prompt: string; // question text
      answer: string; // textual answer or explanation
      hint?: string;
    };

// Subjects: Arithmetic, Pre-Algebra, Algebra, Geometry, Word Problems, Memorize, ASVAB, Motion, Work
export const subjects = [
  'Arithmetic',
  'Pre-Algebra',
  'Algebra',
  'Geometry',
  'Word Problems',
  'Memorize',
  'ASVAB',
  'Motion',
  'Work'
];

export const cards: Card[] = [
  // Arithmetic (formerly Tier 1)
  { id: 't1-sum', type: 'definition', subject: 'Arithmetic', prompt: 'What is the sum?', answer: 'Sum = a + b (Addition)' },
  { id: 't1-diff', type: 'definition', subject: 'Arithmetic', prompt: 'What is the difference?', answer: 'Difference = a − b (Subtraction)' },
  { id: 't1-prod', type: 'definition', subject: 'Arithmetic', prompt: 'What is the product?', answer: 'Product = a × b (Multiplication)' },
  { id: 't1-quot', type: 'definition', subject: 'Arithmetic', prompt: 'What is the quotient?', answer: 'Quotient = a ÷ b (Division)' },
  { id: 't1-avg', type: 'definition', subject: 'Arithmetic', prompt: 'How is average (mean) calculated?', answer: 'Average = sum ÷ number of items' },
  { id: 't1-percent', type: 'definition', subject: 'Arithmetic', prompt: 'What is percent?', answer: 'Percent = part ÷ whole — Part = percent × whole — Whole = part ÷ percent' },
  { id: 't1-rate', type: 'definition', subject: 'Arithmetic', prompt: 'What is rate (speed)?', answer: 'Rate = distance ÷ time' },
  { id: 't1-sum-ex', type: 'word', subject: 'Arithmetic', prompt: 'What is the sum of 4 and 6?', answer: 'Sum = 4 + 6 = 10', hint: 'Sum means addition' },
  { id: 't1-diff-ex', type: 'word', subject: 'Arithmetic', prompt: 'What is the difference between 12 and 7?', answer: 'Difference = 12 − 7 = 5', hint: 'Difference means subtraction' },
  { id: 't1-percent-ex', type: 'word', subject: 'Arithmetic', prompt: 'What is 20% of 50?', answer: 'Part = percent × whole = 0.2 × 50 = 10', hint: 'Percent → part = percent × whole' },

  // Pre-Algebra (formerly Tier 2)
  { id: 't2-ratio', type: 'definition', subject: 'Pre-Algebra', prompt: 'What is a ratio?', answer: 'Ratio = a : b (can be written as a/b)' },
  { id: 't2-prop', type: 'definition', subject: 'Pre-Algebra', prompt: 'What is a proportion?', answer: 'a/b = c/d → cross multiply ad = bc' },
  { id: 't2-pemdas', type: 'definition', subject: 'Pre-Algebra', prompt: 'What is the order of operations?', answer: 'PEMDAS — Parentheses, Exponents, Multiplication/Division, Addition/Subtraction' },
  { id: 't2-factors', type: 'definition', subject: 'Pre-Algebra', prompt: 'What are factors and multiples?', answer: 'Factor divides evenly; Multiple = result of multiplication' },
  { id: 't2-abs', type: 'definition', subject: 'Pre-Algebra', prompt: 'What is absolute value?', answer: '|x| = distance from 0 (always non-negative)' },
  { id: 't2-pemdas-ex', type: 'word', subject: 'Pre-Algebra', prompt: 'Evaluate 3 + 4 × 2', answer: '3 + 4 × 2 = 3 + 8 = 11 (PEMDAS: multiply before add)', hint: 'Order of operations: PEMDAS' },
  { id: 't2-factors-ex', type: 'word', subject: 'Pre-Algebra', prompt: 'What are the factors of 12?', answer: 'Factors of 12: 1, 2, 3, 4, 6, 12', hint: 'Factors divide evenly into the number' },

  // Algebra (formerly Tier 3)
  { id: 't3-prodvar', type: 'definition', subject: 'Algebra', prompt: 'What is the product of a number and a variable?', answer: 'ax = a × x' },
  { id: 't3-rec', type: 'definition', subject: 'Algebra', prompt: 'What is a reciprocal?', answer: 'Reciprocal of a/b = b/a' },
  { id: 't3-integers', type: 'definition', subject: 'Algebra', prompt: 'What are integers?', answer: 'Integers include positive, negative, and zero' },
  { id: 't3-square', type: 'definition', subject: 'Algebra', prompt: 'What does x² mean?', answer: 'Square: a² is a × a (multiply a by itself)' },
  { id: 't3-squareroot', type: 'definition', subject: 'Algebra', prompt: 'What is a square root?', answer: 'Square root: √a is a number which when squared gives a' },
  { id: 't3-prodvar-ex', type: 'word', subject: 'Algebra', prompt: 'If x = 4, what is 3x?', answer: '3x = 3 × 4 = 12', hint: 'Product of a number and variable: ax = a × x' },
  { id: 't3-recip-ex', type: 'word', subject: 'Algebra', prompt: 'What is the reciprocal of 2/3?', answer: 'Reciprocal = 3/2', hint: 'Reciprocal of a/b = b/a' },
  { id: 't3-int-ex', type: 'word', subject: 'Algebra', prompt: 'Is -2 an integer?', answer: 'Yes – integers include positive, negative, and zero', hint: 'Integers are whole numbers (no fraction or decimal)' },

  // Geometry (2D shapes, right triangles, diagonals)
  { id: 'shape-circle', type: 'shape', subject: 'Geometry', shape: 'Circle', prompt: 'Area of a circle', answer: 'A = π r²' },
  { id: 'shape-rect', type: 'shape', subject: 'Geometry', shape: 'Rectangle', prompt: 'Area of a rectangle', answer: 'A = w × h' },
  { id: 'shape-square', type: 'shape', subject: 'Geometry', shape: 'Square', prompt: 'Area of a square', answer: 'A = s²' },
  { id: 'shapes-overview', type: 'definition', subject: 'Geometry', prompt: 'Common ASVAB shapes and when to use them', answer: 'Common shapes: square, rectangle, circle, triangle (including right triangles). Use area/perimeter formulas for 2D shapes; use Pythagorean theorem for right-triangle-based problems (e.g., diagonals or missing side lengths).' },
  { id: 'shape-tri', type: 'shape', subject: 'Geometry', shape: 'Triangle', prompt: 'Area of a triangle', answer: 'A = ½ × base × height' },
  { id: 'shape-right-tri', type: 'shape', subject: 'Geometry', shape: 'Right Triangle', prompt: 'Right triangle (Pythagorean theorem applies)', answer: 'a² + b² = c²' },
  { id: 'geom-diag-rect', type: 'definition', subject: 'Geometry', prompt: 'Diagonal of a rectangle', answer: 'd = √(l² + w²) (from a² + b² = c²)' },
  { id: 'geom-diag-square', type: 'definition', subject: 'Geometry', prompt: 'Diagonal of a square', answer: 'd = s√2 (since diagonal² = s² + s² = 2s²)' },
  { id: 'shape-parallelogram', type: 'shape', subject: 'Geometry', shape: 'Parallelogram', prompt: 'Area of a parallelogram', answer: 'A = base × height' },
  { id: 'shape-trapezoid', type: 'shape', subject: 'Geometry', shape: 'Trapezoid', prompt: 'Area of a trapezoid', answer: 'A = ½ × (b₁ + b₂) × height' },
  { id: 'shape-rhombus', type: 'shape', subject: 'Geometry', shape: 'Rhombus', prompt: 'Area of a rhombus', answer: 'A = ½ × d₁ × d₂ (or base × height)' },

  // Geometry: Perimeter & more areas
  { id: 'geom-perim-rect', type: 'definition', subject: 'Geometry', prompt: 'What is the perimeter of a rectangle?', answer: 'P = 2l + 2w' },
  { id: 'geom-perim-square', type: 'definition', subject: 'Geometry', prompt: 'What is the perimeter of a square?', answer: 'P = 4s' },
  { id: 'geom-area-rect', type: 'definition', subject: 'Geometry', prompt: 'What is the area of a rectangle?', answer: 'A = l × w' },
  { id: 'geom-area-square', type: 'definition', subject: 'Geometry', prompt: 'What is the area of a square?', answer: 'A = s²' },
  { id: 'geom-area-circle', type: 'definition', subject: 'Geometry', prompt: 'What is the area of a circle?', answer: 'A = π r²' },
  { id: 'geom-circ', type: 'definition', subject: 'Geometry', prompt: 'What is the circumference of a circle?', answer: 'C = 2πr (or C = πd)' },
  { id: 'geom-rd', type: 'definition', subject: 'Geometry', prompt: 'What are radius and diameter?', answer: 'd = 2r' },

  // Volume
  { id: 'vol-rect', type: 'definition', subject: 'Geometry', prompt: 'What is the volume of a rectangular solid?', answer: 'V = l × w × h' },
  { id: 'vol-cube', type: 'definition', subject: 'Geometry', prompt: 'What is the volume of a cube?', answer: 'V = s³' },
  { id: 'vol-cyl', type: 'definition', subject: 'Geometry', prompt: 'What is the volume of a cylinder?', answer: 'V = π r² h' },

  // Pythagorean
  { id: 'pyth', type: 'definition', subject: 'Geometry', prompt: 'What is the Pythagorean theorem?', answer: 'a² + b² = c² (c is the hypotenuse)' },

  // Motion / Rate
  { id: 'motion-rate', type: 'definition', subject: 'Motion', prompt: 'What is speed (velocity)?', answer: 'v = d ÷ t (also d = v × t ; t = d ÷ v)' },

  // Work
  { id: 'work-def', type: 'definition', subject: 'Work', prompt: 'How is combined work calculated?', answer: 'Work = rate × time (use additive rates for multiple workers)' },

  // Exponents & Roots
  { id: 'exp-def', type: 'definition', subject: 'Algebra', prompt: 'What are exponents?', answer: 'x² = x × x' },
  { id: 'root-def', type: 'definition', subject: 'Algebra', prompt: 'What is a square root?', answer: '√x = number that multiplies by itself to get x' },

  // Key memorization list (quick reference as cards)
  { id: 'memorize-1', type: 'definition', subject: 'Memorize', prompt: 'Must-memorize (1)', answer: 'P = 2l + 2w; A = l × w; A = ½bh; A = πr²; C = 2πr' },
  { id: 'memorize-2', type: 'definition', subject: 'Memorize', prompt: 'Must-memorize (2)', answer: 'V = lwh; a² + b² = c²; v = d ÷ t; Percent = part ÷ whole; Average = sum ÷ count' },


  // Word Problems (examples with hints)
  {
    id: 'word-1',
    type: 'word',
    subject: 'Word Problems',
    prompt: 'A rectangle is 8 units wide and 5 units tall. What is its area?',
    answer: 'Area = width × height = 8 × 5 = 40',
    hint: 'Multiply width by height (area of rectangle)'
  },
  {
    id: 'word-2',
    type: 'word',
    subject: 'Word Problems',
    prompt: 'A car travels 150 miles in 3 hours. What is its average speed?',
    answer: 'Rate = distance ÷ time = 150 ÷ 3 = 50 (miles/hour)',
    hint: 'Use rate = distance/time'
  },
  {
    id: 'word-3',
    type: 'word',
    subject: 'Word Problems',
    prompt: 'If 30% of a number is 15, what is the whole?',
    answer: 'Whole = part ÷ percent = 15 ÷ 0.3 = 50',
    hint: 'Use whole = part ÷ percent'
  },
  {
    id: 'word-pyth-1',
    type: 'word',
    subject: 'Word Problems',
    prompt: 'A right triangle has legs of length 3 and 4. What is the hypotenuse?',
    answer: 'a² + b² = c² → 3² + 4² = c² → 9 + 16 = c² → 25 = c² → c = 5',
    hint: 'Pythagorean theorem: a² + b² = c² (c is hypotenuse)'
  },
  {
    id: 'word-diag-rect',
    type: 'word',
    subject: 'Word Problems',
    prompt: 'What is the diagonal of a 6 by 8 rectangle?',
    answer: 'd = √(6² + 8²) = √(36 + 64) = √100 = 10',
    hint: 'Use Pythagorean theorem for rectangle diagonal (treat as right triangle)'
  },
  {
    id: 'word-4',
    type: 'word',
    subject: 'Word Problems',
    prompt: 'A recipe calls for 2 parts sugar to 3 parts flour. If sugar is 4 cups, how much flour?',
    answer: 'Ratio a:b = 2:3; if a=4, then b = (3/2) × 4 = 6 cups',
    hint: 'Ratio a:b can be written as a/b = c/d and scaled' 
  },
  {
    id: 'word-5',
    type: 'word',
    subject: 'Word Problems',
    prompt: 'If a car goes 90 miles in 1.5 hours, what is its average speed?',
    answer: 'Rate = distance ÷ time = 90 ÷ 1.5 = 60 (mph)',
    hint: 'Rate = distance ÷ time'
  },

  // ASVAB traps examples
  { id: 'asvab-sum', type: 'definition', subject: 'ASVAB', prompt: 'What does sum mean?', answer: 'Addition' },
  { id: 'asvab-diff', type: 'definition', subject: 'ASVAB', prompt: 'What does difference mean?', answer: 'Subtraction' },
  { id: 'asvab-prod', type: 'definition', subject: 'ASVAB', prompt: 'What does product mean?', answer: 'Multiplication' },
  { id: 'asvab-quot', type: 'definition', subject: 'ASVAB', prompt: 'What does quotient mean?', answer: 'Division' }
];

export function cardsForSubjects(subjectSelection: string[] | 'All') {
  if (subjectSelection === 'All') return cards;
  return cards.filter((c) => subjectSelection.includes(c.subject));
}
