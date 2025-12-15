import { cards } from '../src/data/cards';
import { explainFormula } from '../src/utils/formulaExplain';

const re = /area|volume|perimeter|circumference|diagonal|radius|diameter/i;
const failing: Array<{id: string; expl: string}> = [];

for (const c of cards.filter(x => x.type === 'shape')) {
  const expl = explainFormula(c as any) || '';
  if (!re.test(expl)) {
    failing.push({ id: c.id, expl });
  }
}

if (failing.length === 0) {
  console.log('All shape cards have shape-aware explanations ✅');
  process.exit(0);
} else {
  console.log('Shape cards missing shape keywords:');
  for (const f of failing) {
    console.log(`- ${f.id}: "${f.expl.replace(/\n/g, ' ')}"`);
  }
  process.exit(2);
}
