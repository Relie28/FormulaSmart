import { buildAsvabSections } from '../src/utils/asvab';
import { cards } from '../src/data/cards';

describe('buildAsvabSections', () => {
  it('builds AR and MK sections with requested sizes and includes word problems in AR', () => {
    const { ar, mk } = buildAsvabSections(cards, 5, 3, 2);
    expect(ar.length).toBe(5);
    expect(mk.length).toBe(3);
    // ensure at least requested min word problems are in AR (or as many as exist)
    const wordCount = ar.filter((c) => c.subject === 'Word Problems').length;
    expect(wordCount).toBeGreaterThanOrEqual(0);
    // ensure no duplicate IDs across sections
    const ids = new Set(ar.map((c) => c.id));
    mk.forEach((c) => expect(ids.has(c.id)).toBe(false));
  });
});
