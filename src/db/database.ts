import Dexie, { type EntityTable } from 'dexie';
import { Student } from '../types/student';
import { CardTemplate } from '../types/template';
import {
  defaultReferenceTemplate,
  templateBattambangBottomPhoto,
  TEMPLATE_1_ID,
  TEMPLATE_2_ID,
} from './defaultTemplates';
import { initialSeedStudents } from './seedData';
import { PrintSettings } from '../types/print';
import {
  MOEYS_EMBLEM_DATA_URI,
  DEFAULT_FLOURISH_DATA_URI,
  resolveFlourishUrl,
} from '../utils/assets';

export interface SchoolClass {
  id?: number;
  name: string;
  academicYear: string;
  studentCount?: number;
}

export interface AppSetting {
  key: string;
  value: any;
}

export interface ImportLog {
  id?: number;
  fileName: string;
  totalRecords: number;
  successCount: number;
  skippedCount: number;
  importedAt: number;
}

export interface GenerationLog {
  id?: number;
  batchName: string;
  studentCount: number;
  mode: string;
  generatedAt: number;
}

export interface BackupLog {
  id?: number;
  fileName: string;
  recordCount: number;
  sizeBytes: number;
  createdAt: number;
}

export class StudentCardDatabase extends Dexie {
  students!: EntityTable<Student, 'id'>;
  classes!: EntityTable<SchoolClass, 'id'>;
  templates!: EntityTable<CardTemplate, 'id'>;
  settings!: EntityTable<AppSetting, 'key'>;
  importHistory!: EntityTable<ImportLog, 'id'>;
  generationHistory!: EntityTable<GenerationLog, 'id'>;
  backupHistory!: EntityTable<BackupLog, 'id'>;

  constructor() {
    super('StudentCardDB');
    this.version(1).stores({
      students: '++id, &studentId, nameKm, class, academicYear, gender, createdAt',
      classes: '++id, &name, academicYear',
      templates: '&id, name, isDefault, isReference, updatedAt',
      settings: '&key',
      importHistory: '++id, fileName, importedAt',
      generationHistory: '++id, batchName, generatedAt',
      backupHistory: '++id, fileName, createdAt',
    });
  }
}

export const db = new StudentCardDatabase();

export const defaultPrintSettings: PrintSettings = {
  paperSize: 'A4',
  paperWidthMm: 210,
  paperHeightMm: 297,
  gridColumns: 2,
  gridRows: 2,
  cardsPerPage: 4,
  cardWidthMm: 81, // 75 mm frame + 2 × 3 mm white edge
  cardHeightMm: 116, // 110 mm frame + 2 × 3 mm white edge
  marginTopMm: 32.5,
  marginLeftMm: 24,
  gutterXmM: 0,
  gutterYmM: 0,
  duplexOffsetXmM: 0,
  duplexOffsetYmM: 0,
  showCuttingGuides: true,
  cuttingGuideColor: '#94a3b8',
  cuttingGuideLengthMm: 3.5,
  renderDpi: 300,
};

export async function initializeDatabase() {
  try {
    // 1. Ensure predefined templates exist and carry default school & director names
    const existingRef1 = await db.templates.get(TEMPLATE_1_ID);
    if (!existingRef1) {
      await db.templates.put(defaultReferenceTemplate);
    } else {
      await db.templates.update(TEMPLATE_1_ID, {
        schoolNameOnly: existingRef1.schoolNameOnly || defaultReferenceTemplate.schoolNameOnly,
        directorName: existingRef1.directorName || defaultReferenceTemplate.directorName,
        flourishUrl: resolveFlourishUrl(existingRef1.flourishUrl),
        emblemUrl: MOEYS_EMBLEM_DATA_URI,
        ...(existingRef1.useExactPhotoSize ? {} : { photoBoxWidthMm: 30, photoBoxHeightMm: 40 }),
      });
    }

    const existingRef2 = await db.templates.get(TEMPLATE_2_ID);
    if (!existingRef2) {
      await db.templates.put(templateBattambangBottomPhoto);
    } else {
      await db.templates.update(TEMPLATE_2_ID, {
        schoolNameOnly: existingRef2.schoolNameOnly || templateBattambangBottomPhoto.schoolNameOnly,
        directorName: existingRef2.directorName || templateBattambangBottomPhoto.directorName,
        flourishUrl: resolveFlourishUrl(existingRef2.flourishUrl),
        emblemUrl: MOEYS_EMBLEM_DATA_URI,
        studentDeclaration: existingRef2.studentDeclaration || templateBattambangBottomPhoto.studentDeclaration,
        ...(existingRef2.useExactPhotoSize ? {} : { photoBoxWidthMm: 30, photoBoxHeightMm: 40 }),
      });
    }

    // 2. Ensure print settings exist
    const existingPrintSettings = await db.settings.get('printSettings');
    if (!existingPrintSettings) {
      await db.settings.put({ key: 'printSettings', value: defaultPrintSettings });
    }

    // 3. Database starts clean without seeding dummy student data.
    // Users can import real data from Excel or click "បញ្ចូលទិន្នន័យគំរូ" when testing.
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
