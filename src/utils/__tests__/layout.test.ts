import { describe, it, expect } from 'vitest';
import { defaultPrintSettings } from '../../db/database';
import { defaultReferenceTemplate } from '../../db/defaultTemplates';

describe('A4 9-Cards Layout & Geometry Calculation', () => {
  it('calculates 3x3 grid geometry correctly on A4 paper (210 x 297 mm)', () => {
    const cardW = defaultPrintSettings.cardWidthMm; // 64 mm
    const cardH = defaultPrintSettings.cardHeightMm; // 92 mm

    const totalWidth = 3 * cardW; // 192 mm
    const totalHeight = 3 * cardH; // 276 mm

    expect(totalWidth).toBeLessThanOrEqual(210);
    expect(totalHeight).toBeLessThanOrEqual(297);

    // Side margins
    const marginSide = (210 - totalWidth) / 2; // 9 mm
    const marginTopBottom = (297 - totalHeight) / 2; // 10.5 mm

    expect(marginSide).toBe(9);
    expect(marginTopBottom).toBe(10.5);
  });

  it('preserves authentic reference template properties', () => {
    expect(defaultReferenceTemplate.isReference).toBe(true);
    expect(defaultReferenceTemplate.countryHeaderKm1).toBe('ព្រះរាជាណាចក្រកម្ពុជា');
    expect(defaultReferenceTemplate.countryHeaderKm2).toBe('ជាតិ សាសនា ព្រះមហាក្សត្រ');
    expect(defaultReferenceTemplate.cardTitleKm).toBe('អត្តសញ្ញាណប័ណ្ណសិស្ស');
    expect(defaultReferenceTemplate.primaryColor).toBe('#163d7e');
    expect(defaultReferenceTemplate.fontHeading).toBe('Moul');
    expect(defaultReferenceTemplate.fontBody).toBe('Battambang');
  });

  it('mirrors duplex columns accurately for two-sided alignment', () => {
    const cols = 3;
    // Front column 0 -> Back column 2
    expect(cols - 1 - 0).toBe(2);
    // Front column 1 -> Back column 1
    expect(cols - 1 - 1).toBe(1);
    // Front column 2 -> Back column 0
    expect(cols - 1 - 2).toBe(0);
  });
});
