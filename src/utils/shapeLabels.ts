import type { Card } from '../data/cards';
import { detectShapeFromCard } from './shapeDetect';

export function getShapeLabels(card: Card) {
  const shape = detectShapeFromCard(card as any);
  if (!shape) return [];
  const hay = ((card.prompt || '') + ' ' + (card.answer || '')).toLowerCase();
  const showRadius = /radius|circumference|diameter/.test(hay);
  const showDiameter = /diameter|diagonal/.test(hay);
  const showVolume = /volume|v =|cylinder/.test(hay);

  const labels: string[] = [];
  if (shape === 'circle') {
    // circle labels: radius and diameter
    if (showRadius) labels.push('r');
    if (showDiameter) labels.push('d');
    // always include r as a primary label
    if (!showRadius && !showDiameter) labels.push('r');
  }
  if (shape === 'rectangle') {
    labels.push('l');
    labels.push('w');
  }
  if (shape === 'square') {
    labels.push('s');
  }
  if (shape === 'triangle') {
    labels.push('b');
    labels.push('h');
  }
  if (shape === 'right triangle' || shape === 'right-triangle' || shape === 'righttriangle') {
    labels.push('a');
    labels.push('b');
    labels.push('c');
  }
  if (shape === 'parallelogram') {
    labels.push('b');
    labels.push('h');
  }
  if (shape === 'trapezoid') {
    labels.push('b₁');
    labels.push('b₂');
    labels.push('h');
  }
  if (shape === 'rhombus' || shape === 'diamond') {
    labels.push('d₁');
    labels.push('d₂');
  }
  if (shape === 'pentagon') {
    labels.push('s');
  }
  if (shape === 'hexagon') {
    labels.push('s');
  }
  if (shape === 'ellipse' || shape === 'oval') {
    labels.push('a');
    labels.push('b');
  }
  if (shape === 'cylinder') {
    labels.push('r');
    labels.push('h');
  }
  if (shape === 'kite') {
    labels.push('d₁');
    labels.push('d₂');
  }
  if (shape === 'cube') {
    labels.push('s');
  }
  if (shape.includes('rectangular') || shape === 'rectangular solid' || shape === 'rectangular-solid') {
    // rectangular solid (3D)
    labels.push('l');
    labels.push('w');
    labels.push('h');
  }
  return labels;
}

export default getShapeLabels;

// Extract numeric values from a word-problem style card and map them to shape variables
export function extractShapeNumbers(card: Card): Record<string, string> {
  const out: Record<string, string> = {};
  const prompt = (card.prompt || '').toLowerCase();
  const answer = (card.answer || '').toLowerCase();
  const hay = `${prompt} ${answer}`;

  // Shortcut: if the text explicitly mentions width and height, capture those first
  if (/wide|width/.test(hay) && /tall|height|high/.test(hay)) {
    const wSpecific = hay.match(/(\d+(?:\.\d+)?)[^\d]{0,30}(?:wide|width)/i);
    const hSpecific = hay.match(/(\d+(?:\.\d+)?)[^\d]{0,30}(?:tall|height|high)/i);
    if (wSpecific) out['w'] = wSpecific[1];
    if (hSpecific) out['h'] = hSpecific[1];
    return out;
  }

  // pattern: '<num> units wide' or '<num> units tall' etc.
  const byPattern = /(?:(\d+(?:\.\d+)?))\s*(?:by|×|x)\s*(\d+(?:\.\d+)?)/i;
  const byMatch = hay.match(byPattern);
  if (byMatch) {
    out['l'] = byMatch[1];
    out['w'] = byMatch[2];
    return out;
  }

  // patterns for width/height
  const wMatch = hay.match(/(\d+(?:\.\d+)?)\s*(?:units|inches|cm|ft|m)?\s*(?:wide|width|wide,)/i);
  const hMatch = hay.match(/(\d+(?:\.\d+)?)\s*(?:units|inches|cm|ft|m)?\s*(?:tall|height|high)/i);
  if (wMatch) out['w'] = wMatch[1];
  if (hMatch) out['h'] = hMatch[1];

  // 'A rectangle is 8 units wide and 5 units tall.' style with two numbers
  const twoMatch = hay.match(/(\d+(?:\.\d+)?)[^\d]{1,20}(\d+(?:\.\d+)?)/);
  if (twoMatch && /rectangle|rectangular|by/.test(hay)) {
    // If the prompt contains width/height keywords, map accordingly
    const hasWide = /wide|width/.test(hay);
    const hasTall = /tall|height|high/.test(hay);
    if (hasWide && hasTall) {
      out['w'] = twoMatch[1];
      out['h'] = twoMatch[2];
    } else if (!out['l'] && !out['w']) {
      // fallback: assign as length and width
      out['l'] = twoMatch[1];
      out['w'] = twoMatch[2];
    }
    // debug: twoMatch mapping handled above
  }

  // If two numbers were assigned as l and w but the prompt had wide/height context,
  // convert to width/height mapping: w = first, h = second
  if (out['l'] && out['w'] && /wide|width/.test(hay) && /tall|height|high/.test(hay)) {
    const lVal = out['l'];
    const wVal = out['w'];
    out['w'] = lVal;
    out['h'] = wVal;
    delete out['l'];
  }

  // radius/diameter
  const rMatch = hay.match(/radius[^\d]{0,6}(\d+(?:\.\d+)?)/i) || hay.match(/r\s*=\s*(\d+(?:\.\d+)?)/i);
  const dMatch = hay.match(/diameter[^\d]{0,6}(\d+(?:\.\d+)?)/i) || hay.match(/d\s*=\s*(\d+(?:\.\d+)?)/i);
  if (rMatch) out['r'] = rMatch[1];
  if (dMatch) out['d'] = dMatch[1];

  // square side
  const sMatch = hay.match(/side[^\d]{0,6}(\d+(?:\.\d+)?)/i) || hay.match(/s\s*=\s*(\d+(?:\.\d+)?)/i);
  if (sMatch) out['s'] = sMatch[1];

  // right triangle legs 'legs of length 3 and 4' or 'legs of length 3 and 4.'
  const legsMatch = hay.match(/legs[\s\S]{0,50}?(\d+(?:\.\d+)?)[\s\S]{0,50}?(\d+(?:\.\d+)?)/i);
  if (legsMatch) {
    out['a'] = legsMatch[1];
    out['b'] = legsMatch[2];
  }

  // diagonal/rectangle: '6 by 8' - handle if byPattern matched earlier, fallback
  const diagMatch = hay.match(/diagonal of a (\d+) by (\d+)/i) || hay.match(/(\d+) by (\d+)/i);
  if (diagMatch && !out['l'] && !out['w']) {
    out['l'] = diagMatch[1];
    out['w'] = diagMatch[2];
  }

  // Final normalization: if text mentions width and height explicitly, prefer those
  if (/wide|width/.test(hay) && /tall|height|high/.test(hay)) {
    const wSpecific = hay.match(/(\d+(?:\.\d+)?)[^\d]{0,30}(?:wide|width)/i);
    const hSpecific = hay.match(/(\d+(?:\.\d+)?)[^\d]{0,30}(?:tall|height|high)/i);
    if (wSpecific) out['w'] = wSpecific[1];
    if (hSpecific) out['h'] = hSpecific[1];
    delete out['l'];
  }

  // final output mapping

  return out;
}
