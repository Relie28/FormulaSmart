import { cards } from '../src/data/cards';
import { extractShapeNumbers } from '../src/utils/shapeLabels';

describe('extractShapeNumbers helper', () => {
  test('rectangle word problem extracts width and height', () => {
    const card = cards.find(c => c.id === 'word-1');
    expect(card).toBeDefined();
    const nums = extractShapeNumbers(card as any);
    console.log('word-1 nums:', nums);
    expect(nums.w).toBe('8');
    expect(nums.h).toBe('5');
  });

  test('diagonal rectangle extracts 6 by 8', () => {
    const card = cards.find(c => c.id === 'word-diag-rect');
    expect(card).toBeDefined();
    const nums = extractShapeNumbers(card as any);
    expect(nums.l).toBe('6');
    expect(nums.w).toBe('8');
  });

  test('right triangle legs extraction', () => {
    const card = cards.find(c => c.id === 'word-pyth-1');
    expect(card).toBeDefined();
    const nums = extractShapeNumbers(card as any);
    console.log('word-pyth-1 nums:', nums);
    expect(nums.a).toBe('3');
    expect(nums.b).toBe('4');
  });
});
