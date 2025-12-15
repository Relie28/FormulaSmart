import { cards } from '../src/data/cards';
import { explainFormula } from '../src/utils/formulaExplain';
import { detectShapeFromCard } from '../src/utils/shapeDetect';

describe('Shape detection and explanations', () => {
  test('shape overview should not match a specific shape', () => {
    const overview = cards.find(c => c.id === 'shapes-overview');
    expect(overview).toBeDefined();
    expect(detectShapeFromCard(overview as any)).toBeNull();
  });

  test('shape cards have correct detection and explanation', () => {
    const shapeCards = cards.filter(c => c.type === 'shape');
    const missing: Array<{id: string; expl: string}> = [];
    for (const c of shapeCards) {
      const detected = detectShapeFromCard(c as any);
      expect(detected).toBeDefined();
      const expl = explainFormula(c as any) || '';
      // expect explanation to mention shape or area/volume
      if (!/area|volume|perimeter|circumference|diagonal|radius|diameter/i.test(expl)) {
        missing.push({ id: c.id, expl });
      }
    }
    if (missing.length > 0) {
      console.error('Missing shape-aware explanations for:', missing.map(m => m.id).join(', '));
    }
    expect(missing.length).toBe(0);
  });

  test('definition cards about shapes return shape-aware explanations', () => {
    const rectPerim = cards.find(c => c.id === 'geom-perim-rect');
    expect(rectPerim).toBeDefined();
    const expl = explainFormula(rectPerim as any) || '';
    expect(expl.toLowerCase()).toContain('rectangle');
    expect(expl.toLowerCase()).toContain('perimeter');
  });
});
