export type PrintMode = 'duplex' | 'front-only' | 'back-only';
export type ExportTarget = 'all' | 'selected' | 'class' | 'individual';

export interface PrintSettings {
  paperSize: 'A4';
  paperWidthMm: number; // 210 mm
  paperHeightMm: number; // 297 mm

  gridColumns: 3;
  gridRows: 3;
  cardsPerPage: 9;

  cardWidthMm: number; // 64 mm
  cardHeightMm: number; // 92 mm

  // Computed / customizable margins
  marginTopMm: number; // (297 - 3 * 92) / 2 = 10.5 mm
  marginLeftMm: number; // (210 - 3 * 64) / 2 = 9 mm
  gutterXmM: number; // 0 mm (cards adjacent with shared cut line) or 1-2mm
  gutterYmM: number; // 0 mm

  // Duplex Calibration Offsets (for adjusting physical printer feed drift)
  duplexOffsetXmM: number; // horizontal shift in mm for back pages
  duplexOffsetYmM: number; // vertical shift in mm for back pages

  // Cutting guides
  showCuttingGuides: boolean;
  cuttingGuideColor: string; // #94a3b8 (slate-400)
  cuttingGuideLengthMm: number; // 4 mm

  // Resolution
  renderDpi: number; // 300 DPI for production print quality
}

export interface CalibrationTestResult {
  horizontalShiftMm: number;
  verticalShiftMm: number;
  testedAt: number;
}
