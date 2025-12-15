export const wordTrapMap: Record<string, string> = {
  sum: 'Addition',
  difference: 'Subtraction',
  product: 'Multiplication',
  quotient: 'Division',
  'increased by': 'Addition',
  'decreased by': 'Subtraction',
  of: 'Multiplication',
  per: 'Division',
  perimeter: 'Look for lengths to add (sum of side lengths)',
  circumference: 'Look for radius/diameter to use circle formulas (C = 2πr)',
  radius: 'Radius relates to diameter: d = 2r',
  diameter: 'Diameter relates to radius: d = 2r',
  volume: 'Look for 3-dimensional measurement (use V = lbh or V = πr²h)',
  speed: 'Speed = distance ÷ time',
  velocity: 'Speed / velocity = distance ÷ time',
  rate: 'Rate = distance ÷ time',
  work: 'Work = rate × time (combine rates when multiple workers)'
};

export function hintForWordProblem(prompt: string) {
  if (!prompt) return 'Look for keywords indicating operations (sum, difference, product, quotient, increased by, decreased by, of, per).';
  const lower = prompt.toLowerCase();
  const matches: Array<[string, string]> = [];
  Object.entries(wordTrapMap).forEach(([k, v]) => {
    if (lower.includes(k)) matches.push([k, v]);
  });

  if (matches.length === 0) {
    return 'No specific operation keywords found — identify quantities and ask what is being asked (part, whole, rate, distance, time).';
  }

  const lines = matches.map(([k, v]) => `"${k}" → ${v}`);
  return `Look for these keywords:
${lines.join('\n')}`;
}
