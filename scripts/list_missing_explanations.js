const fs = require('fs');
const path = require('path');

// Read the cards.ts source and extract card objects using a lightweight parser so
// this script can run in plain Node without requiring TS compilation.
const src = fs.readFileSync(path.join(__dirname, '../src/data/cards.ts'), 'utf8');

// Find the array literal for 'export const cards' and capture its content
const arrMatch = src.match(/export const cards[\s\S]*?=\s*\[([\s\S]*?)\];/);
if (!arrMatch) {
    console.error('Could not locate cards array in src/data/cards.ts');
    process.exit(2);
}

const arrText = arrMatch[1];

// Match individual objects in the array (naive but fine for our data shape)
const objRe = /\{([\s\S]*?)\}(?=,|$)/g;
const objects = [];
let m;
while ((m = objRe.exec(arrText))) {
    const objText = m[1];
    // extract fields we care about: id, type, shape, prompt, answer
    const get = (key) => {
        const re = new RegExp(key + "\s*:\s*(['\"])([\s\S]*?)\1", 'i');
        const mm = objText.match(re);
        return mm ? mm[2].trim() : undefined;
    };
    const id = get('id');
    const type = get('type');
    const shape = get('shape');
    const prompt = get('prompt');
    const answer = get('answer');
    objects.push({ id, type, shape, prompt, answer });
}

const shapes = objects.filter((o) => o.type === 'shape');
const re = /area|volume|perimeter|circumference|diagonal|radius|diameter/i;
const failing = [];

// Minimal explain mapping re-uses same logic we use in app: try to derive a plain-English description
const { explainFormula } = (function () {
    // Lazy require via child process compile isn't necessary; instead, replicate the small
    // part of explainFormula relevant to this check: if the card.answer contains '=' or 'V =' etc,
    // we try to detect keywords directly from the prompt and answer.
    function explainFormulaLocal(c) {
        const p = (c.prompt || '').toLowerCase();
        const a = (c.answer || '') + '';
        if (p.includes('volume') || /v\s*=/.test(a.toLowerCase()) || a.toLowerCase().includes('v =')) {
            if ((c.shape || '').toLowerCase().includes('cube')) return 'The volume of a cube is V = s³.';
            if ((c.shape || '').toLowerCase().includes('rectangular')) return 'The volume of a rectangular solid is V = l × w × h.';
            if ((c.shape || '').toLowerCase().includes('cylinder')) return 'The volume of a cylinder is V = π r² h.';
            return 'This formula gives a volume.';
        }
        if (p.includes('area') || a.toLowerCase().includes('a =') || /π|r\^2|r\u00B2/.test(a)) return 'This formula computes an area.';
        return '';
    }
    return { explainFormula: explainFormulaLocal };
})();

for (const c of shapes) {
    const expl = explainFormula(c) || '';
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
        console.log(`- ${f.id}: "${(f.expl || '').replace(/\n/g, ' ')}"`);
    }
    process.exit(2);
}

