import { describe, it, expect } from 'vitest';
import { interpolateStudentFields, formatBytes } from '../formatters';
import { Student } from '../../types/student';

describe('Formatters and Interpolation', () => {
  const mockStudent: Student = {
    studentId: 'KDL-2024-001',
    nameKm: 'សុខ សុវណ្ណារ៉ា',
    nameEn: 'SOKH SOVANNARA',
    gender: 'ប្រុស',
    nationality: 'ខ្មែរ',
    dateOfBirth: '15/04/2008',
    placeOfBirth: 'ឃុំព្រែកតាពៅ ស្រុកកៀនស្វាយ ខេត្តកណ្ដាល',
    class: '10A',
    academicYear: '2024 - 2025',
    fatherName: 'សុខ ចាន់ថន',
    fatherOccupation: 'កសិករ',
    motherName: 'មាស សុខា',
    motherOccupation: 'មេផ្ទះ',
    address: 'ភូមិស្វាយ ឃុំកៀនស្វាយ ខេត្តកណ្ដាល',
    phone: '012 889 900',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('replaces all placeholders with student values', () => {
    const template = 'សិស្ស {{student.nameKm}} អត្តលេខ {{student.studentId}} ថ្នាក់ {{student.class}}';
    const result = interpolateStudentFields(template, mockStudent);
    expect(result).toBe('សិស្ស សុខ សុវណ្ណារ៉ា អត្តលេខ KDL-2024-001 ថ្នាក់ 10A');
  });

  it('handles missing or undefined optional fields gracefully without displaying "undefined"', () => {
    const partialStudent: Partial<Student> = {
      nameKm: 'ចាន់ ស្រីនិច',
      studentId: 'KDL-002',
    };
    const template = 'ឈ្មោះ: {{student.nameKm}} | ឪពុក: {{student.fatherName}} | ទូរស័ព្ទ: {{student.phone}}';
    const result = interpolateStudentFields(template, partialStudent);
    expect(result).toBe('ឈ្មោះ: ចាន់ ស្រីនិច | ឪពុក:  | ទូរស័ព្ទ: ');
    expect(result).not.toContain('undefined');
    expect(result).not.toContain('null');
  });

  it('formats byte sizes cleanly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
  });
});
