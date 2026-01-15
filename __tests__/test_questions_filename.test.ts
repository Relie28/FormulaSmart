import fs from 'fs';
import path from 'path';

describe('test_questions.json filename and import', () => {
    it('exists with exact lowercase filename and no conflicting case-variants', () => {
        const dir = path.join(__dirname, '../src/data');
        const files = fs.readdirSync(dir);
        expect(files).toContain('test_questions.json');
        // Resist regressions where an uppercase variant is committed
        expect(files).not.toContain('test_questions.JSON');
    });

    it('is importable and contains expected sections', () => {
        // require using the same path as the app code
        const tq = require('../src/data/test_questions.json');
        expect(tq).toBeDefined();
        expect(typeof tq).toBe('object');
        expect(tq.arithmetic_reasoning).toBeDefined();
        expect(tq.mathematics_knowledge).toBeDefined();
    });

    it('Quiz.tsx references the lowercase path', () => {
        const src = fs.readFileSync(path.join(__dirname, '../src/screens/Quiz.tsx'), 'utf8');
        expect(src.includes("require('../data/test_questions.json')") || src.includes('require("../data/test_questions.json")')).toBeTruthy();
    });
});
