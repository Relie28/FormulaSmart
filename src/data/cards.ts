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

// Subjects: Tier 1, Tier 2, Tier 3, Shapes, Word Problems, ASVAB
export const subjects = [
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'Shapes',
  'Word Problems',
  'ASVAB'
];

export const cards: Card[] = [
  // Tier 1
  { id: 't1-sum', type: 'definition', subject: 'Tier 1', prompt: 'Sum', answer: 'Sum = a + b (add)' },
  { id: 't1-diff', type: 'definition', subject: 'Tier 1', prompt: 'Difference', answer: 'Difference = a − b (subtract)' },
  { id: 't1-prod', type: 'definition', subject: 'Tier 1', prompt: 'Product', answer: 'Product = a × b (multiply)' },
  { id: 't1-quot', type: 'definition', subject: 'Tier 1', prompt: 'Quotient', answer: 'Quotient = a ÷ b (divide)' },
  { id: 't1-avg', type: 'definition', subject: 'Tier 1', prompt: 'Average (Mean)', answer: 'Average = sum ÷ number of items' },
  { id: 't1-percent', type: 'definition', subject: 'Tier 1', prompt: 'Percent', answer: 'Percent = part ÷ whole — Part = percent × whole — Whole = part ÷ percent' },
  { id: 't1-rate', type: 'definition', subject: 'Tier 1', prompt: 'Rate/Speed', answer: 'Rate = distance ÷ time' },

  // Tier 2
  { id: 't2-ratio', type: 'definition', subject: 'Tier 2', prompt: 'Ratio', answer: 'Ratio = a : b (can be written as a/b)' },
  { id: 't2-prop', type: 'definition', subject: 'Tier 2', prompt: 'Proportion', answer: 'a/b = c/d → cross multiply ad = bc' },
  { id: 't2-pemdas', type: 'definition', subject: 'Tier 2', prompt: 'Order of Operations', answer: 'PEMDAS — Parentheses, Exponents, Multiply/Divide, Add/Subtract' },
  { id: 't2-factors', type: 'definition', subject: 'Tier 2', prompt: 'Factors & Multiples', answer: 'Factor divides evenly; Multiple = result of multiplication' },
  { id: 't2-abs', type: 'definition', subject: 'Tier 2', prompt: 'Absolute Value', answer: '|x| = distance from 0 (always non-negative)' },

  // Tier 3
  { id: 't3-prodvar', type: 'definition', subject: 'Tier 3', prompt: 'Product of a number and variable', answer: 'ax = a × x' },
  { id: 't3-rec', type: 'definition', subject: 'Tier 3', prompt: 'Reciprocal', answer: 'Reciprocal of a/b = b/a' },
  { id: 't3-integers', type: 'definition', subject: 'Tier 3', prompt: 'Integers', answer: 'Integers include positive, negative, and zero' },

  // Shapes
  { id: 'shape-circle', type: 'shape', subject: 'Shapes', shape: 'Circle', prompt: 'Area of a circle', answer: 'A = π r²' },
  { id: 'shape-rect', type: 'shape', subject: 'Shapes', shape: 'Rectangle', prompt: 'Area of a rectangle', answer: 'A = w × h' },
  { id: 'shape-square', type: 'shape', subject: 'Shapes', shape: 'Square', prompt: 'Area of a square', answer: 'A = s²' },
  { id: 'shape-tri', type: 'shape', subject: 'Shapes', shape: 'Triangle', prompt: 'Area of a triangle', answer: 'A = ½ × base × height' },

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

  // ASVAB traps examples
  { id: 'asvab-sum', type: 'definition', subject: 'ASVAB', prompt: 'Sum means', answer: 'Add' },
  { id: 'asvab-diff', type: 'definition', subject: 'ASVAB', prompt: 'Difference means', answer: 'Subtract' },
  { id: 'asvab-prod', type: 'definition', subject: 'ASVAB', prompt: 'Product means', answer: 'Multiply' },
  { id: 'asvab-quot', type: 'definition', subject: 'ASVAB', prompt: 'Quotient means', answer: 'Divide' }
];

export function cardsForSubjects(subjectSelection: string[] | 'All') {
  if (subjectSelection === 'All') return cards;
  return cards.filter((c) => subjectSelection.includes(c.subject));
}
