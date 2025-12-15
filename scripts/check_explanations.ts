import { cards } from '../src/data/cards';
import { explainFormula } from '../src/utils/formulaExplain';

function containsAny(hay: string, trials: string[]) {
  const lower = hay.toLowerCase();
  return trials.some(t => lower.includes(t));
}

const failures: string[] = [];

for (const c of cards) {
  const expl = explainFormula(c) ?? '';
  const p = c.prompt.toLowerCase();

  if (c.type === 'shape') {
    const shape = (c as any).shape?.toLowerCase();
    if (!expl) {
      failures.push(`${c.id}: shape card has no explanation (shape=${shape})`);
      continue;
    }
    // expect explanation to mention the shape or area/perimeter
    if (!containsAny(expl, [shape, 'area', 'perimeter', 'circumference', 'diagon'])) {
      failures.push(`${c.id}: explanation for shape card may be wrong: '${expl}'`);
    }
  }

  // specific checks for definition prompts
  if (p.includes('area') && containsAny(p, ['square','rectangle','circle','triangle','parallelogram','trapezoid','rhombus','pentagon','hexagon','ellipse','kite'])) {
    const shape = ['square','rectangle','circle','triangle','parallelogram','trapezoid','rhombus','pentagon','hexagon','ellipse','kite'].find(s => p.includes(s))!;
    if (!containsAny(expl, ["area", shape])) {
      failures.push(`${c.id}: expected area explanation mentioning '${shape}', got: '${expl}'`);
    }
  }

  if (p.includes('perimeter') && containsAny(p, ['rectangle','square','triangle'])) {
    const shape = ['rectangle','square','triangle'].find(s => p.includes(s))!;
    if (!containsAny(expl, ['perimeter', shape])) {
      failures.push(`${c.id}: expected perimeter explanation mentioning '${shape}', got: '${expl}'`);
    }
  }

  if (p.includes('sum') || p.includes('what is the sum')) {
    if (!containsAny(expl, ['sum', 'addition'])) {
      failures.push(`${c.id}: expected sum/addition explanation, got: '${expl}'`);
    }
  }

  if (p.includes('difference')) {
    if (!containsAny(expl, ['difference', 'subtraction'])) {
      failures.push(`${c.id}: expected difference/subtraction explanation, got: '${expl}'`);
    }
  }

  if (p.includes('product')) {
    if (!containsAny(expl, ['product', 'multiplication'])) {
      failures.push(`${c.id}: expected product/multiplication explanation, got: '${expl}'`);
    }
  }

  if (p.includes('quotient')) {
    if (!containsAny(expl, ['quotient', 'division'])) {
      failures.push(`${c.id}: expected quotient/division explanation, got: '${expl}'`);
    }
  }

  if (p.includes('pythagorean')) {
    if (!containsAny(expl, ['pythagorean', 'right triangle', 'hypotenuse'])) {
      failures.push(`${c.id}: expected pythagorean explanation, got: '${expl}'`);
    }
  }

  if (p.includes('exponent') || p.includes('square root') || p.match(/\bx\^?2\b/)) {
    if (!containsAny(expl, ['exponent', 'square root', 'squared'])) {
      failures.push(`${c.id}: expected exponent/root explanation, got: '${expl}'`);
    }
  }

  if (p.includes('percent')) {
    if (!containsAny(expl, ['percent', 'part'])) {
      failures.push(`${c.id}: expected percent explanation, got: '${expl}'`);
    }
  }

  if (p.includes('volume')) {
    if (!containsAny(expl, ['volume', 'space'])) {
      failures.push(`${c.id}: expected volume explanation, got: '${expl}'`);
    }
  }
}

if (failures.length) {
  console.error('Found explanation issues:');
  failures.forEach(f => console.error('- ' + f));
  process.exit(2);
} else {
  console.log('All explanation checks passed.');
  process.exit(0);
}
