import { describe, it, expect } from 'vitest';
import {
  toKhmerNumerals,
  toArabicNumerals,
  formatKhmerCardNumber,
  formatAcademicYearKhmer,
} from '../khmerNumerals';

describe('Khmer Numerals Utility', () => {
  it('converts Arabic numerals to Khmer numerals correctly', () => {
    expect(toKhmerNumerals('2024')).toBe('២០២៤');
    expect(toKhmerNumerals(1234567890)).toBe('១២៣៤៥៦៧៨៩០');
    expect(toKhmerNumerals('10A')).toBe('១០A');
    expect(toKhmerNumerals('១៥/០៤/២០០៨')).toBe('១៥/០៤/២០០៨');
  });

  it('converts Khmer numerals back to Arabic numerals', () => {
    expect(toArabicNumerals('២០២៤')).toBe('2024');
    expect(toArabicNumerals('១០A')).toBe('10A');
  });

  it('formats card numbers with 3 digits leading zeros', () => {
    expect(formatKhmerCardNumber(1)).toBe('០០១');
    expect(formatKhmerCardNumber(15)).toBe('០១៥');
    expect(formatKhmerCardNumber(123)).toBe('១២៣');
  });

  it('formats academic year consistently', () => {
    expect(formatAcademicYearKhmer('2024-2025')).toBe('២០២៤ - ២០២៥');
  });
});
