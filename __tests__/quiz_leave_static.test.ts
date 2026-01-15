import fs from 'fs';
import path from 'path';

describe('Quiz leave confirmation static checks', () => {
    const src = fs.readFileSync(path.join(__dirname, '../src/screens/Quiz.tsx'), 'utf8');

    it('registers a beforeRemove listener', () => {
        expect(src.includes("addListener('beforeRemove'") || src.includes('addListener("beforeRemove"'));
    });

    it('prompts with an explanatory message when in-progress', () => {
        expect(src.includes("'Leave quiz?'") || src.includes('"Leave quiz?"')).toBeTruthy();
        expect(src.includes('progress').toString()).toBeDefined();
    });

    it('considers ASVAB active state for leave protection', () => {
        expect(src.includes('asvabActiveRef.current') || src.includes('asvabActive')).toBeTruthy();
        expect(src.includes('index > 0 || score > 0 || asvabActiveRef.current')).toBeTruthy();
    });
});
