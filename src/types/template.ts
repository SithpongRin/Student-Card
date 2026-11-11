export type TemplateVariant = 'top-photo' | 'bottom-photo';

export interface CardTemplate {
  id: string;
  name: string;
  variant: TemplateVariant; // 'top-photo' (Reference 1) | 'bottom-photo' (Reference 2 / Battambang)
  isDefault: boolean;
  isReference: boolean;

  // Card Physical Dimensions in mm (64mm x 92mm to fit 9 on A4 page)
  cardWidthMm: number;
  cardHeightMm: number;

  // Institutional Header
  countryHeaderKm1: string; // ព្រះរាជាណាចក្រកម្ពុជា
  countryHeaderKm2: string; // ជាតិ សាសនា ព្រះមហាក្សត្រ
  ministryDepartment: string; // មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត...
  schoolTypeAndName: string; // អនុ/វិទ្យាល័យ...
  schoolNameOnly?: string; // e.g. "វិទ្យាល័យ អន្លង់វិល"

  // Card Title & Sub-header
  cardTitleKm: string; // អត្តសញ្ញាណប័ណ្ណសិស្ស or ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
  cardNumberPrefix: string; // លេខៈ
  academicYearPrefix: string; // ឆ្នាំសិក្សា ២០

  // Photo Box (approx 3cm x 4cm)
  photoBoxWidthMm: number;
  photoBoxHeightMm: number;
  photoBoxText: string; // "3 x 4"
  photoBoxPosition: 'top-left' | 'bottom-left';

  // Exact-size mode: when whiteMarginMm is set, the blue frame measures exactly
  // (cardWidthMm - 2*whiteMarginMm) x (cardHeightMm - 2*whiteMarginMm), i.e. the
  // white edge is NOT counted in the frame size.
  whiteMarginMm?: number;
  // When true, the photo box is drawn at exactly photoBoxWidthMm x photoBoxHeightMm.
  useExactPhotoSize?: boolean;

  // Signatures and Dates
  issueDateLine: string; // ថ្ងៃទី.........ខែ.........ឆ្នាំ២០...... or ធ្វើនៅថ្ងៃទី០១ ខែមករា ឆ្នាំ២០២២
  directorTitle: string; // នាយក or នាយកសាលា
  directorName?: string; // e.g. "ជា សារ៉ា"
  showDirectorName?: boolean; // default false: director name is NOT printed on the card
  signatureTitle: string; // ហត្ថលេខាសាមីខ្លួន
  studentDeclaration?: string; // ជាសិស្ស វិទ្យាល័យ... (for bottom-photo template)

  // Styling & Typography
  primaryColor: string; // #163d7e (Official print blue)
  lineColor: string;
  fontHeading: string; // 'Moul'
  fontBody: string; // 'Battambang'
  watermarkOpacity: number; // 0.16
  showWatermark: boolean;
  showBackEmblem: boolean;
  backEmblemSizePercent: number; // 52%
  backLayout?: 'emblem-only' | 'rules-and-emblem' | 'modern-qr';
  backSchoolPhone?: string;
  backSchoolAddress?: string;
  backRulesText?: string[];
  showBackBarcodeOrQr?: boolean;
  borderWidthMm: number;
  innerPaddingMm: number;

  emblemUrl: string; // '/images/moeys_emblem.svg'
  flourishUrl?: string; // '/images/flourishes/flourish_1_blue.png'
  updatedAt: number;
}
