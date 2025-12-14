export const wordTrapMap: Record<string, string> = {
  sum: 'Add',
  difference: 'Subtract',
  product: 'Multiply',
  quotient: 'Divide',
  'increased by': 'Add',
  'decreased by': 'Subtract',
  of: 'Multiply',
  per: 'Divide'
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
