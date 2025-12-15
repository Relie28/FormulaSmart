import { subjects, cardsForSubjects } from '../src/data/cards';

test('new subjects present and return cards', () => {
  expect(subjects).toEqual(expect.arrayContaining(['Fractions', 'Decimals', 'Mixed Numbers', 'Solve for X']));

  const fr = cardsForSubjects(['Fractions']);
  expect(fr.length).toBeGreaterThan(0);
  expect(fr.every((c: any) => c.subject === 'Fractions')).toBeTruthy();

  const de = cardsForSubjects(['Decimals']);
  expect(de.length).toBeGreaterThan(0);
  expect(de.every((c: any) => c.subject === 'Decimals')).toBeTruthy();

  const mn = cardsForSubjects(['Mixed Numbers']);
  expect(mn.length).toBeGreaterThan(0);
  expect(mn.every((c: any) => c.subject === 'Mixed Numbers')).toBeTruthy();

  const sx = cardsForSubjects(['Solve for X']);
  expect(sx.length).toBeGreaterThan(0);
  expect(sx.every((c: any) => c.subject === 'Solve for X')).toBeTruthy();
});
