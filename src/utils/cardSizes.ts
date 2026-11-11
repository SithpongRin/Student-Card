import type { CardTemplate } from '../types/template';
import type { PrintSettings } from '../types/print';

export interface CardSizePreset {
  id: string;
  nameKm: string;
  nameEn: string;
  widthMm: number;
  heightMm: number;
  orientation: 'portrait' | 'landscape';
  descriptionKm: string;
  isPopular?: boolean;
  /** White edge outside the blue frame (per side). Frame = width/height minus 2× this. */
  whiteMarginMm?: number;
  /** Exact photo box size in mm (width × height). */
  photoWidthMm?: number;
  photoHeightMm?: number;
}

/** White edge (per side) used for the 7.5 × 11 cm frame preset. */
export const FRAME_75x110_WHITE_MARGIN_MM = 3;

export interface SheetLayoutOption {
  id: '9-cards' | '4-cards';
  nameKm: string;
  nameEn: string;
  cardsPerPage: number;
  gridCols: number;
  gridRows: number;
  recommendedWidthMm: number;
  recommendedHeightMm: number;
  descriptionKm: string;
}

export const A4_SHEET_LAYOUT_OPTIONS: SheetLayoutOption[] = [
  {
    id: '9-cards',
    nameKm: '១ សន្លឹក ៩ កាត (3 × 3)',
    nameEn: '9 Cards / Sheet (Standard)',
    cardsPerPage: 9,
    gridCols: 3,
    gridRows: 3,
    recommendedWidthMm: 64,
    recommendedHeightMm: 92,
    descriptionKm: 'ទំហំស្តង់ដារផ្លូវការក្រសួងអប់រំ (៦៤ × ៩២ mm) សន្សំសំចៃក្រដាស',
  },
  {
    id: '4-cards',
    nameKm: '១ សន្លឹក ៤ កាត (2 × 2)',
    nameEn: '4 Cards / Sheet (Large)',
    cardsPerPage: 4,
    gridCols: 2,
    gridRows: 2,
    recommendedWidthMm: 95,
    recommendedHeightMm: 135,
    descriptionKm: 'ខ្នាតធំច្បាស់ល្អ (៩៥ × ១៣៥ mm) អក្សរធំ ងាយស្រួលមើល និងបិទរូបថត 3x4 ធំទូលាយ',
  },
];

export const CARD_SIZE_PRESETS: CardSizePreset[] = [
  {
    id: 'frame-75x110',
    nameKm: '៧.៥ cm × ១១ cm (រូបថត ២.១ × ៣ cm)',
    nameEn: '75 × 110 mm frame + white edge (4 on A4)',
    widthMm: 75 + 2 * FRAME_75x110_WHITE_MARGIN_MM,
    heightMm: 110 + 2 * FRAME_75x110_WHITE_MARGIN_MM,
    orientation: 'portrait',
    descriptionKm: 'ស៊ុមខៀវ ៧.៥ × ១១ cm សុក្រិត (មិនគិតគែមស) ប្រអប់រូបថត ២.១ × ៣ cm (៤ កាតលើ A4)',
    isPopular: true,
    whiteMarginMm: FRAME_75x110_WHITE_MARGIN_MM,
    photoWidthMm: 21,
    photoHeightMm: 30,
  },
  {
    id: 'a2-pouch-6x9',
    nameKm: '៦ cm × ៩ cm (ស្រោមផ្លាស្ទិក A2)',
    nameEn: '60 × 90 mm (A2 Soft Pouch - 9 on A4)',
    widthMm: 60,
    heightMm: 90,
    orientation: 'portrait',
    descriptionKm: 'ទំហំពេញនិយមបំផុតតាមសាលារៀន ដាក់ស្រោមផ្លាស្ទិកលេខ A2 (បោះពុម្ព ៩ កាតលើ A4)',
    isPopular: true,
  },
  {
    id: 'a3-pouch-7x10',
    nameKm: '៧ cm × ១០ cm (ស្រោមផ្លាស្ទិក A3)',
    nameEn: '70 × 100 mm (A3 Soft Pouch - 4 on A4)',
    widthMm: 70,
    heightMm: 100,
    orientation: 'portrait',
    descriptionKm: 'ទំហំធំទូលាយ ងាយស្រួលមើលព័ត៌មាន ដាក់ស្រោមផ្លាស្ទិកលេខ A3 (បោះពុម្ព ៤ កាតលើ A4)',
    isPopular: true,
  },
  {
    id: 'moeys-ref',
    nameKm: 'គំរូដើមក្រសួងអប់រំ (៦៤ × ៩២ mm)',
    nameEn: '64 × 92 mm (MoEYS Official - 9 on A4)',
    widthMm: 64,
    heightMm: 92,
    orientation: 'portrait',
    descriptionKm: 'ទំហំគំរូដើមផ្លូវការ (បោះពុម្ព ៩ កាតលើ A4 គំរូដើមរដ្ឋ)',
    isPopular: true,
  },
  {
    id: 'a6-large-4on-a4',
    nameKm: 'កាតខ្នាតធំ A6 (៤ កាតលើ A4)',
    nameEn: '95 × 135 mm (4 on A4 Large)',
    widthMm: 95,
    heightMm: 135,
    orientation: 'portrait',
    descriptionKm: 'បោះពុម្ព ៤ កាតលើ A4 (អក្សរធំច្បាស់ល្អ និងបិទរូបថត 3x4 ធំទូលាយ)',
    isPopular: true,
  },
  {
    id: 'cr80-landscape',
    nameKm: 'កាត ATM / PVC (CR80) ផ្ដេក',
    nameEn: '86 × 54 mm (CR80 Landscape)',
    widthMm: 86,
    heightMm: 54,
    orientation: 'landscape',
    descriptionKm: 'ទំហំកាតប្លាស្ទិក ATM / PVC ស្តង់ដារផ្ដេក (១០ កាតលើ A4)',
    isPopular: true,
  },
  {
    id: 'cr80-portrait',
    nameKm: 'កាត ATM / PVC (CR80) បញ្ឈរ',
    nameEn: '54 × 86 mm (CR80 Portrait)',
    widthMm: 54,
    heightMm: 86,
    orientation: 'portrait',
    descriptionKm: 'ទំហំកាតប្លាស្ទិក ATM / PVC ស្តង់ដារបញ្ឈរ',
    isPopular: true,
  },
  {
    id: 'pouch-standard',
    nameKm: 'កាតអ៊ុតផ្លាស្ទិកស្តង់ដារ Pouch',
    nameEn: '65 × 95 mm (Pouch Laminate)',
    widthMm: 65,
    heightMm: 95,
    orientation: 'portrait',
    descriptionKm: 'ទំហំស្រោមអ៊ុតផ្លាស្ទិកកាតសិស្សទូទៅ',
  },
  {
    id: 'a7-badge',
    nameKm: 'កាតខ្នាត A7',
    nameEn: '74 × 105 mm (A7 Badge)',
    widthMm: 74,
    heightMm: 105,
    orientation: 'portrait',
    descriptionKm: 'ទំហំកាតបំពាក់ខ្សែធំ (១/៨ នៃ A4)',
  },
];

export interface GridLayoutResult {
  cols: number;
  rows: number;
  cardsPerPage: number;
  marginLeftMm: number;
  marginTopMm: number;
  cardWidthMm: number;
  cardHeightMm: number;
  paperWidthMm: number;
  paperHeightMm: number;
}

export function calculateA4GridLayout(
  cardWidthMm: number,
  cardHeightMm: number,
  paperWidthMm: number = 210,
  paperHeightMm: number = 297,
  targetCardsPerPage?: number
): GridLayoutResult {
  // If user explicitly chose 4 cards per sheet (2x2 grid)
  if (targetCardsPerPage === 4) {
    const cols = 2;
    const rows = 2;
    const totalW = cols * cardWidthMm;
    const totalH = rows * cardHeightMm;
    const marginLeftMm = Math.max(0, (paperWidthMm - totalW) / 2);
    const marginTopMm = Math.max(0, (paperHeightMm - totalH) / 2);
    return {
      cols,
      rows,
      cardsPerPage: 4,
      marginLeftMm: Math.round(marginLeftMm * 10) / 10,
      marginTopMm: Math.round(marginTopMm * 10) / 10,
      cardWidthMm,
      cardHeightMm,
      paperWidthMm,
      paperHeightMm,
    };
  }

  // If user explicitly chose 9 cards per sheet (3x3 grid)
  if (targetCardsPerPage === 9) {
    // If the card height is too large for 3 rows on A4 (e.g. 100mm, 135mm),
    // 3 * 100 = 300mm > 297mm. It is physically impossible to fit 9 cards!
    // Safely fallback to 4 cards (2x2 grid) so content never gets cut off.
    if (cardHeightMm * 3 > paperHeightMm || cardWidthMm * 3 > paperWidthMm) {
      const cols = 2;
      const rows = 2;
      const totalW = cols * cardWidthMm;
      const totalH = rows * cardHeightMm;
      const marginLeftMm = Math.max(0, (paperWidthMm - totalW) / 2);
      const marginTopMm = Math.max(0, (paperHeightMm - totalH) / 2);
      return {
        cols,
        rows,
        cardsPerPage: 4,
        marginLeftMm: Math.round(marginLeftMm * 10) / 10,
        marginTopMm: Math.round(marginTopMm * 10) / 10,
        cardWidthMm,
        cardHeightMm,
        paperWidthMm,
        paperHeightMm,
      };
    }

    const cols = 3;
    const rows = 3;
    const totalW = cols * cardWidthMm;
    const totalH = rows * cardHeightMm;
    const marginLeftMm = Math.max(0, (paperWidthMm - totalW) / 2);
    const marginTopMm = Math.max(0, (paperHeightMm - totalH) / 2);
    return {
      cols,
      rows,
      cardsPerPage: 9,
      marginLeftMm: Math.round(marginLeftMm * 10) / 10,
      marginTopMm: Math.round(marginTopMm * 10) / 10,
      cardWidthMm,
      cardHeightMm,
      paperWidthMm,
      paperHeightMm,
    };
  }

  // Safe margins for physical printing (at least 5mm)
  const minMarginX = 5;
  const minMarginY = 5;

  const availableWidth = paperWidthMm - 2 * minMarginX;
  const availableHeight = paperHeightMm - 2 * minMarginY;

  let cols = Math.max(1, Math.floor(availableWidth / cardWidthMm));
  let rows = Math.max(1, Math.floor(availableHeight / cardHeightMm));

  // Cap columns and rows to practical limits to prevent awkward crowding
  if (cardWidthMm >= 80 && cols > 2) cols = 2;
  if (cardHeightMm >= 85 && rows > 3) rows = 3;

  const totalGridWidth = cols * cardWidthMm;
  const totalGridHeight = rows * cardHeightMm;

  const marginLeftMm = Math.max(0, (paperWidthMm - totalGridWidth) / 2);
  const marginTopMm = Math.max(0, (paperHeightMm - totalGridHeight) / 2);

  return {
    cols,
    rows,
    cardsPerPage: cols * rows,
    marginLeftMm: Math.round(marginLeftMm * 10) / 10,
    marginTopMm: Math.round(marginTopMm * 10) / 10,
    cardWidthMm,
    cardHeightMm,
    paperWidthMm,
    paperHeightMm,
  };
}

export interface SheetLayout {
  paperWidthMm: number;
  paperHeightMm: number;
  cardWidthMm: number;
  cardHeightMm: number;
  cols: number;
  rows: number;
  cardsPerPage: number;
  marginTopMm: number;
  marginLeftMm: number;
  duplexOffsetXmM: number;
  duplexOffsetYmM: number;
  cuttingGuideLengthMm: number;
}

/**
 * Single source of truth for where cards sit on the A4 sheet.
 * Used by the PDF generator AND the on-screen A4 sheet preview, so they always match.
 */
export function computeSheetLayout(template: CardTemplate, settings: PrintSettings): SheetLayout {
  const paperWidthMm = settings.paperWidthMm || 210;
  const paperHeightMm = settings.paperHeightMm || 297;
  const cardWidthMm = settings.cardWidthMm || template.cardWidthMm || 64;
  const cardHeightMm = settings.cardHeightMm || template.cardHeightMm || 92;

  const defaultGrid = calculateA4GridLayout(
    cardWidthMm,
    cardHeightMm,
    paperWidthMm,
    paperHeightMm,
    settings.cardsPerPage
  );
  const cols = defaultGrid.cols;
  const rows = defaultGrid.rows;

  // Clamp margins so no row/column ever overflows off the page
  const maxSafeTopMm = Math.max(0, paperHeightMm - rows * cardHeightMm);
  const maxSafeLeftMm = Math.max(0, paperWidthMm - cols * cardWidthMm);
  const marginTopMm =
    settings.marginTopMm !== undefined && settings.marginTopMm >= 0 && settings.marginTopMm <= maxSafeTopMm
      ? settings.marginTopMm
      : defaultGrid.marginTopMm;
  const marginLeftMm =
    settings.marginLeftMm !== undefined && settings.marginLeftMm >= 0 && settings.marginLeftMm <= maxSafeLeftMm
      ? settings.marginLeftMm
      : defaultGrid.marginLeftMm;

  return {
    paperWidthMm,
    paperHeightMm,
    cardWidthMm,
    cardHeightMm,
    cols,
    rows,
    cardsPerPage: cols * rows,
    marginTopMm,
    marginLeftMm,
    duplexOffsetXmM: settings.duplexOffsetXmM || 0,
    duplexOffsetYmM: settings.duplexOffsetYmM || 0,
    cuttingGuideLengthMm: settings.cuttingGuideLengthMm || 3.5,
  };
}

/** Cards per A4 sheet for the current template + print settings (same as the PDF). */
export function cardsPerSheet(template: CardTemplate, settings: PrintSettings): number {
  return computeSheetLayout(template, {
    ...settings,
    cardWidthMm: template.cardWidthMm,
    cardHeightMm: template.cardHeightMm,
  }).cardsPerPage;
}
