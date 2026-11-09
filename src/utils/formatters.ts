import { Student } from '../types/student';
import { toKhmerNumerals, toArabicNumerals } from './khmerNumerals';

/**
 * Replaces dynamic placeholders in templates with student record values.
 * Gracefully omits empty or undefined values without displaying "undefined" or "null".
 */
export function interpolateStudentFields(templateStr: string, student?: Partial<Student>): string {
  if (!templateStr) return '';
  if (!student) return templateStr;

  const replacements: Record<string, string> = {
    '{{student.studentId}}': student.studentId || '',
    '{{student.cardNumber}}': student.cardNumber ? toKhmerNumerals(student.cardNumber) : (student.studentId || ''),
    '{{student.nameKm}}': student.nameKm || '',
    '{{student.nameEn}}': student.nameEn || '',
    '{{student.gender}}': student.gender || '',
    '{{student.nationality}}': student.nationality || 'ខ្មែរ',
    '{{student.dateOfBirth}}': student.dateOfBirth ? toArabicNumerals(student.dateOfBirth) : '',
    '{{student.placeOfBirth}}': student.placeOfBirth || '',
    '{{student.class}}': student.class ? toArabicNumerals(student.class) : '',
    '{{student.academicYear}}': student.academicYear ? toKhmerNumerals(student.academicYear) : '',
    '{{student.phone}}': student.phone || '',
    '{{student.address}}': student.address || '',
    '{{student.fatherName}}': student.fatherName || '',
    '{{student.fatherOccupation}}': student.fatherOccupation || '',
    '{{student.motherName}}': student.motherName || '',
    '{{student.motherOccupation}}': student.motherOccupation || '',
  };

  let result = templateStr;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replaceAll(placeholder, value);
  }

  return result;
}

/**
 * Formats file size in bytes to human-readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a timestamp into a clean localized Khmer/English date time
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('km-KH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
