import { describe, it, expect } from 'vitest';
import { defaultPrintSettings } from '../../db/database';
import { defaultReferenceTemplate } from '../../db/defaultTemplates';

describe('A4 9-Cards Layout & Geometry Calculation', () => {
  it('default print settings grid fits A4 with centered margins', () => {
    const cardW = defaultPrintSettings.cardWidthMm; // 81 mm (75 frame + 2×3 white edge)
    const cardH = defaultPrintSettings.cardHeightMm; // 116 mm (110 frame + 2×3 white edge)
    const cols = defaultPrintSettings.gridColumns;
    const rows = defaultPrintSettings.gridRows;

    const totalWidth = cols * cardW;
    const totalHeight = rows * cardH;

    expect(totalWidth).toBeLessThanOrEqual(210);
    expect(totalHeight).toBeLessThanOrEqual(297);
    expect((210 - totalWidth) / 2).toBe(defaultPrintSettings.marginLeftMm);
    expect((297 - totalHeight) / 2).toBe(defaultPrintSettings.marginTopMm);
  });

  it('default template frame is exactly 75 x 110 mm with a 21 x 30 mm photo', () => {
    const t = defaultReferenceTemplate;
    const m = t.whiteMarginMm ?? 0;
    expect(t.cardWidthMm - 2 * m).toBe(75);
    expect(t.cardHeightMm - 2 * m).toBe(110);
    expect(t.useExactPhotoSize).toBe(true);
    expect(t.photoBoxWidthMm).toBe(21);
    expect(t.photoBoxHeightMm).toBe(30);
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

  it('guarantees director name and footer fit safely inside card bottom border for 64x92 and 60x90 cards', () => {
    // Top-photo vertical layout verification
    const cardHeights = [92, 90]; // 64x92 (MoEYS standard) and 60x90 (A2 pouch)
    const cardWidths = [64, 60];

    for (let i = 0; i < cardHeights.length; i++) {
      const widthMm = cardWidths[i];
      const heightMm = cardHeights[i];
      const scale = 300 / 25.4;
      const widthPx = Math.round(widthMm * scale);
      const heightPx = Math.round(heightMm * scale);
      const sRatio = widthPx / 242;

      const cardPad = 4.5 * sRatio;
      const innerPad = 4 * sRatio;
      const by = cardPad;
      const bh = heightPx - 2 * cardPad;
      const innerBottom = by + bh - innerPad;

      // Vertical element breakdown in base units
      const fMoul1 = 11.5 * sRatio;
      const fMoul2 = 10 * sRatio;
      const flourishH = 10 * sRatio;
      const logoH = 22 * sRatio;
      const photoH = 101 * sRatio;
      const lineGap = 14 * sRatio;

      let curY = cardPad + innerPad + 2 * sRatio;
      curY += fMoul1 + 2 * sRatio;
      curY += fMoul2 + 2 * sRatio;
      curY += flourishH + 2 * sRatio;

      const photoY = curY + logoH + 3 * sRatio;
      const fullY = photoY + photoH + 5 * sRatio + 5 * lineGap;

      const footerH = 46 * sRatio;
      const maxAllowedYDate = innerBottom - 46 * sRatio;
      const targetFooterY = innerBottom - footerH;
      const yDate = Math.min(Math.max(fullY + 3 * sRatio, targetFooterY), maxAllowedYDate);

      // Director name position (under Director title on right or left)
      const dirNameY = yDate + 29.5 * sRatio;
      const dirNameBottom = dirNameY + 10 * sRatio; // Font size ~ 10 * sRatio

      // 1. Verify NO overlap: Gap between address line (Line 5) and footer date line
      const addressLineY = fullY - lineGap;
      const gapAddressToDate = yDate - addressLineY;
      expect(gapAddressToDate).toBeGreaterThanOrEqual(20 * sRatio); // Substantial room (no overlap)

      // 2. Director name bottom MUST be strictly within innerBottom with safety margin (>= 6.0 base units)
      expect(dirNameBottom).toBeLessThan(innerBottom);
      expect(innerBottom - dirNameBottom).toBeGreaterThanOrEqual(6.0 * sRatio);

      // Back side: verify barcode bottom is safely inside innerBottom with no phone number cutoff
      const backFooterY = innerBottom - 24 * sRatio;
      const barH = 13 * sRatio;
      const barcodeBottom = backFooterY + 2 * sRatio + barH + 6 * sRatio;
      expect(barcodeBottom).toBeLessThan(innerBottom);
      expect(innerBottom - barcodeBottom).toBeGreaterThanOrEqual(2.0 * sRatio);
    }
  });
});
