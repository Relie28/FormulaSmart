import { getShapeLabels } from '../src/utils/shapeLabels';

type Card = any;

describe('ShapePreview perimeter labels', () => {
  const cases: Array<{shape:string; expect: string[]}> = [
    { shape: 'Circle', expect: ['r'] },
    { shape: 'Rectangle', expect: ['l','w'] },
    { shape: 'Square', expect: ['s'] },
    { shape: 'Triangle', expect: ['b','h'] },
    { shape: 'Parallelogram', expect: ['b','h'] },
    { shape: 'Trapezoid', expect: ['b₁','b₂','h'] },
    { shape: 'Rhombus', expect: ['d₁','d₂'] },
    { shape: 'Pentagon', expect: ['s'] },
    { shape: 'Hexagon', expect: ['s'] },
    { shape: 'Kite', expect: ['d₁','d₂'] }
  ];

  for (const c of cases) {
    test(`${c.shape} shows variable letters when prompt mentions perimeter`, () => {
      const card: Card = { id: `t-${c.shape}`, type: 'shape', subject: 'Geometry', shape: c.shape, prompt: `Perimeter of a ${c.shape}`, answer: '' };
      const labels = getShapeLabels(card as any);
      for (const ex of c.expect) expect(labels.join(' ')).toContain(ex);
    });
  }
});
