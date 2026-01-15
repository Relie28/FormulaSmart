type Distractor = { text: string; type: 'arithmetic' | 'conceptual' | 'partial' | 'rounding' };

function parseNumeric(answer: string): { value: number | null; unit: string } {
  if (!answer) return { value: null, unit: '' };
  // strip common symbols but keep unit text
  const s = String(answer).trim();
  // capture number (integer or decimal) and unit
  const m = s.match(/([-+]?[0-9]*\.?[0-9]+(?:,[0-9]{3})?)/);
  if (!m) return { value: null, unit: s.replace(m ? m[0] : '', '').trim() };
  const numStr = m[0].replace(/,/g, '');
  const v = Number(numStr);
  const unit = s.replace(m[0], '').trim();
  return { value: Number.isFinite(v) ? v : null, unit };
}

function fmt(value: number | null, unit: string, original: string) {
  if (value === null) return original;
  // if original had currency symbol at start, keep it
  const hasDollar = /^\$/.test(original.trim());
  const hasPercent = /%/.test(original);
  if (hasPercent) {
    return `${value}${unit}`; // keep percent sign in unit
  }
  if (hasDollar) return `$${Number(value.toFixed(2))}`.replace(/\.00$/, '');
  // if unit contains letters (e.g., 'mph'), append
  if (unit) return `${Number((Math.round(value * 100) / 100).toString())} ${unit}`.trim();
  // plain number
  return `${Number(value % 1 === 0 ? value.toFixed(0) : Number(value.toFixed(2)))}`;
}

function arithmeticError(answer: string): Distractor {
  const { value, unit } = parseNumeric(answer);
  if (value === null) return { text: answer + ' (calc error)', type: 'arithmetic' };
  // choose an offset based on magnitude
  const magnitude = Math.max(1, Math.pow(10, Math.floor(Math.log10(Math.abs(value) || 1))));
  const offsets = [1, 2, 5, 10].map((o) => o * Math.max(1, magnitude / 10));
  const off = offsets[Math.floor(Math.random() * offsets.length)];
  const sign = Math.random() < 0.5 ? -1 : 1;
  const v = value + sign * off;
  return { text: fmt(v, unit, answer), type: 'arithmetic' };
}

function conceptualError(answer: string): Distractor {
  const { value, unit } = parseNumeric(answer);
  if (value === null) {
    // for non-numeric answers, return slight rewording
    return { text: answer + ' (misapplied concept)', type: 'conceptual' };
  }
  // swap multiply/divide: multiply instead of divide or vice versa
  const factor = Math.random() < 0.5 ? 10 : 0.1;
  const v = Math.max(0, value * factor);
  return { text: fmt(v, unit, answer), type: 'conceptual' };
}

function partialSolution(answer: string): Distractor {
  const { value, unit } = parseNumeric(answer);
  if (value === null) return { text: answer + ' (partial)', type: 'partial' };
  // commonly a partial solution is an intermediate, e.g., missing a final step
  const v = value * (Math.random() < 0.5 ? 0.5 : 0.9);
  return { text: fmt(v, unit, answer), type: 'partial' };
}

function roundingError(answer: string): Distractor {
  const { value, unit } = parseNumeric(answer);
  if (value === null) return { text: answer + ' (rounded)', type: 'rounding' };
  // round to nearest integer or one decimal
  const v = Math.random() < 0.5 ? Math.round(value) : Math.round(value * 10) / 10;
  return { text: fmt(v, unit, answer), type: 'rounding' };
}

export function generateChoices(correctAnswer: string, tier: number) {
  const distractors: Distractor[] = [];
  distractors.push(arithmeticError(correctAnswer));
  distractors.push(conceptualError(correctAnswer));
  if (tier >= 3) distractors.push(partialSolution(correctAnswer));
  else distractors.push(roundingError(correctAnswer));

  // dedupe and ensure none equal correctAnswer
  const uniq: Distractor[] = [];
  const seen = new Set<string>([correctAnswer]);
  for (const d of distractors) {
    if (!seen.has(d.text)) {
      uniq.push(d);
      seen.add(d.text);
    }
  }

  // if we lost candidates due to duplicates, add arithmetic variants until we have 3
  while (uniq.length < 3) {
    const extra = arithmeticError(correctAnswer);
    if (!seen.has(extra.text)) { uniq.push(extra); seen.add(extra.text); }
  }

  // Ensure required distractor type is present depending on tier
  const requiredType = tier >= 3 ? 'partial' : 'rounding';
  const hasRequired = uniq.some((d) => d.type === requiredType);
  if (!hasRequired) {
    // replace the last distractor with the required type
    const replacement = (requiredType === 'partial') ? partialSolution(correctAnswer) : roundingError(correctAnswer);
    if (!seen.has(replacement.text)) {
      // remove last
      const removed = uniq.pop();
      if (removed) seen.delete(removed.text);
      uniq.push(replacement);
      seen.add(replacement.text);
    }
  }

  // build choices array and shuffle
  const pool = [{ text: correctAnswer, type: 'correct' as const }, ...uniq.map((d) => ({ text: d.text, type: d.type }))];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const choices = pool.map((p) => p.text);
  const correctIndex = pool.findIndex((p) => p.type === 'correct');
  const distractor_logic: Record<string, string> = {};
  for (let i = 0; i < pool.length; i++) {
    if (pool[i].type !== 'correct') distractor_logic[['A', 'B', 'C', 'D'][i]] = pool[i].type;
  }

  return { choices, correctIndex, distractor_logic };
}

export default { generateChoices };
