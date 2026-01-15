import fs from 'fs';
import path from 'path';

describe('Quiz submit button static checks', () => {
  const src = fs.readFileSync(path.join(__dirname, '../src/screens/Quiz.tsx'), 'utf8');

  it('contains a Submit Answer button and selection state', () => {
    expect(src.includes("Submit Answer") || src.includes('Submit Answer')).toBeTruthy();
    expect(src.includes('selectedChoice') || src.includes('setSelectedChoice')).toBeTruthy();
    expect(src.includes("testID=\"submit-answer\"") || src.includes("testID='submit-answer'"));
  });
});
