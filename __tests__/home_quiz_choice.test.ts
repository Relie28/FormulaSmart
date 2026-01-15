import fs from 'fs';
import path from 'path';

describe('Home quiz chooser', () => {
  it('offers an ASVAB Math Quiz choice from the Home screen', () => {
    const filePath = path.join(__dirname, '..', 'src', 'screens', 'Home.tsx');
    const src = fs.readFileSync(filePath, 'utf8');
    expect(src).toContain('Take a Quiz');
    expect(src).toContain('ASVAB Math Quiz');
    expect(src).toMatch(/navigation\.navigate\(\s*'Quiz'\s*,\s*\{\s*subjects:\s*\[\s*'ASVAB'\s*\]\s*\}\s*\)/m);
  });
});
