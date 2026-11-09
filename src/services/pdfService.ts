import { PDFDocument, rgb } from 'pdf-lib';
import { Student } from '../types/student';
import { CardTemplate } from '../types/template';
import { PrintSettings, PrintMode } from '../types/print';
import { renderFrontCardToCanvas, renderBackCardToCanvas } from './CardCanvasRenderer';
import { calculateA4GridLayout } from '../utils/cardSizes';

const MM_TO_PT = 72 / 25.4; // ~2.83465 pt/mm

export interface PdfGenerationProgress {
  totalCards: number;
  completedCards: number;
  currentStep: string;
  percent: number;
}

/**
 * Converts Canvas to PNG Data URL or ArrayBuffer
 */
async function canvasToPngBuffer(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas to blob conversion failed'));
      const reader = new FileReader();
      reader.onload = () => {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

/**
 * Draws cutting guides (trim marks) at grid intersections
 */
function drawCuttingGuides(
  page: any,
  leftPt: number,
  topPt: number,
  cardWidthPt: number,
  cardHeightPt: number,
  cols: number,
  rows: number,
  guideLenPt: number,
  color: any
) {
  // Coordinates in PDF: (0,0) is bottom-left
  // topPt is distance from top of page
  const pageHeight = page.getHeight();
  const startY = pageHeight - topPt;

  for (let r = 0; r <= rows; r++) {
    const y = startY - r * cardHeightPt;
    for (let c = 0; c <= cols; c++) {
      const x = leftPt + c * cardWidthPt;

      // Draw crosshair or L-corner
      if (r === 0 || r === rows) {
        // Horizontal tick
        page.drawLine({
          start: { x: x - guideLenPt, y },
          end: { x: x + guideLenPt, y },
          thickness: 0.5,
          color,
        });
      }
      if (c === 0 || c === cols) {
        // Vertical tick
        page.drawLine({
          start: { x, y: y - guideLenPt },
          end: { x, y: y + guideLenPt },
          thickness: 0.5,
          color,
        });
      }
    }
  }
}

/**
 * Generates Production-Ready A4 Print PDF with 9 cards per page
 */
export async function generateStudentCardsPdf(
  students: Student[],
  template: CardTemplate,
  settings: PrintSettings,
  mode: PrintMode = 'duplex',
  onProgress?: (p: PdfGenerationProgress) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const paperWidthPt = settings.paperWidthMm * MM_TO_PT; // ~595.28 pt (A4)
  const paperHeightPt = settings.paperHeightMm * MM_TO_PT; // ~841.89 pt (A4)

  const cardWidthMm = settings.cardWidthMm || template.cardWidthMm || 64;
  const cardHeightMm = settings.cardHeightMm || template.cardHeightMm || 92;
  const cardWidthPt = cardWidthMm * MM_TO_PT;
  const cardHeightPt = cardHeightMm * MM_TO_PT;

  const defaultGrid = calculateA4GridLayout(
    cardWidthMm,
    cardHeightMm,
    settings.paperWidthMm || 210,
    settings.paperHeightMm || 297
  );

  const cols = settings.gridColumns || defaultGrid.cols;
  const rows = settings.gridRows || defaultGrid.rows;
  const cardsPerPage = cols * rows;

  const marginTopPt = (settings.marginTopMm ?? defaultGrid.marginTopMm) * MM_TO_PT;
  const marginLeftPt = (settings.marginLeftMm ?? defaultGrid.marginLeftMm) * MM_TO_PT;

  const duplexOffsetXPts = (settings.duplexOffsetXmM || 0) * MM_TO_PT;
  const duplexOffsetYPts = (settings.duplexOffsetYmM || 0) * MM_TO_PT;

  const guideLenPt = (settings.cuttingGuideLengthMm || 3.5) * MM_TO_PT;
  const guideColor = rgb(0.65, 0.65, 0.7);

  // Pre-render back side canvas once (since all student cards share the institutional MoEYS back design)
  let backImageEmbed: any = null;
  if (mode === 'duplex' || mode === 'back-only') {
    onProgress?.({
      totalCards: students.length,
      completedCards: 0,
      currentStep: 'កំពុងបង្កើតផ្ទៃខាងក្រោយ (Rendering Back Template)...',
      percent: 5,
    });
    const backCanvas = await renderBackCardToCanvas(template, {
      widthMm: settings.cardWidthMm,
      heightMm: settings.cardHeightMm,
    });
    const backBytes = await canvasToPngBuffer(backCanvas);
    backImageEmbed = await pdfDoc.embedPng(backBytes);
  }

  const totalPages = Math.ceil(students.length / cardsPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageStudents = students.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage);

    // ==========================================
    // 1. FRONT SIDE PAGE
    // ==========================================
    if (mode === 'duplex' || mode === 'front-only') {
      const frontPage = pdfDoc.addPage([paperWidthPt, paperHeightPt]);

      // Render cutting guides if enabled
      if (settings.showCuttingGuides) {
        drawCuttingGuides(
          frontPage,
          marginLeftPt,
          marginTopPt,
          cardWidthPt,
          cardHeightPt,
          cols,
          rows,
          guideLenPt,
          guideColor
        );
      }

      // Draw cards in 3x3 grid
      for (let i = 0; i < pageStudents.length; i++) {
        const student = pageStudents[i];
        const r = Math.floor(i / cols);
        const c = i % cols;

        const currentCardNum = pageIdx * cardsPerPage + i + 1;
        onProgress?.({
          totalCards: students.length,
          completedCards: currentCardNum,
          currentStep: `កំពុងបង្កើតកាត ${student.nameKm} (${currentCardNum}/${students.length})...`,
          percent: Math.round((currentCardNum / students.length) * 85),
        });

        // Render card front canvas at 300 DPI
        const frontCanvas = await renderFrontCardToCanvas(student, template, {
          widthMm: settings.cardWidthMm,
          heightMm: settings.cardHeightMm,
        });
        const frontBytes = await canvasToPngBuffer(frontCanvas);
        const frontImage = await pdfDoc.embedPng(frontBytes);

        // PDF coordinates: origin is bottom-left
        const x = marginLeftPt + c * cardWidthPt;
        const y = paperHeightPt - marginTopPt - (r + 1) * cardHeightPt;

        frontPage.drawImage(frontImage, {
          x,
          y,
          width: cardWidthPt,
          height: cardHeightPt,
        });
      }
    }

    // ==========================================
    // 2. BACK SIDE PAGE (Duplex Aligned)
    // ==========================================
    if (mode === 'duplex' || mode === 'back-only') {
      const backPage = pdfDoc.addPage([paperWidthPt, paperHeightPt]);

      const backLeftPt = marginLeftPt + duplexOffsetXPts;
      const backTopPt = marginTopPt + duplexOffsetYPts;

      if (settings.showCuttingGuides) {
        drawCuttingGuides(
          backPage,
          backLeftPt,
          backTopPt,
          cardWidthPt,
          cardHeightPt,
          cols,
          rows,
          guideLenPt,
          guideColor
        );
      }

      for (let i = 0; i < pageStudents.length; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;

        // DUPLEX COLUMN MIRRORING:
        // When printing long-edge duplex, column 0 on front flips to column (cols - 1 - c) on back!
        // This ensures the back is printed directly on the reverse side of the student's front card.
        const mirroredCol = cols - 1 - c;

        const x = backLeftPt + mirroredCol * cardWidthPt;
        const y = paperHeightPt - backTopPt - (r + 1) * cardHeightPt;

        if (backImageEmbed) {
          backPage.drawImage(backImageEmbed, {
            x,
            y,
            width: cardWidthPt,
            height: cardHeightPt,
          });
        }
      }
    }
  }

  onProgress?.({
    totalCards: students.length,
    completedCards: students.length,
    currentStep: 'កំពុងបញ្ចប់ឯកសារ PDF (Finalizing PDF)...',
    percent: 100,
  });

  return await pdfDoc.save();
}

/**
 * Downloads the generated PDF bytes to the user's computer
 */
export function downloadPdf(bytes: Uint8Array, fileName: string = 'Student_Cards_A4.pdf') {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
