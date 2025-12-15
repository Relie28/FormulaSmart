process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({ module: 'es2015', bundler: false });
require('ts-node').register({ transpileOnly: true });
const { cards } = require('../src/data/cards');
const { explainFormula } = require('../src/utils/formulaExplain');

function containsAny(hay, trials) {
    const lower = (hay || '').toLowerCase();
    return trials.some(t => lower.includes(t));
}

const failures = [];

for (const c of cards) {
    const expl = explainFormula(c) ?? '';
    const p = (c.prompt || '').toLowerCase();

    if (c.type === 'shape') {
        const shape = (c.shape || '').toLowerCase();
        if (!expl) {
            failures.push(`${c.id}: shape card has no explanation (shape=${shape})`);
            continue;
        }
        if (!containsAny(expl, [shape, 'area', 'perimeter', 'circumference', 'diagon'])) {
            failures.push(`${c.id}: explanation for shape card may be wrong: '${expl}'`);
        }
    }

    if (p.includes('area') && containsAny(p, ['square', 'rectangle', 'circle', 'triangle', 'parallelogram', 'trapezoid', 'rhombus', 'pentagon', 'hexagon', 'ellipse', 'kite'])) {
        const shapes = ['square', 'rectangle', 'circle', 'triangle', 'parallelogram', 'trapezoid', 'rhombus', 'pentagon', 'hexagon', 'ellipse', 'kite'];
        const shape = shapes.find(s => p.includes(s));
        if (!containsAny(expl, ["area", shape])) {
            failures.push(`${c.id}: expected area explanation mentioning '${shape}', got: '${expl}'`);
        }
    }

    if (p.includes('perimeter') && containsAny(p, ['rectangle', 'square', 'triangle'])) {
        const shape = ['rectangle', 'square', 'triangle'].find(s => p.includes(s));
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

    if (p.includes('exponent') || p.includes('square root') || /\bx\^?2\b/.test(p)) {
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
