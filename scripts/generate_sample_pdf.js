import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

async function generateSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load Khmer fonts
  const moulFontBytes = fs.readFileSync('public/fonts/Moul-Regular.ttf');
  const battambangFontBytes = fs.readFileSync('public/fonts/Battambang-Regular.ttf');
  const customMoulFont = await pdfDoc.embedFont(moulFontBytes);
  const customBattambangFont = await pdfDoc.embedFont(battambangFontBytes);

  // A4 dimensions in pt: 210mm x 297mm
  const MM_TO_PT = 72 / 25.4;
  const paperWidthPt = 210 * MM_TO_PT; // ~595.28 pt
  const paperHeightPt = 297 * MM_TO_PT; // ~841.89 pt

  // Card dimensions: 64mm x 92mm
  const cardWidthPt = 64 * MM_TO_PT; // ~181.42 pt
  const cardHeightPt = 92 * MM_TO_PT; // ~260.79 pt

  const cols = 3;
  const rows = 3;

  const marginLeftPt = (paperWidthPt - cols * cardWidthPt) / 2; // ~25.5 pt (9mm)
  const marginTopPt = (paperHeightPt - rows * cardHeightPt) / 2; // ~29.7 pt (10.5mm)

  const blueColor = rgb(22 / 255, 61 / 255, 126 / 255); // #163d7e

  // Sample student data
  const sampleStudents = [
    { id: 'KDL-2024-001', nameKm: 'សុខ សុវណ្ណារ៉ា', gender: 'ប្រុស', dob: '១៥/០៤/២០០៨', class: '១០A' },
    { id: 'KDL-2024-002', nameKm: 'ចាន់ ស្រីនិច', gender: 'ស្រី', dob: '២០/០៨/២០០៨', class: '១០A' },
    { id: 'KDL-2024-003', nameKm: 'ហេង ពិសិដ្ឋ', gender: 'ប្រុស', dob: '០៣/១២/២០០៧', class: '១១B' },
    { id: 'KDL-2024-004', nameKm: 'កែវ ធីតា', gender: 'ស្រី', dob: '០៨/០២/២០០៨', class: '១០A' },
    { id: 'KDL-2024-005', nameKm: 'លី រតនៈ', gender: 'ប្រុស', dob: '២៧/០៦/២០០៨', class: '១០B' },
    { id: 'KDL-2024-006', nameKm: 'ព្រំ សុជាតា', gender: 'ស្រី', dob: '១៤/០៩/២០០៨', class: '១០B' },
    { id: 'KDL-2024-007', nameKm: 'តាំង គឹមហុង', gender: 'ប្រុស', dob: '១១/១១/២០០៧', class: '១១B' },
    { id: 'KDL-2024-008', nameKm: 'អ៊ុក ដានី', gender: 'ស្រី', dob: '២២/០១/២០០៨', class: '១០A' },
    { id: 'KDL-2024-009', nameKm: 'វ៉ាន់ វឌ្ឍនៈ', gender: 'ប្រុស', dob: '០៥/០៣/២០០៨', class: '១០A' },
  ];

  // PAGE 1: FRONT SIDE (3x3 Grid of 9 Cards)
  const page1 = pdfDoc.addPage([paperWidthPt, paperHeightPt]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const s = sampleStudents[idx];

      const x = marginLeftPt + c * cardWidthPt;
      const y = paperHeightPt - marginTopPt - (r + 1) * cardHeightPt;

      // Card outer border
      const pad = 8;
      page1.drawRectangle({
        x: x + pad,
        y: y + pad,
        width: cardWidthPt - 2 * pad,
        height: cardHeightPt - 2 * pad,
        borderColor: blueColor,
        borderWidth: 1.2,
      });

      // Photo Box (approx 3x4)
      const photoW = 44;
      const photoH = 58;
      const photoX = x + pad + 6;
      const photoY = y + cardHeightPt - pad - 68 - photoH;
      page1.drawRectangle({
        x: photoX,
        y: photoY,
        width: photoW,
        height: photoH,
        borderColor: blueColor,
        borderWidth: 0.8,
      });

      // "3 x 4" text inside photo box
      page1.drawText('3 x 4', {
        x: photoX + 13,
        y: photoY + 24,
        size: 8,
        color: blueColor,
      });

      // Heading 1: ព្រះរាជាណាចក្រកម្ពុជា
      page1.drawText('ព្រះរាជាណាចក្រកម្ពុជា', {
        x: x + cardWidthPt / 2 - 38,
        y: y + cardHeightPt - pad - 12,
        font: customMoulFont,
        size: 6.5,
        color: blueColor,
      });

      // Heading 2: ជាតិ សាសនា ព្រះមហាក្សត្រ
      page1.drawText('ជាតិ សាសនា ព្រះមហាក្សត្រ', {
        x: x + cardWidthPt / 2 - 36,
        y: y + cardHeightPt - pad - 21,
        font: customMoulFont,
        size: 5.8,
        color: blueColor,
      });

      // Title: អត្តសញ្ញាណប័ណ្ណសិស្ស
      page1.drawText('អត្តសញ្ញាណប័ណ្ណសិស្ស', {
        x: x + cardWidthPt / 2 - 35,
        y: y + cardHeightPt - pad - 46,
        font: customMoulFont,
        size: 7.5,
        color: blueColor,
      });

      // Student name
      page1.drawText(`គោត្តនាម-នាមៈ ${s.nameKm}`, {
        x: photoX + photoW + 6,
        y: photoY + photoH - 12,
        font: customBattambangFont,
        size: 6,
        color: blueColor,
      });

      // Gender & Class
      page1.drawText(`ភេទ: ${s.gender}  ថ្នាក់ទី: ${s.class}`, {
        x: photoX + photoW + 6,
        y: photoY + photoH - 26,
        font: customBattambangFont,
        size: 5.5,
        color: blueColor,
      });

      // Student ID
      page1.drawText(`អត្តលេខៈ ${s.id}`, {
        x: photoX + photoW + 6,
        y: photoY + photoH - 40,
        font: customBattambangFont,
        size: 5.5,
        color: blueColor,
      });

      // DOB
      page1.drawText(`ថ្ងៃខែឆ្នាំកំណើតៈ ${s.dob}`, {
        x: photoX,
        y: photoY - 12,
        font: customBattambangFont,
        size: 5.5,
        color: blueColor,
      });

      // Signatures
      page1.drawText('នាយក', {
        x: x + pad + 32,
        y: y + pad + 8,
        font: customBattambangFont,
        size: 6.5,
        color: blueColor,
      });

      page1.drawText('ហត្ថលេខាសាមីខ្លួន', {
        x: x + cardWidthPt - pad - 50,
        y: y + pad + 14,
        font: customBattambangFont,
        size: 5.5,
        color: blueColor,
      });
    }
  }

  // PAGE 2: BACK SIDE (Duplex Mirrored)
  const page2 = pdfDoc.addPage([paperWidthPt, paperHeightPt]);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const mirroredCol = cols - 1 - c;
      const x = marginLeftPt + mirroredCol * cardWidthPt;
      const y = paperHeightPt - marginTopPt - (r + 1) * cardHeightPt;

      // Plain white card with centered emblem placeholder
      page2.drawText('ក្រសួងអប់រំ យុវជន និងកីឡា', {
        x: x + cardWidthPt / 2 - 34,
        y: y + cardHeightPt / 2 - 25,
        font: customMoulFont,
        size: 6,
        color: blueColor,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = 'output/Sample_A4_9Cards_PrintReady.pdf';
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Test PDF created successfully at: ${outputPath} (size: ${pdfBytes.length} bytes)`);
}

generateSamplePdf().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
