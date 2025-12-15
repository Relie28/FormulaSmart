import fs from 'fs';
import path from 'path';

describe('ASVAB quiz timer stability', () => {
    it('uses useMemo for ASVAB choices so answers are stable across re-renders', () => {
        const src = fs.readFileSync(path.join(__dirname, '../src/screens/Quiz.tsx'), 'utf8');
        // look for a useMemo that depends on asvabIndex and asvabQuestions
        const re = /useMemo\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?asvabQuestions[\s\S]*?asvabIndex[\s\S]*?\},\s*\[\s*asvabIndex\s*,\s*asvabQuestions\s*\]\s*\)/m;
        expect(re.test(src)).toBeTruthy();
    });
});
