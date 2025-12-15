import fs from 'fs';
import path from 'path';

describe('Flashcards finish safety', () => {
  it('does not call finishSession directly inside a setDeck callback (prevents re-entrancy)', () => {
    const filePath = path.join(__dirname, '..', 'src', 'screens', 'Flashcards.tsx');
    const src = fs.readFileSync(filePath, 'utf8');

    // Ensure there is no immediate call to finishSession inside a setDeck((prev) => { ... })
    const lines = src.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('setDeck(') && lines[i+1] && lines[i+1].includes('(')) {
        // look ahead a few lines to ensure finishSession isn't present
        const window = lines.slice(i, i+6).join('\n');
        expect(window).not.toMatch(/finishSession\s*\(/);
      }
    }
  });
});
