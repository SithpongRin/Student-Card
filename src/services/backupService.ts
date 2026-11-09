import JSZip from 'jszip';
import { db } from '../db/database';
import { Student } from '../types/student';
import { CardTemplate } from '../types/template';

export interface StorageEstimate {
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
}

/**
 * Creates and downloads a complete offline ZIP backup of StudentCardDB
 */
export async function createFullBackupZip(): Promise<{ fileName: string; sizeBytes: number }> {
  const zip = new JSZip();

  // 1. Fetch all tables from IndexedDB
  const students = await db.students.toArray();
  const classes = await db.classes.toArray();
  const templates = await db.templates.toArray();
  const settings = await db.settings.toArray();
  const importHistory = await db.importHistory.toArray();

  const backupMeta = {
    appName: 'Card សិស្ស',
    version: '1.0.0',
    createdAt: Date.now(),
    studentCount: students.length,
    templateCount: templates.length,
  };

  // Add files to ZIP
  zip.file('metadata.json', JSON.stringify(backupMeta, null, 2));
  zip.file('students.json', JSON.stringify(students, null, 2));
  zip.file('classes.json', JSON.stringify(classes, null, 2));
  zip.file('templates.json', JSON.stringify(templates, null, 2));
  zip.file('settings.json', JSON.stringify(settings, null, 2));
  zip.file('importHistory.json', JSON.stringify(importHistory, null, 2));

  const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Card_Siss_Backup_${dateStr}.zip`;

  // Download
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  // Log in backupHistory
  await db.backupHistory.add({
    fileName,
    recordCount: students.length,
    sizeBytes: content.size,
    createdAt: Date.now(),
  });

  return { fileName, sizeBytes: content.size };
}

/**
 * Validates and restores a backup ZIP file into IndexedDB
 */
export async function restoreFromBackupZip(file: File): Promise<{
  studentCount: number;
  templateCount: number;
}> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const metaFile = loadedZip.file('metadata.json');
  if (!metaFile) {
    throw new Error('ឯកសារ Backup មិនត្រឹមត្រូវ (Missing metadata.json)');
  }

  // Read students
  const studentsFile = loadedZip.file('students.json');
  let students: Student[] = [];
  if (studentsFile) {
    const text = await studentsFile.async('string');
    students = JSON.parse(text);
  }

  // Read templates
  const templatesFile = loadedZip.file('templates.json');
  let templates: CardTemplate[] = [];
  if (templatesFile) {
    const text = await templatesFile.async('string');
    templates = JSON.parse(text);
  }

  // Read classes
  const classesFile = loadedZip.file('classes.json');
  let classes: any[] = [];
  if (classesFile) {
    const text = await classesFile.async('string');
    classes = JSON.parse(text);
  }

  // Perform transactional atomic restore
  await db.transaction('rw', [db.students, db.templates, db.classes], async () => {
    // Clear and restore students
    await db.students.clear();
    for (const s of students) {
      delete s.id; // allow new auto-increment id
      await db.students.add(s);
    }

    // Restore templates
    if (templates.length > 0) {
      await db.templates.clear();
      for (const t of templates) {
        await db.templates.put(t);
      }
    }

    // Restore classes
    if (classes.length > 0) {
      await db.classes.clear();
      for (const c of classes) {
        delete c.id;
        await db.classes.add(c);
      }
    }
  });

  return {
    studentCount: students.length,
    templateCount: templates.length,
  };
}

/**
 * Queries IndexedDB storage usage estimate
 */
export async function getStorageEstimate(): Promise<StorageEstimate> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    const usage = est.usage || 0;
    const quota = est.quota || 1024 * 1024 * 1024; // fallback 1GB
    return {
      usageBytes: usage,
      quotaBytes: quota,
      percentUsed: Math.min(100, Math.round((usage / quota) * 100)),
    };
  }
  return { usageBytes: 0, quotaBytes: 1024 * 1024 * 500, percentUsed: 0 };
}
