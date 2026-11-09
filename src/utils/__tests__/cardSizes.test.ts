import { describe, it, expect } from 'vitest';
import { calculateA4GridLayout, CARD_SIZE_PRESETS } from '../cardSizes';

describe('Card Sizes & A4 Grid Layout', () => {
  it('has CR80 54x86mm and 86x54mm presets', () => {
    const cr80Portrait = CARD_SIZE_PRESETS.find((p) => p.widthMm === 54 && p.heightMm === 86);
    const cr80Landscape = CARD_SIZE_PRESETS.find((p) => p.widthMm === 86 && p.heightMm === 54);
    expect(cr80Portrait).toBeDefined();
    expect(cr80Landscape).toBeDefined();
  });

  it('calculates 3x3=9 cards for 64x92mm on A4', () => {
    const layout = calculateA4GridLayout(64, 92);
    expect(layout.cols).toBe(3);
    expect(layout.rows).toBe(3);
    expect(layout.cardsPerPage).toBe(9);
    expect(layout.marginLeftMm).toBe(9);
    expect(layout.marginTopMm).toBe(10.5);
  });

  it('calculates 3x3=9 cards for 54x86mm (CR80 Portrait) on A4', () => {
    const layout = calculateA4GridLayout(54, 86);
    expect(layout.cols).toBe(3);
    expect(layout.rows).toBe(3);
    expect(layout.cardsPerPage).toBe(9);
    expect(layout.marginLeftMm).toBe(24);
    expect(layout.marginTopMm).toBe(19.5);
  });

  it('calculates 2 cols for 86x54mm (CR80 Landscape) on A4 without horizontal overflow', () => {
    const layout = calculateA4GridLayout(86, 54);
    expect(layout.cols).toBe(2);
    expect(layout.rows).toBe(5);
    expect(layout.cardsPerPage).toBe(10);
    expect(layout.marginLeftMm).toBe(19);
    expect(layout.marginTopMm).toBe(13.5);
    // Crucial check: 2 * 86 = 172mm <= 210mm paper width
    expect(layout.cols * 86).toBeLessThanOrEqual(210);
    // Crucial check: 5 * 54 = 270mm <= 297mm paper height
    expect(layout.rows * 54).toBeLessThanOrEqual(297);
  });

  it('calculates 2x2=4 cards for 95x135mm on A4 sheet', () => {
    const layout = calculateA4GridLayout(95, 135, 210, 297, 4);
    expect(layout.cols).toBe(2);
    expect(layout.rows).toBe(2);
    expect(layout.cardsPerPage).toBe(4);
    expect(layout.marginLeftMm).toBe(10);
    expect(layout.marginTopMm).toBe(13.5);
    expect(layout.cols * 95).toBeLessThanOrEqual(210);
    expect(layout.rows * 135).toBeLessThanOrEqual(297);
  });
});
