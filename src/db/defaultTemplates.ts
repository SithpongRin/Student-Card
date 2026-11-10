import { CardTemplate } from '../types/template';
import { MOEYS_EMBLEM_DATA_URI, DEFAULT_FLOURISH_DATA_URI } from '../utils/assets';

export const TEMPLATE_1_ID = 'template-reference-moeys-default';
export const TEMPLATE_2_ID = 'template-battambang-bottom-photo';

export const DEFAULT_STUDENT_CARD_RULES: string[] = [
  '១. កាតនេះជាឯកសារផ្លូវការសម្រាប់សម្គាល់ខ្លួនសិស្សក្នុងគ្រឹះស្ថានសិក្សា។',
  '២. សិស្សត្រូវពាក់ ឬយកតាមខ្លួនរាល់ពេលមកសាលារៀន និងពេលប្រឡង។',
  '៣. ហាមកែបន្លំ ផ្ទេរ ឬឱ្យអ្នកដទៃខ្ចីប្រើប្រាស់ជាដាច់ខាត។',
  '៤. ករណីបាត់បង់ ឬខូចខាត ត្រូវរាយការណ៍ជូនការិយាល័យរដ្ឋបាលសាលា។',
  '៥. ករណីរើសបាន សូមប្រគល់ជូនសាលារៀនវិញជាបន្ទាន់។',
];

// TEMPLATE 1: Exact Reproduction of Reference Image 1 (អត្តសញ្ញាណប័ណ្ណសិស្ស - Top-Left Photo)
export const defaultReferenceTemplate: CardTemplate = {
  id: TEMPLATE_1_ID,
  name: 'គំរូទី១ — អត្តសញ្ញាណប័ណ្ណសិស្ស (ថតរូបខាងលើ - កណ្ដាល)',
  variant: 'top-photo',
  isDefault: true,
  isReference: true,

  cardWidthMm: 64,
  cardHeightMm: 92,

  countryHeaderKm1: 'ព្រះរាជាណាចក្រកម្ពុជា',
  countryHeaderKm2: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
  ministryDepartment: 'មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត កណ្ដាល',
  schoolTypeAndName: 'អនុ/វិទ្យាល័យ ...........................................................................',
  schoolNameOnly: 'ដំណាក់ព្រីង',

  cardTitleKm: 'អត្តសញ្ញាណប័ណ្ណសិស្ស',
  cardNumberPrefix: 'លេខៈ',
  academicYearPrefix: 'ឆ្នាំសិក្សា ២០......... - ២០.........',

  photoBoxWidthMm: 30,
  photoBoxHeightMm: 40,
  photoBoxText: '3 x 4',
  photoBoxPosition: 'top-left',

  issueDateLine: 'ថ្ងៃទី.........ខែ.........ឆ្នាំ២០......',
  directorTitle: 'នាយក',
  directorName: 'ជា សារ៉ា',
  signatureTitle: 'ស្នាមមេដៃស្ដាំ',
  studentDeclaration: '',

  primaryColor: '#163d7e', // Official print deep blue
  lineColor: '#163d7e',
  fontHeading: 'Moul',
  fontBody: 'Battambang',
  watermarkOpacity: 0.16,
  showWatermark: true,
  showBackEmblem: true,
  backEmblemSizePercent: 52,
  backLayout: 'rules-and-emblem',
  backSchoolPhone: '', // No phone number
  backRulesText: DEFAULT_STUDENT_CARD_RULES,
  showBackBarcodeOrQr: true,
  borderWidthMm: 0.6,
  innerPaddingMm: 2.8,

  emblemUrl: MOEYS_EMBLEM_DATA_URI,
  flourishUrl: DEFAULT_FLOURISH_DATA_URI,
  updatedAt: Date.now(),
};

// TEMPLATE 2: Exact Reproduction of Reference Image 2 Sheet (ប័ណ្ណសម្គាល់ខ្លួនសិស្ស - Bottom-Left Photo)
export const templateBattambangBottomPhoto: CardTemplate = {
  id: TEMPLATE_2_ID,
  name: 'គំរូទី២ — ប័ណ្ណសម្គាល់ខ្លួនសិស្ស (ថតរូបខាងក្រោម - បាត់ដំបង)',
  variant: 'bottom-photo',
  isDefault: false,
  isReference: false,

  cardWidthMm: 64,
  cardHeightMm: 92,

  countryHeaderKm1: 'ព្រះរាជាណាចក្រកម្ពុជា',
  countryHeaderKm2: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
  ministryDepartment: 'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង',
  schoolTypeAndName: '',
  schoolNameOnly: 'អនុវិទ្យាល័យ ដំណាក់ព្រីង',

  cardTitleKm: 'ប័ណ្ណសម្គាល់ខ្លួនសិស្ស',
  cardNumberPrefix: '',
  academicYearPrefix: 'ឆ្នាំសិក្សា ២០២៤-២០២៥',

  photoBoxWidthMm: 30,
  photoBoxHeightMm: 40,
  photoBoxText: '3 x 4',
  photoBoxPosition: 'bottom-left',

  issueDateLine: 'ធ្វើនៅថ្ងៃទី០១ ខែមករា ឆ្នាំ២០២៥',
  directorTitle: 'នាយកសាលា',
  directorName: 'ជា សារ៉ា',
  signatureTitle: '',
  studentDeclaration: 'ជាសិស្ស អនុវិទ្យាល័យ ដំណាក់ព្រីង',

  primaryColor: '#0f4c81', // Battambang template deep ocean blue
  lineColor: '#0f4c81',
  fontHeading: 'Moul',
  fontBody: 'Battambang',
  watermarkOpacity: 0.18,
  showWatermark: true,
  showBackEmblem: true,
  backEmblemSizePercent: 52,
  backLayout: 'rules-and-emblem',
  backSchoolPhone: '', // No phone number
  backRulesText: DEFAULT_STUDENT_CARD_RULES,
  showBackBarcodeOrQr: true,
  borderWidthMm: 0.6,
  innerPaddingMm: 2.8,

  emblemUrl: MOEYS_EMBLEM_DATA_URI,
  flourishUrl: DEFAULT_FLOURISH_DATA_URI,
  updatedAt: Date.now(),
};

export const PREDEFINED_TEMPLATES: CardTemplate[] = [
  defaultReferenceTemplate,
  templateBattambangBottomPhoto,
];
