import ExcelJS from 'exceljs';
import { Student } from '../types/student';

export interface ColumnMapping {
  studentId: string;
  nameKm: string;
  nameEn: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  class: string;
  academicYear: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  address: string;
  phone: string;
  cardNumber: string;
}

export interface ParsedWorksheet {
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ParsedWorkbook {
  sheets: ParsedWorksheet[];
}

export interface ImportValidationResult {
  validRecords: Omit<Student, 'id'>[];
  invalidRecords: { row: number; errors: string[]; data: any }[];
  duplicateIds: string[];
  missingFieldsCount: Record<string, number>;
}

/**
 * Reads an uploaded file (.xlsx, .xls, .csv) and returns worksheet data
 */
export async function parseExcelFile(file: File): Promise<ParsedWorkbook> {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();

  if (file.name.endsWith('.csv')) {
    // For CSV files
    const text = new TextDecoder('utf-8').decode(buffer);
    const rows = parseCSVText(text);
    if (rows.length === 0) return { sheets: [] };
    const headers = rows[0];
    const dataRows = rows.slice(1).map((r) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        obj[h] = r[i] || '';
      });
      return obj;
    });
    return {
      sheets: [
        {
          sheetName: 'Sheet1',
          headers,
          rows: dataRows,
          totalRows: dataRows.length,
        },
      ],
    };
  }

  await workbook.xlsx.load(buffer);

  const sheets: ParsedWorksheet[] = [];

  workbook.eachSheet((worksheet) => {
    const headers: string[] = [];
    const rows: Record<string, any>[] = [];

    // Find header row (usually row 1)
    const firstRow = worksheet.getRow(1);
    firstRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const val = cell.value ? String(cell.value).trim() : `Column_${colNumber}`;
      headers.push(val);
    });

    // Read subsequent rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const rowData: Record<string, any> = {};
      let hasData = false;

      headers.forEach((header, idx) => {
        const cell = row.getCell(idx + 1);
        let cellVal = cell.value;

        // Handle formula or rich text
        if (cellVal && typeof cellVal === 'object') {
          if ('result' in cellVal) {
            cellVal = cellVal.result;
          } else if ('richText' in cellVal) {
            cellVal = (cellVal as any).richText.map((t: any) => t.text).join('');
          } else if (cellVal instanceof Date) {
            cellVal = cellVal.toLocaleDateString('km-KH');
          }
        }

        const strVal = cellVal !== undefined && cellVal !== null ? String(cellVal).trim() : '';
        rowData[header] = strVal;
        if (strVal) hasData = true;
      });

      if (hasData) {
        rows.push(rowData);
      }
    });

    sheets.push({
      sheetName: worksheet.name,
      headers,
      rows,
      totalRows: rows.length,
    });
  });

  return { sheets };
}

/**
 * Basic CSV parser supporting quotes and commas
 */
function parseCSVText(text: string): string[][] {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const values: string[] = [];
    let match;
    while ((match = regex.exec(line))) {
      let val = match[1];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      values.push(val.trim());
      if (regex.lastIndex >= line.length) break;
    }
    return values;
  });
}

/**
 * Suggests default auto-mapping from Khmer/English header names to student fields
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const findMatch = (patterns: string[]): string => {
    for (const h of headers) {
      const lower = h.toLowerCase().trim();
      for (const p of patterns) {
        if (lower.includes(p.toLowerCase())) return h;
      }
    }
    return '';
  };

  return {
    studentId: findMatch(['អត្តលេខ', 'លេខសម្គាល់', 'student id', 'id', 'code', 'sid']),
    nameKm: findMatch(['គោត្តនាម', 'នាម', 'ឈ្មោះខ្មែរ', 'ឈ្មោះ', 'name (khmer)', 'khmer name', 'fullname']),
    nameEn: findMatch(['អង់គ្លេស', 'latin', 'english name', 'name (en)', 'name']),
    gender: findMatch(['ភេទ', 'gender', 'sex']),
    dateOfBirth: findMatch(['កំណើត', 'ថ្ងៃខែឆ្នាំកំណើត', 'dob', 'date of birth', 'birth']),
    placeOfBirth: findMatch(['ទីកន្លែងកំណើត', 'កន្លែងកើត', 'pob', 'place of birth']),
    class: findMatch(['ថ្នាក់', 'ថ្នាក់ទី', 'class', 'grade']),
    academicYear: findMatch(['ឆ្នាំសិក្សា', 'academic year', 'year']),
    fatherName: findMatch(['ឪពុកឈ្មោះ', 'ឪពុក', 'father']),
    fatherOccupation: findMatch(['មុខរបរឪពុក', 'មុខរបរ', 'father job', 'father occupation']),
    motherName: findMatch(['ម្តាយឈ្មោះ', 'ម្ដាយឈ្មោះ', 'ម្តាយ', 'ម្ដាយ', 'mother']),
    motherOccupation: findMatch(['មុខរបរម្តាយ', 'មុខរបរម្ដាយ', 'mother job', 'mother occupation']),
    address: findMatch(['ទីលំនៅបច្ចុប្បន្ន', 'អាសយដ្ឋាន', 'ទីលំនៅ', 'address']),
    phone: findMatch(['លេខទូរស័ព្ទ', 'លេខទូរសព្ទ', 'ទូរស័ព្ទ', 'ទូរសព្ទ', 'phone', 'tel', 'mobile']),
    cardNumber: findMatch(['លេខកាត', 'ល.រ', 'លរ', 'card no', 'card number', 'no']),
  };
}

/**
 * Validates mapped rows into Student records
 */
export function validateAndMapRecords(
  rows: Record<string, any>[],
  mapping: ColumnMapping,
  existingIds: Set<string>
): ImportValidationResult {
  const validRecords: Omit<Student, 'id'>[] = [];
  const invalidRecords: { row: number; errors: string[]; data: any }[] = [];
  const duplicateIds: string[] = [];
  const seenIds = new Set<string>();

  const missingFieldsCount: Record<string, number> = {
    nameKm: 0,
    gender: 0,
    dateOfBirth: 0,
    class: 0,
    fatherName: 0,
    motherName: 0,
    address: 0,
  };

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-based, +1 for header
    const errors: string[] = [];

    // Extract values
    const rawId = mapping.studentId ? String(row[mapping.studentId] || '').trim() : '';
    const studentId = rawId || `AUTO-${String(idx + 1).padStart(4, '0')}`;
    const nameKm = mapping.nameKm ? String(row[mapping.nameKm] || '').trim() : '';
    const nameEn = mapping.nameEn ? String(row[mapping.nameEn] || '').trim() : '';
    const gender = mapping.gender ? String(row[mapping.gender] || '').trim() : 'ប្រុស';
    const dateOfBirth = mapping.dateOfBirth ? String(row[mapping.dateOfBirth] || '').trim() : '';
    const placeOfBirth = mapping.placeOfBirth ? String(row[mapping.placeOfBirth] || '').trim() : '';
    const studentClass = mapping.class ? String(row[mapping.class] || '').trim() : 'ទូទៅ';
    const academicYear = mapping.academicYear ? String(row[mapping.academicYear] || '').trim() : '២០២៤ - ២០២៥';
    const fatherName = mapping.fatherName ? String(row[mapping.fatherName] || '').trim() : '';
    const fatherOccupation = mapping.fatherOccupation ? String(row[mapping.fatherOccupation] || '').trim() : '';
    const motherName = mapping.motherName ? String(row[mapping.motherName] || '').trim() : '';
    const motherOccupation = mapping.motherOccupation ? String(row[mapping.motherOccupation] || '').trim() : '';
    const address = mapping.address ? String(row[mapping.address] || '').trim() : '';
    const phone = mapping.phone ? String(row[mapping.phone] || '').trim() : '';
    const cardNumber = mapping.cardNumber ? String(row[mapping.cardNumber] || '').trim() : '';

    // Validation rules
    if (!nameKm) {
      errors.push('ខ្វះឈ្មោះសិស្ស (Missing Khmer Name)');
      missingFieldsCount.nameKm++;
    }

    if (existingIds.has(studentId) || seenIds.has(studentId)) {
      duplicateIds.push(studentId);
      errors.push(`អត្តលេខស្ទួន (${studentId})`);
    } else {
      seenIds.add(studentId);
    }

    if (!gender) missingFieldsCount.gender++;
    if (!dateOfBirth) missingFieldsCount.dateOfBirth++;
    if (!studentClass) missingFieldsCount.class++;
    if (!fatherName) missingFieldsCount.fatherName++;
    if (!motherName) missingFieldsCount.motherName++;
    if (!address) missingFieldsCount.address++;

    if (errors.length > 0) {
      invalidRecords.push({ row: rowNum, errors, data: row });
    } else {
      validRecords.push({
        studentId,
        cardNumber,
        nameKm,
        nameEn,
        gender: gender || 'ប្រុស',
        nationality: 'ខ្មែរ',
        dateOfBirth,
        placeOfBirth,
        class: studentClass,
        academicYear,
        fatherName,
        fatherOccupation,
        motherName,
        motherOccupation,
        address,
        phone,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  });

  return {
    validRecords,
    invalidRecords,
    duplicateIds: Array.from(new Set(duplicateIds)),
    missingFieldsCount,
  };
}

/**
 * Generates and downloads a clean sample Excel template for users
 */
export async function downloadExcelSampleTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Card សិស្ស';
  const sheet = workbook.addWorksheet('បញ្ជីឈ្មោះសិស្ស');

  sheet.columns = [
    { header: 'អត្តលេខ', key: 'studentId', width: 16 },
    { header: 'គោត្តនាម និងនាម', key: 'nameKm', width: 22 },
    { header: 'ឈ្មោះឡាតាំង', key: 'nameEn', width: 20 },
    { header: 'ភេទ', key: 'gender', width: 10 },
    { header: 'ថ្ងៃខែឆ្នាំកំណើត', key: 'dateOfBirth', width: 18 },
    { header: 'ទីកន្លែងកំណើត', key: 'placeOfBirth', width: 30 },
    { header: 'ថ្នាក់ទី', key: 'class', width: 12 },
    { header: 'ឆ្នាំសិក្សា', key: 'academicYear', width: 16 },
    { header: 'ឪពុកឈ្មោះ', key: 'fatherName', width: 20 },
    { header: 'មុខរបរឪពុក', key: 'fatherOccupation', width: 16 },
    { header: 'ម្តាយឈ្មោះ', key: 'motherName', width: 20 },
    { header: 'មុខរបរម្តាយ', key: 'motherOccupation', width: 16 },
    { header: 'ទីលំនៅបច្ចុប្បន្ន', key: 'address', width: 30 },
    { header: 'លេខទូរស័ព្ទ', key: 'phone', width: 16 },
    { header: 'លេខកាត', key: 'cardNumber', width: 12 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Battambang', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF163D7E' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 28;

  // Add sample rows
  sheet.addRow({
    studentId: 'KDL-2024-001',
    nameKm: 'សុខ សុវណ្ណារ៉ា',
    nameEn: 'SOKH SOVANNARA',
    gender: 'ប្រុស',
    dateOfBirth: '១៥/០៤/២០០៨',
    placeOfBirth: 'ឃុំព្រែកតាពៅ ស្រុកកៀនស្វាយ ខេត្តកណ្ដាល',
    class: '១០A',
    academicYear: '២០២៤ - ២០២៥',
    fatherName: 'សុខ ចាន់ថន',
    fatherOccupation: 'កសិករ',
    motherName: 'មាស សុខា',
    motherOccupation: 'មេផ្ទះ',
    address: 'ភូមិស្វាយ ឃុំកៀនស្វាយ ខេត្តកណ្ដាល',
    phone: '012 889 900',
    cardNumber: '០០១',
  });

  sheet.addRow({
    studentId: 'KDL-2024-002',
    nameKm: 'ចាន់ ស្រីនិច',
    nameEn: 'CHAN SREYNICH',
    gender: 'ស្រី',
    dateOfBirth: '២០/០៨/២០០៨',
    placeOfBirth: 'សង្កាត់តាខ្មៅ ក្រុងតាខ្មៅ ខេត្តកណ្ដាល',
    class: '១០A',
    academicYear: '២០២៤ - ២០២៥',
    fatherName: 'ចាន់ វិបុល',
    fatherOccupation: 'គ្រូបង្រៀន',
    motherName: 'កែវ សុគន្ធា',
    motherOccupation: 'អាជីវករ',
    address: 'សង្កាត់តាខ្មៅ ក្រុងតាខ្មៅ ខេត្តកណ្ដាល',
    phone: '098 776 655',
    cardNumber: '០០២',
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'គំរូតារាងទិន្នន័យសិស្ស_Card_Siss.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
