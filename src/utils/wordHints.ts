export const wordTrapMap: Record<string, string> = {
  sum: 'Addition — look for quantities to add together',
  difference: 'Subtraction — look for "how much more/less" or removed amounts',
  product: 'Multiplication — look for repeated groups or scaling',
  quotient: 'Division — look for splitting or averaging',
  'increased by': 'Addition — an amount is being added',
  'decreased by': 'Subtraction — an amount is being taken away',
  wide: 'Width/height — look for width and height labels to combine for area',
  tall: 'Width/height — look for width and height labels to combine for area',
  height: 'Width/height — look for width and height labels to combine for area',
  width: 'Width/height — look for width and height labels to combine for area',
  // Note: do not include a generic 'of' mapping because it can be misleading
  // (e.g., "factors of 12" is not a multiplication clue). Percent/"of" is
  // handled via pattern detection below when appropriate.
  per: 'Division — "per" often means divide (e.g., miles per hour)',
  perimeter: 'Perimeter — look for side lengths to add together',
  circumference: 'Circumference/Radius — look for radius/diameter clues for circles',
  radius: 'Radius/diameter — radius relates to diameter (d = 2r)',
  diameter: 'Radius/diameter — diameter relates to radius (d = 2r)',
  volume: 'Volume — think 3D measurement (combine area of base with height)',
  speed: 'Rate — compare distance and time (distance ÷ time)',
  velocity: 'Rate — compare distance and time (distance ÷ time)',
  rate: 'Rate — compare distance and time, or part/whole rates',
  work: 'Work/rate problems — combine rates over time'
  ,
  legs: 'Right triangle — legs indicate a right triangle; relate sides',
  diagonal: 'Diagonal — treat rectangle diagonal as a right triangle (Pythagorean)',
  by: 'Dimensions given as "a by b" — consider forming a right triangle for diagonals',
  ratio: 'Ratio/parts — scale quantities proportionally',
  parts: 'Ratio/parts — scale quantities proportionally'
};

// Additional specific mappings
wordTrapMap['factor'] = 'Factors — list integers whose product gives the number (look for pairs that multiply to the target)';
wordTrapMap['factors'] = wordTrapMap['factor'];
wordTrapMap['percent'] = 'Percent — convert the percentage to a decimal and multiply by the whole';
wordTrapMap['pemdas'] = 'Apply the order of operations (PEMDAS)';

export function hintForWordProblem(prompt: string) {
  if (!prompt) return 'Look for keywords indicating operations (sum, difference, product, quotient, increased by, decreased by, of, per).';
  const lower = prompt.toLowerCase();
  // helper to match whole words/patterns to avoid accidental substring matches
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Find all matching keywords from the map, prefer longer matches first and
  // require whole-word matches to avoid false positives (e.g., 'factor' in 'factorial')
  let matches = Object.keys(wordTrapMap)
    .filter((k) => {
      try {
        const re = new RegExp(`\\b${escapeRegExp(k)}\\b`, 'i');
        return re.test(lower);
      } catch (e) {
        return lower.includes(k);
      }
    })
    .sort((a, b) => b.length - a.length);

  // Heuristics: detect distance/time patterns to suggest 'rate'
  if (!matches.includes('rate')) {
    if ((/mile|miles/.test(lower) && /hour|hours/.test(lower)) || /per hour|mph/.test(lower)) {
      matches = ['rate', ...matches.filter((m) => m !== 'rate')];
    }
  }

  // Detect percentage/"of" patterns explicitly (e.g., "30% of a number")
  if ((/\d+%/.test(lower) || /percent/.test(lower)) && !matches.includes('rate')) {
    matches = ['percent', ...matches];
  }

  // Detect arithmetic expressions with parentheses or multiple operators -> suggest PEMDAS
  const opMatches = (lower.match(/[+\-×*\/]/g) || []).length;
  if ((/\(|\)/.test(lower) || opMatches >= 2) && !matches.includes('pemdas')) {
    matches = ['pemdas', ...matches.filter((m) => m !== 'pemdas')];
  }

  if (matches.length === 0) {
    return 'No specific operation keywords found — identify which quantities are given and what is being asked (part, whole, rate, distance, time). Try asking: "What are the quantities? Which ones do I combine?"';
  }

  // Build a concise hint emphasizing how to think and the key word(s)
  const primary = matches[0];
  const hint = wordTrapMap[primary];
  const keyList = matches.slice(0, 3).map((k) => `"${k}"`).join(', ');
  return `Hint(s): ${keyList} — ${hint}.`;
}
