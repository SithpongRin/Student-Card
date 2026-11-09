const KHMER_DIGITS: Record<string, string> = {
  '0': '០',
  '1': '១',
  '2': '២',
  '3': '៣',
  '4': '៤',
  '5': '៥',
  '6': '៦',
  '7': '៧',
  '8': '៨',
  '9': '៩',
};

const ARABIC_DIGITS: Record<string, string> = {
  '០': '0',
  '១': '1',
  '២': '2',
  '៣': '3',
  '៤': '4',
  '៥': '5',
  '៦': '6',
  '៧': '7',
  '៨': '8',
  '៩': '9',
};

/**
 * Converts any Arabic numerals in a string to Khmer numerals
 * Example: "2024" -> "២០២៤"
 */
export function toKhmerNumerals(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (match) => KHMER_DIGITS[match] || match);
}

/**
 * Converts any Khmer numerals in a string to Arabic numerals
 * Example: "២០២៤" -> "2024"
 */
export function toArabicNumerals(input: string | undefined | null): string {
  if (!input) return '';
  return input.replace(/[០-៩]/g, (match) => ARABIC_DIGITS[match] || match);
}

/**
 * Formats a 3-digit card number with leading zeros in Khmer
 * Example: 1 -> "០០១", 12 -> "០១២"
 */
export function formatKhmerCardNumber(num: number | string): string {
  const arabicStr = String(num).padStart(3, '0');
  return toKhmerNumerals(arabicStr);
}

/**
 * Formats Academic Year consistently
 * Example: "2024-2025" -> "២០២៤ - ២០២៥"
 */
export function formatAcademicYearKhmer(yearStr: string): string {
  if (!yearStr) return '២០២៤ - ២០២៥';
  return toKhmerNumerals(yearStr.replace(/\s*-\s*/, ' - '));
}
