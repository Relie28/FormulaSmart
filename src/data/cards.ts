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
  { id: 't1-sum-ex', type: 'word', subject: 'Tier 1', prompt: 'What is the sum of 4 and 6?', answer: 'Sum = 4 + 6 = 10', hint: 'Sum means add' },
  { id: 't1-diff-ex', type: 'word', subject: 'Tier 1', prompt: 'What is the difference between 12 and 7?', answer: 'Difference = 12 − 7 = 5', hint: 'Difference means subtract' },
  { id: 't1-percent-ex', type: 'word', subject: 'Tier 1', prompt: 'What is 20% of 50?', answer: 'Part = percent × whole = 0.2 × 50 = 10', hint: 'Percent → part = percent × whole' },

  // Tier 2
  { id: 't2-ratio', type: 'definition', subject: 'Tier 2', prompt: 'Ratio', answer: 'Ratio = a : b (can be written as a/b)' },
  { id: 't2-prop', type: 'definition', subject: 'Tier 2', prompt: 'Proportion', answer: 'a/b = c/d → cross multiply ad = bc' },
  { id: 't2-pemdas', type: 'definition', subject: 'Tier 2', prompt: 'Order of Operations', answer: 'PEMDAS — Parentheses, Exponents, Multiply/Divide, Add/Subtract' },
  { id: 't2-factors', type: 'definition', subject: 'Tier 2', prompt: 'Factors & Multiples', answer: 'Factor divides evenly; Multiple = result of multiplication' },
  { id: 't2-abs', type: 'definition', subject: 'Tier 2', prompt: 'Absolute Value', answer: '|x| = distance from 0 (always non-negative)' },
  { id: 't2-pemdas-ex', type: 'word', subject: 'Tier 2', prompt: 'Evaluate 3 + 4 × 2', answer: '3 + 4 × 2 = 3 + 8 = 11 (PEMDAS: multiply before add)', hint: 'Order of operations: PEMDAS' },
  { id: 't2-factors-ex', type: 'word', subject: 'Tier 2', prompt: 'What are the factors of 12?', answer: 'Factors of 12: 1, 2, 3, 4, 6, 12', hint: 'Factors divide evenly into the number' },

  // Tier 3
  { id: 't3-prodvar', type: 'definition', subject: 'Tier 3', prompt: 'Product of a number and variable', answer: 'ax = a × x' },
  { id: 't3-rec', type: 'definition', subject: 'Tier 3', prompt: 'Reciprocal', answer: 'Reciprocal of a/b = b/a' },
  { id: 't3-integers', type: 'definition', subject: 'Tier 3', prompt: 'Integers', answer: 'Integers include positive, negative, and zero' },
  { id: 't3-square', type: 'definition', subject: 'Tier 3', prompt: 'Square', answer: 'Square: a² is a × a (multiply a by itself)' },
  { id: 't3-squareroot', type: 'definition', subject: 'Tier 3', prompt: 'Square root', answer: 'Square root: √a is a number which when squared gives a' },
  { id: 't3-prodvar-ex', type: 'word', subject: 'Tier 3', prompt: 'If x = 4, what is 3x?', answer: '3x = 3 × 4 = 12', hint: 'Product of a number and variable: ax = a × x' },
  { id: 't3-recip-ex', type: 'word', subject: 'Tier 3', prompt: 'What is the reciprocal of 2/3?', answer: 'Reciprocal = 3/2', hint: 'Reciprocal of a/b = b/a' },
  { id: 't3-int-ex', type: 'word', subject: 'Tier 3', prompt: 'Is -2 an integer?', answer: 'Yes – integers include positive, negative, and zero', hint: 'Integers are whole numbers (no fraction or decimal)' },

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
  { id: 'asvab-sum', type: 'definition', subject: 'ASVAB', prompt: 'Sum means', answer: 'Add' },
  { id: 'asvab-diff', type: 'definition', subject: 'ASVAB', prompt: 'Difference means', answer: 'Subtract' },
  { id: 'asvab-prod', type: 'definition', subject: 'ASVAB', prompt: 'Product means', answer: 'Multiply' },
  { id: 'asvab-quot', type: 'definition', subject: 'ASVAB', prompt: 'Quotient means', answer: 'Divide' }
];

export function cardsForSubjects(subjectSelection: string[] | 'All') {
  if (subjectSelection === 'All') return cards;
  return cards.filter((c) => subjectSelection.includes(c.subject));
}
