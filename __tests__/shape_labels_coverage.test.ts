import { cards } from '../src/data/cards';
import { getShapeLabels } from '../src/utils/shapeLabels';

describe('Shape labels coverage for all shape cards', () => {
  const expectMap: Record<string, string[]> = {
    circle: ['r'],
    rectangle: ['l','w'],
    square: ['s'],
    triangle: ['b','h'],
    'right triangle': ['a','b','c'],
    'rectangular solid': ['l','w','h'],
    cube: ['s'],
    cylinder: ['r','h'],
    parallelogram: ['b','h'],
    trapezoid: ['b₁','b₂','h'],
    rhombus: ['d₁','d₂'],
    pentagon: ['s'],
    hexagon: ['s'],
    ellipse: ['a','b'],
    kite: ['d₁','d₂']
  };

  const shapeCards = cards.filter(c => c.type === 'shape');
  for (const c of shapeCards) {
    test(`${c.id} (${c.shape}) has matching label`, () => {
      const shapeKey = (String((c as any).shape || '').toLowerCase()).trim();
      const labels = getShapeLabels(c as any).join(' ');
      // there should be at least one label
      expect(labels.length).toBeGreaterThan(0);
      const expectList = expectMap[shapeKey];
      if (expectList) {
        for (const ex of expectList) expect(labels).toContain(ex);
      } else {
        expect(labels.length).toBeGreaterThan(0);
      }
    });
  }
});
