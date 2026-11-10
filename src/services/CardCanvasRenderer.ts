import { Student } from '../types/student';
import { CardTemplate } from '../types/template';
import { toKhmerNumerals, toArabicNumerals } from '../utils/khmerNumerals';
import { DEFAULT_STUDENT_CARD_RULES } from '../db/defaultTemplates';
import {
  MOEYS_EMBLEM_DATA_URI,
  getMoeysEmblemUrl,
  getAssetUrl,
  getDefaultFlourishUrl,
  resolveFlourishUrl,
  DEFAULT_FLOURISH_DATA_URI,
} from '../utils/assets';

export const DPI_300 = 300;
export const MM_TO_PX_300 = 300 / 25.4; // ~11.811 pixels per mm

export const FONT_MOUL = "'Moul', 'Khmer OS Muol Light', serif";
export const FONT_BATTAMBANG = "'Battambang', 'Khmer OS Battambang', 'Khmer OS', sans-serif";

export interface RenderCardOptions {
  widthMm?: number;
  heightMm?: number;
  dpi?: number;
}

const imageCache: Record<string, HTMLImageElement> = {};

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const resolvedSrc = getAssetUrl(src);
  if (imageCache[resolvedSrc]) {
    return imageCache[resolvedSrc];
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[resolvedSrc] = img;
      resolve(img);
    };
    img.onerror = () => {
      if (resolvedSrc.includes('moeys_emblem.svg') && resolvedSrc !== MOEYS_EMBLEM_DATA_URI) {
        loadImage(MOEYS_EMBLEM_DATA_URI).then(resolve).catch(reject);
      } else if (resolvedSrc.includes('flourish') && resolvedSrc !== DEFAULT_FLOURISH_DATA_URI) {
        loadImage(DEFAULT_FLOURISH_DATA_URI).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to load image: ${resolvedSrc}`));
      }
    };
    img.src = resolvedSrc;
  });
}

export async function ensureKhmerFontsLoaded(): Promise<void> {
  if ('fonts' in document) {
    try {
      await Promise.all([
        document.fonts.load("normal 16px 'Moul'"),
        document.fonts.load("normal 24px 'Moul'"),
        document.fonts.load("normal 32px 'Moul'"),
        document.fonts.load("bold 26px 'Moul'"),
        document.fonts.load("normal 14px 'Battambang'"),
        document.fonts.load("bold 14px 'Battambang'"),
        document.fonts.load("normal 24px 'Battambang'"),
        document.fonts.load("bold 24px 'Battambang'"),
      ]);
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check warning:', e);
    }
  }
}

function drawDottedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number,
  color: string,
  lineWidth: number = 1.2,
  dashLength: number = 2.5,
  gapLength: number = 4
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([dashLength, gapLength]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

/**
 * High-Resolution Canvas Renderer for Front Side
 * (Supports Variant 1 Top-Photo and Variant 2 Bottom-Photo)
 * Matches the Cambodian MoEYS physical student card 1:1 at 300 DPI print quality.
 */
export async function renderFrontCardToCanvas(
  student: Partial<Student> | undefined,
  template: CardTemplate,
  options: RenderCardOptions = {}
): Promise<HTMLCanvasElement> {
  await ensureKhmerFontsLoaded();

  const widthMm = options.widthMm || template.cardWidthMm || 64;
  const heightMm = options.heightMm || template.cardHeightMm || 92;
  const dpi = options.dpi || DPI_300;
  const scale = dpi / 25.4;

  const widthPx = Math.round(widthMm * scale); // ~756 px at 300 DPI
  const heightPx = Math.round(heightMm * scale); // ~1087 px at 300 DPI

  const isLandscape = widthMm > heightMm;

  // The base responsive reference layout is 242px width x 348px height.
  // For portrait cards, sRatio maps 242px base units directly to canvas device pixels.
  // For landscape cards, sRatio maps 350px base units to canvas pixels.
  const sRatio = isLandscape ? widthPx / 350 : widthPx / 242;

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get canvas context');

  // Fill crisp white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  const blue = template.primaryColor || '#163d7e';
  const isBottomPhoto = template.variant === 'bottom-photo';

  // Outer padding: 4.5 base units -> 4.5 * sRatio
  const cardPad = 4.5 * sRatio;
  const bx = cardPad;
  const by = cardPad;
  const bw = widthPx - 2 * cardPad;
  const bh = heightPx - 2 * cardPad;

  // 1. Draw Outer Solid Blue Border
  ctx.strokeStyle = blue;
  ctx.lineWidth = 1.2 * sRatio;
  ctx.strokeRect(bx, by, bw, bh);

  // 2. Draw Watermark Emblem
  if (template.showWatermark) {
    try {
      const emblemImg = await loadImage(
        template.emblemUrl && !template.emblemUrl.includes('moeys_emblem.svg')
          ? template.emblemUrl
          : MOEYS_EMBLEM_DATA_URI
      );
      ctx.save();
      ctx.globalAlpha = template.watermarkOpacity || 0.16;
      const wmSize = 145 * sRatio;
      const wmx = bx + (bw - wmSize) / 2;
      const wmy = by + (bh - wmSize) / 2 + (isBottomPhoto ? 0 : 25 * sRatio);
      ctx.drawImage(emblemImg, wmx, wmy, wmSize, wmSize);
      ctx.restore();
    } catch (e) {
      console.warn('Could not render watermark image on canvas:', e);
    }
  }

  // Active printable content bounds inside border (4 base units padding)
  const innerPad = 4 * sRatio;
  const cx = bx + innerPad;
  const cy = by + innerPad;
  const cw = bw - 2 * innerPad;

  ctx.fillStyle = blue;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // ========================================================
  // LANDSCAPE LAYOUT (e.g. 86mm x 54mm CR80 / ATM Landscape)
  // ========================================================
  if (isLandscape) {
    await renderLandscapeFrontCard(
      ctx,
      student,
      template,
      scale,
      sRatio,
      cx,
      cy,
      cw,
      bh - 2 * innerPad,
      blue
    );
    return canvas;
  }

  // ========================================================
  // VARIANT 1: TOP-PHOTO (Exact Clone of Reference Image 1)
  // ========================================================
  if (!isBottomPhoto) {
    let curY = cy + 2 * sRatio;

    // 1. Country Headers (Centered)
    const fMoul1 = Math.round(11.5 * sRatio);
    ctx.font = `normal ${fMoul1}px ${FONT_MOUL}`;
    ctx.fillText(template.countryHeaderKm1, cx + cw / 2, curY);

    curY += fMoul1 + 2 * sRatio;
    const fMoul2 = Math.round(10 * sRatio);
    ctx.font = `normal ${fMoul2}px ${FONT_MOUL}`;
    ctx.fillText(template.countryHeaderKm2, cx + cw / 2, curY);

    // 2. Royal Flourish: ផ្នែកខាងក្រោមព្រះរាជា (Optimized height to guarantee footer never overflows)
    curY += fMoul2 + 2 * sRatio;
    const flourishW = 125 * sRatio;
    const flourishH = 10 * sRatio;
    try {
      const flImg = await loadImage(resolveFlourishUrl(template.flourishUrl));
      ctx.drawImage(flImg, cx + (cw - flourishW) / 2, curY, flourishW, flourishH);
    } catch (e) {
      // Fallback flourish divider
      const halfW = 35 * sRatio;
      ctx.save();
      ctx.strokeStyle = blue;
      ctx.lineWidth = 1 * sRatio;
      ctx.beginPath();
      ctx.moveTo(cx + cw / 2 - halfW, curY + 5 * sRatio);
      ctx.lineTo(cx + cw / 2 - 8 * sRatio, curY + 5 * sRatio);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + cw / 2 + 8 * sRatio, curY + 5 * sRatio);
      ctx.lineTo(cx + cw / 2 + halfW, curY + 5 * sRatio);
      ctx.stroke();
      ctx.restore();
    }
    curY += flourishH + 2 * sRatio;

    // 3. Ministry Department & School Name (Emblem vertically centered with text)
    const logoH = 22 * sRatio;
    const logoW = Math.round(logoH * 0.77); // ~17 * sRatio
    const logoY = curY;
    try {
      const emblemImg = await loadImage(
        template.emblemUrl && !template.emblemUrl.includes('moeys_emblem.svg')
          ? template.emblemUrl
          : MOEYS_EMBLEM_DATA_URI
      );
      ctx.drawImage(emblemImg, cx, logoY, logoW, logoH);
    } catch (e) {}

    const deptX = cx + logoW + 4 * sRatio;
    ctx.textAlign = 'left';
    const fDept = Math.round(9.5 * sRatio);
    ctx.font = `bold ${fDept}px ${FONT_BATTAMBANG}`;
    ctx.fillText(template.ministryDepartment, deptX, curY + 1 * sRatio);

    const ySchool = curY + 12 * sRatio;
    const fSchool = Math.round(9 * sRatio);
    ctx.font = `bold ${fSchool}px ${FONT_BATTAMBANG}`;
    ctx.fillText('អនុ/វិទ្យាល័យ', deptX, ySchool);
    const schoolLabelW = ctx.measureText('អនុ/វិទ្យាល័យ').width;
    const schoolLineX1 = deptX + schoolLabelW + 3 * sRatio;
    const schoolLineX2 = cx + cw;

    const displaySchoolName = template.schoolNameOnly
      ? template.schoolNameOnly.replace(/^អនុ[\/\s]*វិទ្យាល័យ\s*/, '')
      : '';

    if (displaySchoolName) {
      // NO DOTS when filled! BOLD font with auto-scaling to prevent border cut-off
      let sFont = 9.5;
      ctx.font = `bold ${Math.round(sFont * sRatio)}px ${FONT_BATTAMBANG}`;
      const maxSchoolW = (cx + cw - 2 * sRatio) - schoolLineX1;
      while (ctx.measureText(displaySchoolName).width > maxSchoolW && sFont > 7.0) {
        sFont -= 0.5;
        ctx.font = `bold ${Math.round(sFont * sRatio)}px ${FONT_BATTAMBANG}`;
      }
      ctx.fillText(displaySchoolName, schoolLineX1, ySchool);
    } else {
      drawDottedLine(ctx, schoolLineX1, ySchool + fSchool, schoolLineX2 - 2 * sRatio, blue, 1 * sRatio);
    }

    // 4. Photo Box on Left: exact 76 x 101 in 242-base (Strict 3:4 ratio, optimal height for 9-on-A4)
    const photoW = Math.round(76 * sRatio);
    const photoH = Math.round(101 * sRatio);
    const photoX = cx;
    const photoY = curY + logoH + 3 * sRatio;

    ctx.strokeStyle = blue;
    ctx.lineWidth = 1.2 * sRatio;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    if (student?.photoUrl) {
      try {
        const studentPhoto = await loadImage(student.photoUrl);
        ctx.drawImage(studentPhoto, photoX, photoY, photoW, photoH);
      } catch (e) {}
    } else {
      ctx.fillStyle = blue;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.round(13.5 * sRatio)}px sans-serif`;
      ctx.fillText(template.photoBoxText || '3 x 4', photoX + photoW / 2, photoY + photoH / 2);
      ctx.textBaseline = 'top';
    }

    // 5. Right of Photo Box: Title & Student Details
    const rx = photoX + photoW + 8 * sRatio;
    const rw = cx + cw - rx;

    // Title: អត្តសញ្ញាណប័ណ្ណសិស្ស (Auto-scaled to prevent touching right border or photo box)
    let fTitle = Math.round(11.5 * sRatio);
    ctx.textAlign = 'center';
    ctx.font = `normal ${fTitle}px ${FONT_MOUL}`;
    const maxTitleW = rw - 8 * sRatio;
    while (ctx.measureText(template.cardTitleKm).width > maxTitleW && fTitle > 8 * sRatio) {
      fTitle -= 0.5 * sRatio;
      ctx.font = `normal ${Math.round(fTitle)}px ${FONT_MOUL}`;
    }
    ctx.fillText(template.cardTitleKm, rx + rw / 2, photoY);

    // Card Number / Prefix
    const fNum = Math.round(9.5 * sRatio);
    const yNum = photoY + fTitle + 3 * sRatio;
    const cardNumText = student?.cardNumber
      ? toKhmerNumerals(student.cardNumber)
      : (student?.studentId ? toKhmerNumerals(student.studentId) : '');

    ctx.textAlign = 'center';
    if (cardNumText) {
      const prefixText = `${template.cardNumberPrefix} `;
      ctx.font = `normal ${fNum}px ${FONT_BATTAMBANG}`;
      const pW = ctx.measureText(prefixText).width;
      ctx.font = `bold ${Math.round(10.5 * sRatio)}px ${FONT_BATTAMBANG}`;
      const vW = ctx.measureText(cardNumText).width;
      const startX = rx + (rw - (pW + vW)) / 2;

      ctx.textAlign = 'left';
      ctx.font = `normal ${fNum}px ${FONT_BATTAMBANG}`;
      ctx.fillText(prefixText, startX, yNum);
      ctx.font = `bold ${Math.round(10.5 * sRatio)}px ${FONT_BATTAMBANG}`;
      ctx.fillText(cardNumText, startX + pW, yNum);
    } else {
      ctx.font = `normal ${fNum}px ${FONT_BATTAMBANG}`;
      ctx.fillText(`${template.cardNumberPrefix} ........................`, rx + rw / 2, yNum);
    }

    // Academic Year
    const yYear = yNum + fNum + 3 * sRatio;
    const yearText = student?.academicYear
      ? toKhmerNumerals(student.academicYear)
      : '';

    ctx.textAlign = 'center';
    if (yearText) {
      const yPrefix = 'ឆ្នាំសិក្សា ';
      ctx.font = `normal ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
      const ypW = ctx.measureText(yPrefix).width;
      ctx.font = `bold ${Math.round(9.5 * sRatio)}px ${FONT_BATTAMBANG}`;
      const yvW = ctx.measureText(yearText).width;
      const startYX = rx + (rw - (ypW + yvW)) / 2;

      ctx.textAlign = 'left';
      ctx.font = `normal ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
      ctx.fillText(yPrefix, startYX, yYear);
      ctx.font = `bold ${Math.round(9.5 * sRatio)}px ${FONT_BATTAMBANG}`;
      ctx.fillText(yearText, startYX + ypW, yYear);
    } else {
      ctx.font = `normal ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
      ctx.fillText(template.academicYearPrefix, rx + rw / 2, yYear);
    }

    // 3 rows beside photo: BOLD Important Fields & NO DOTS when filled
    let rowCurY = yYear + fNum + 6 * sRatio;
    const fField = Math.round(9.5 * sRatio);
    ctx.textAlign = 'left';

    // Row 1: គោត្តនាម-នាមៈ
    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('គោត្តនាម-នាមៈ', rx, rowCurY);
    const nW = ctx.measureText('គោត្តនាម-នាមៈ').width;
    const nX1 = rx + nW + 3 * sRatio;
    const maxNameW = (cx + cw - 2 * sRatio) - (nX1 + 2 * sRatio);
    if (student?.nameKm) {
      let nameFontSize = 11;
      ctx.font = `bold ${Math.round(nameFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      while (ctx.measureText(student.nameKm).width > maxNameW && nameFontSize > 7.5) {
        nameFontSize -= 0.5;
        ctx.font = `bold ${Math.round(nameFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      }
      ctx.fillText(student.nameKm, nX1 + 2 * sRatio, rowCurY);
    } else {
      drawDottedLine(ctx, nX1, rowCurY + fField, cx + cw - 2 * sRatio, blue, 1 * sRatio);
    }

    // Row 2 & 3: Col 2 aligned with ample room so student ID and nationality never truncate
    // Col 1 needs ~46px for ភេទ/ថ្នាក់ទី + value; Col 2 gets the remaining ~96px of rw
    rowCurY += 15 * sRatio;
    const col2X = rx + Math.round(rw * 0.35);

    // Row 2: ភេទ & សញ្ជាតិ
    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('ភេទ', rx, rowCurY);
    const gW = ctx.measureText('ភេទ').width;
    const gX1 = rx + gW + 3 * sRatio;
    if (student?.gender) {
      ctx.font = `bold ${Math.round(10.5 * sRatio)}px ${FONT_BATTAMBANG}`;
      ctx.fillText(student.gender, gX1 + 2 * sRatio, rowCurY);
    } else {
      drawDottedLine(ctx, gX1, rowCurY + fField, col2X - 4 * sRatio, blue, 1 * sRatio);
    }

    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('សញ្ជាតិ', col2X, rowCurY);
    const natW = ctx.measureText('សញ្ជាតិ').width;
    const natX1 = col2X + natW + 3 * sRatio;
    const natVal = student?.nationality || (student?.nameKm ? 'ខ្មែរ' : '');
    const maxNatW = (cx + cw - 2 * sRatio) - (natX1 + 2 * sRatio);
    if (natVal) {
      let natFontSize = 10.5;
      ctx.font = `bold ${Math.round(natFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      while (ctx.measureText(natVal).width > maxNatW && natFontSize > 7.5) {
        natFontSize -= 0.5;
        ctx.font = `bold ${Math.round(natFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      }
      ctx.fillText(natVal, natX1 + 2 * sRatio, rowCurY);
    } else {
      drawDottedLine(ctx, natX1, rowCurY + fField, cx + cw - 2 * sRatio, blue, 1 * sRatio);
    }

    // Row 3: ថ្នាក់ទី & អត្តលេខៈ (Arabic Numerals for Class, Student ID auto-scaled to prevent any cutoff)
    rowCurY += 15 * sRatio;
    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('ថ្នាក់ទី', rx, rowCurY);
    const cW = ctx.measureText('ថ្នាក់ទី').width;
    const cX1 = rx + cW + 3 * sRatio;
    const classVal = student?.class ? toArabicNumerals(student.class) : '';
    if (classVal) {
      ctx.font = `bold ${Math.round(11 * sRatio)}px sans-serif`;
      ctx.fillText(classVal, cX1 + 2 * sRatio, rowCurY);
    } else {
      drawDottedLine(ctx, cX1, rowCurY + fField, col2X - 4 * sRatio, blue, 1 * sRatio);
    }

    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('អត្តលេខៈ', col2X, rowCurY);
    const idW = ctx.measureText('អត្តលេខៈ').width;
    const idX1 = col2X + idW + 2 * sRatio;
    const maxIdW = (cx + cw - 2 * sRatio) - (idX1 + 2 * sRatio);
    if (student?.studentId) {
      let idFontSize = 9.5;
      ctx.font = `bold ${Math.round(idFontSize * sRatio)}px sans-serif`;
      while (ctx.measureText(student.studentId).width > maxIdW && idFontSize > 6.0) {
        idFontSize -= 0.5;
        ctx.font = `bold ${Math.round(idFontSize * sRatio)}px sans-serif`;
      }
      ctx.fillText(student.studentId, idX1 + 2 * sRatio, rowCurY);
    } else {
      drawDottedLine(ctx, idX1, rowCurY + fField, cx + cw - 2 * sRatio, blue, 1 * sRatio);
    }

    // 6. 5 Full Width Lines below Photo Box (Optimized gap to guarantee footer never overflows)
    let fullY = photoY + photoH + 5 * sRatio;
    const lineGap = 14 * sRatio;

    const drawFullLine = (
      label: string,
      value: string | undefined,
      isBoldVal = false,
      isArabicFont = false,
      boldFontSize = 10
    ) => {
      ctx.textAlign = 'left';
      ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
      ctx.fillText(label, cx, fullY);
      const lw = ctx.measureText(label).width;
      const lx1 = cx + lw + 3 * sRatio;
      const lx2 = cx + cw - 2 * sRatio;

      if (value) {
        const fontFam = isArabicFont ? 'sans-serif' : FONT_BATTAMBANG;
        let curFontSize = boldFontSize;
        ctx.font = `${isBoldVal ? 'bold' : 'normal'} ${Math.round(curFontSize * sRatio)}px ${fontFam}`;
        const maxValW = lx2 - (lx1 + 2 * sRatio);
        while (ctx.measureText(value).width > maxValW && curFontSize > 6.5) {
          curFontSize -= 0.5;
          ctx.font = `${isBoldVal ? 'bold' : 'normal'} ${Math.round(curFontSize * sRatio)}px ${fontFam}`;
        }
        ctx.fillText(value, lx1 + 2 * sRatio, fullY);
      } else {
        drawDottedLine(ctx, lx1, fullY + fField, lx2, blue, 1 * sRatio);
      }
      fullY += lineGap;
    };

    // 1. ថ្ងៃខែឆ្នាំកំណើតៈ (Arabic Numerals & Bold)
    const dobVal = student?.dateOfBirth ? toArabicNumerals(student.dateOfBirth) : '';
    drawFullLine('ថ្ងៃខែឆ្នាំកំណើតៈ', dobVal, true, true, 10.5);

    // 2. ទីកន្លែងកំណើតៈ
    drawFullLine('ទីកន្លែងកំណើតៈ', student?.placeOfBirth, true, false, 9.5);

    // 3. ឪពុកឈ្មោះៈ & មុខរបរ (aligned with auto-scaling to prevent overflow)
    const jobColX = cx + Math.max(cw * 0.50, 118 * sRatio);

    ctx.textAlign = 'left';
    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('ឪពុកឈ្មោះៈ', cx, fullY);
    const fLabelW = ctx.measureText('ឪពុកឈ្មោះៈ').width;
    const fL1 = cx + fLabelW + 3 * sRatio;
    const maxFatherW = (jobColX - 5 * sRatio) - (fL1 + 2 * sRatio);

    if (student?.fatherName) {
      let fFontSize = 9.5;
      ctx.font = `bold ${Math.round(fFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      while (ctx.measureText(student.fatherName).width > maxFatherW && fFontSize > 6.5) {
        fFontSize -= 0.5;
        ctx.font = `bold ${Math.round(fFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      }
      ctx.fillText(student.fatherName, fL1 + 2 * sRatio, fullY);
    } else {
      drawDottedLine(ctx, fL1, fullY + fField, jobColX - 5 * sRatio, blue, 1 * sRatio);
    }

    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('មុខរបរ', jobColX, fullY);
    const j1LabelW = ctx.measureText('មុខរបរ').width;
    const j1L1 = jobColX + j1LabelW + 3 * sRatio;
    const maxJob1W = (cx + cw - 2 * sRatio) - (j1L1 + 2 * sRatio);

    if (student?.fatherOccupation) {
      let j1FontSize = 9.5;
      ctx.font = `bold ${Math.round(j1FontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      while (ctx.measureText(student.fatherOccupation).width > maxJob1W && j1FontSize > 6.5) {
        j1FontSize -= 0.5;
        ctx.font = `bold ${Math.round(j1FontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      }
      ctx.fillText(student.fatherOccupation, j1L1 + 2 * sRatio, fullY);
    } else {
      drawDottedLine(ctx, j1L1, fullY + fField, cx + cw - 2 * sRatio, blue, 1 * sRatio);
    }
    fullY += lineGap;

    // 4. ម្តាយឈ្មោះៈ & មុខរបរ (aligned with auto-scaling to prevent overflow)
    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('ម្តាយឈ្មោះៈ', cx, fullY);
    const mLabelW = ctx.measureText('ម្តាយឈ្មោះៈ').width;
    const mL1 = cx + mLabelW + 3 * sRatio;
    const maxMotherW = (jobColX - 5 * sRatio) - (mL1 + 2 * sRatio);

    if (student?.motherName) {
      let mFontSize = 9.5;
      ctx.font = `bold ${Math.round(mFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      while (ctx.measureText(student.motherName).width > maxMotherW && mFontSize > 6.5) {
        mFontSize -= 0.5;
        ctx.font = `bold ${Math.round(mFontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      }
      ctx.fillText(student.motherName, mL1 + 2 * sRatio, fullY);
    } else {
      drawDottedLine(ctx, mL1, fullY + fField, jobColX - 5 * sRatio, blue, 1 * sRatio);
    }

    ctx.font = `normal ${fField}px ${FONT_BATTAMBANG}`;
    ctx.fillText('មុខរបរ', jobColX, fullY);
    const j2LabelW = ctx.measureText('មុខរបរ').width;
    const j2L1 = jobColX + j2LabelW + 3 * sRatio;
    const maxJob2W = (cx + cw - 2 * sRatio) - (j2L1 + 2 * sRatio);

    if (student?.motherOccupation) {
      let j2FontSize = 9.5;
      ctx.font = `bold ${Math.round(j2FontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      while (ctx.measureText(student.motherOccupation).width > maxJob2W && j2FontSize > 6.5) {
        j2FontSize -= 0.5;
        ctx.font = `bold ${Math.round(j2FontSize * sRatio)}px ${FONT_BATTAMBANG}`;
      }
      ctx.fillText(student.motherOccupation, j2L1 + 2 * sRatio, fullY);
    } else {
      drawDottedLine(ctx, j2L1, fullY + fField, cx + cw - 2 * sRatio, blue, 1 * sRatio);
    }
    fullY += lineGap;

    // 5. ទីលំនៅបច្ចុប្បន្នៈ
    drawFullLine('ទីលំនៅបច្ចុប្បន្នៈ', student?.address, true, false, 9.5);

    // 7. FOOTER SIGNATURES & NAMES AREA
    // Strictly anchored with safe bottom buffer and descender room so Director Name (ឈ្មោះនាយក) is NEVER cut off!
    const footerH = 46 * sRatio;
    const innerBottom = by + bh - innerPad;
    // Generous clamp so director name with Khmer sub-scripts (ជើងអក្សរ & ស្រៈក្រោម) has >6.5 base units of clear room
    const maxAllowedYDate = innerBottom - 46 * sRatio;
    const targetFooterY = innerBottom - footerH;
    const yDate = Math.min(Math.max(fullY + 3 * sRatio, targetFooterY), maxAllowedYDate);
    const fFooter = Math.round(8.5 * sRatio);

    // Detect if right side represents Director or Student
    const rightIsDirector =
      (template.signatureTitle && (
        template.signatureTitle.includes('នាយក') ||
        template.signatureTitle.includes('រដ្ឋបាល')
      )) ||
      (template.directorTitle && (
        template.directorTitle.includes('ស្នាមមេដៃ') ||
        template.directorTitle.includes('សាមីខ្លួន')
      ));

    const leftTitle = rightIsDirector ? (template.directorTitle || 'ស្នាមមេដៃស្ដាំ') : (template.directorTitle || 'នាយក');
    const leftName = rightIsDirector ? (student?.nameKm || '') : (template.directorName || 'ជា សារ៉ា');

    const rightTitle = rightIsDirector ? (template.signatureTitle || 'ហត្ថលេខានាយក/រដ្ឋបាល') : (template.signatureTitle || 'ហត្ថលេខាសាមីខ្លួន');
    const rightName = rightIsDirector ? (template.directorName || 'ជា សារ៉ា') : (student?.nameKm || '');

    // Left block center & Right block center
    const leftCenterX = cx + 58 * sRatio;
    const rightCenterX = cx + cw - 58 * sRatio;

    // Issue date line is placed above the Director's signature
    if (!rightIsDirector) {
      ctx.textAlign = 'center';
      ctx.font = `normal ${fFooter}px ${FONT_BATTAMBANG}`;
      ctx.fillText(template.issueDateLine || 'ថ្ងៃទី.........ខែ.........ឆ្នាំ២០......', leftCenterX, yDate);
    } else {
      ctx.textAlign = 'center';
      ctx.font = `normal ${fFooter}px ${FONT_BATTAMBANG}`;
      ctx.fillText(template.issueDateLine || 'ថ្ងៃទី.........ខែ.........ឆ្នាំ២០......', rightCenterX, yDate);
    }

    // Left Title
    const leftTitleY = !rightIsDirector ? yDate + 10 * sRatio : yDate + 10 * sRatio;
    ctx.font = `bold ${Math.round(9.5 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(leftTitle, leftCenterX, leftTitleY);

    // Left dedicated dotted line
    drawDottedLine(
      ctx,
      leftCenterX - 36 * sRatio,
      yDate + 21 * sRatio,
      leftCenterX + 36 * sRatio,
      blue,
      0.8 * sRatio,
      2,
      4
    );

    // Left Name underneath (if present)
    if (leftName) {
      ctx.font = `bold ${Math.round(10 * sRatio)}px ${FONT_BATTAMBANG}`;
      ctx.fillText(leftName, leftCenterX, yDate + 29.5 * sRatio);
    }

    // Right Title
    const rightTitleY = rightIsDirector ? yDate + 10 * sRatio : yDate + 10 * sRatio;
    ctx.font = `bold ${Math.round(9.5 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(rightTitle, rightCenterX, rightTitleY);

    // Right dedicated dotted line
    drawDottedLine(
      ctx,
      rightCenterX - 38 * sRatio,
      yDate + 21 * sRatio,
      rightCenterX + 38 * sRatio,
      blue,
      0.8 * sRatio,
      2,
      4
    );

    // Right Name underneath (Director Name or Student Name)
    if (rightName) {
      ctx.font = `bold ${Math.round(10 * sRatio)}px ${FONT_BATTAMBANG}`;
      ctx.fillText(rightName, rightCenterX, yDate + 29.5 * sRatio);
    }
  }

  // ========================================================
  // VARIANT 2: BOTTOM-PHOTO (Battambang Template Style)
  // ========================================================
  if (isBottomPhoto) {
    let curY = cy + 2 * sRatio;

    const fMoul1 = Math.round(11 * sRatio);
    ctx.font = `normal ${fMoul1}px ${FONT_MOUL}`;
    ctx.fillText(template.countryHeaderKm1, cx + cw / 2, curY);

    curY += fMoul1 + 3.5 * sRatio;
    const fMoul2 = Math.round(10 * sRatio);
    ctx.font = `normal ${fMoul2}px ${FONT_MOUL}`;
    ctx.fillText(template.countryHeaderKm2, cx + cw / 2, curY);

    // Flourish divider
    curY += fMoul2 + 3.5 * sRatio;
    ctx.font = `bold ${Math.round(11 * sRatio)}px sans-serif`;
    ctx.fillText('៚', cx + cw / 2, curY);

    // Ministry & Province
    curY += 13 * sRatio;
    const logoW = 22 * sRatio;
    const logoH = 26 * sRatio;
    try {
      const emblemImg = await loadImage(
        template.emblemUrl && !template.emblemUrl.includes('moeys_emblem.svg')
          ? template.emblemUrl
          : MOEYS_EMBLEM_DATA_URI
      );
      ctx.drawImage(emblemImg, cx + cw / 2 - 82 * sRatio, curY, logoW, logoH);
    } catch (e) {}

    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(9.5 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(template.ministryDepartment, cx + cw / 2 - 56 * sRatio, curY + 6 * sRatio);

    // Title: ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
    curY += logoH + 9 * sRatio;
    ctx.textAlign = 'center';
    const fTitle = Math.round(13.5 * sRatio);
    ctx.font = `normal ${fTitle}px ${FONT_MOUL}`;
    ctx.fillText(template.cardTitleKm, cx + cw / 2, curY);

    // Year & Grade (Arabic for class)
    curY += fTitle + 3.5 * sRatio;
    ctx.font = `normal ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
    const yearText = student?.academicYear
      ? `ឆ្នាំសិក្សា ${toKhmerNumerals(student.academicYear)}`
      : template.academicYearPrefix;
    ctx.fillText(yearText, cx + cw / 2, curY);

    curY += 13 * sRatio;
    const classArabic = student?.class ? toArabicNumerals(student.class) : '12 "A"';
    ctx.font = `bold ${Math.round(11.5 * sRatio)}px sans-serif`;
    ctx.fillText(`ថ្នាក់ទី ${classArabic}`, cx + cw / 2, curY);

    // Middle Info Lines
    curY += 20 * sRatio;
    const fField = Math.round(10 * sRatio);
    ctx.textAlign = 'left';

    // គោត្តនាម នាម & ភេទ
    ctx.font = `normal ${fField}px 'Battambang', sans-serif`;
    ctx.fillText('គោត្តនាម នាម', cx, curY);
    if (student?.nameKm) {
      ctx.font = `bold ${Math.round(11.5 * sRatio)}px 'Battambang', sans-serif`;
      ctx.fillText(student.nameKm, cx + 75 * sRatio, curY);
    } else {
      drawDottedLine(ctx, cx + 75 * sRatio, curY + fField, cx + cw - 65 * sRatio, blue, 1 * sRatio);
    }

    ctx.font = `normal ${fField}px 'Battambang', sans-serif`;
    ctx.fillText('ភេទ', cx + cw - 55 * sRatio, curY);
    if (student?.gender) {
      ctx.font = `bold ${fField}px 'Battambang', sans-serif`;
      ctx.fillText(student.gender, cx + cw - 25 * sRatio, curY);
    } else {
      drawDottedLine(ctx, cx + cw - 30 * sRatio, curY + fField, cx + cw, blue, 1 * sRatio);
    }

    // ថ្ងៃកំណើត (Arabic Numerals)
    curY += 18 * sRatio;
    ctx.font = `normal ${fField}px 'Battambang', sans-serif`;
    ctx.fillText('ថ្ងៃខែឆ្នាំកំណើតៈ', cx, curY);
    const dobArabic = student?.dateOfBirth ? toArabicNumerals(student.dateOfBirth) : '';
    if (dobArabic) {
      ctx.font = `bold ${fField}px sans-serif`;
      ctx.fillText(dobArabic, cx + 75 * sRatio, curY);
    } else {
      drawDottedLine(ctx, cx + 75 * sRatio, curY + fField, cx + cw, blue, 1 * sRatio);
    }

    // ទីកន្លែងកំណើត
    curY += 18 * sRatio;
    ctx.font = `normal ${fField}px 'Battambang', sans-serif`;
    ctx.fillText('ទីកន្លែងកំណើតៈ', cx, curY);
    const maxPobW = (cx + cw - 2 * sRatio) - (cx + 75 * sRatio);
    if (student?.placeOfBirth) {
      let pobFont = fField;
      ctx.font = `bold ${pobFont}px 'Battambang', sans-serif`;
      while (ctx.measureText(student.placeOfBirth).width > maxPobW && pobFont > 7 * sRatio) {
        pobFont -= 0.5 * sRatio;
        ctx.font = `bold ${pobFont}px 'Battambang', sans-serif`;
      }
      ctx.fillText(student.placeOfBirth, cx + 75 * sRatio, curY);
    } else {
      drawDottedLine(ctx, cx + 75 * sRatio, curY + fField, cx + cw - 2 * sRatio, blue, 1 * sRatio);
    }

    // ឪពុក & ម្តាយ
    curY += 18 * sRatio;
    ctx.font = `normal ${fField}px 'Battambang', sans-serif`;
    ctx.fillText('ឪពុកឈ្មោះៈ', cx, curY);
    const maxFatherValW = (cx + 128 * sRatio) - (cx + 64 * sRatio);
    if (student?.fatherName) {
      let fFont = fField;
      ctx.font = `bold ${fFont}px 'Battambang', sans-serif`;
      while (ctx.measureText(student.fatherName).width > maxFatherValW && fFont > 7 * sRatio) {
        fFont -= 0.5 * sRatio;
        ctx.font = `bold ${fFont}px 'Battambang', sans-serif`;
      }
      ctx.fillText(student.fatherName, cx + 64 * sRatio, curY);
    } else {
      drawDottedLine(ctx, cx + 64 * sRatio, curY + fField, cx + 128 * sRatio, blue, 1 * sRatio);
    }

    ctx.font = `normal ${fField}px 'Battambang', sans-serif`;
    ctx.fillText('ម្តាយឈ្មោះៈ', cx + 132 * sRatio, curY);
    const maxMotherValW = (cx + cw - 2 * sRatio) - (cx + 188 * sRatio);
    if (student?.motherName) {
      let mFont = fField;
      ctx.font = `bold ${mFont}px 'Battambang', sans-serif`;
      while (ctx.measureText(student.motherName).width > maxMotherValW && mFont > 7 * sRatio) {
        mFont -= 0.5 * sRatio;
        ctx.font = `bold ${mFont}px 'Battambang', sans-serif`;
      }
      ctx.fillText(student.motherName, cx + 188 * sRatio, curY);
    } else {
      drawDottedLine(ctx, cx + 188 * sRatio, curY + fField, cx + cw - 2 * sRatio, blue, 1 * sRatio);
    }

    // Bottom Photo & Signatures
    // Bottom Left Photo: exact 84 x 112 in 242-base (3:4 ratio)
    const photoW = Math.round(84 * sRatio);
    const photoH = Math.round(112 * sRatio);
    const photoX = cx;
    const photoY = by + bh - photoH - 6 * sRatio;

    ctx.strokeStyle = blue;
    ctx.lineWidth = 1.2 * sRatio;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    if (student?.photoUrl) {
      try {
        const studentPhoto = await loadImage(student.photoUrl);
        ctx.drawImage(studentPhoto, photoX, photoY, photoW, photoH);
      } catch (e) {}
    } else {
      ctx.fillStyle = blue;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.round(13.5 * sRatio)}px sans-serif`;
      ctx.fillText(template.photoBoxText || '3 x 4', photoX + photoW / 2, photoY + photoH / 2);
      ctx.textBaseline = 'top';
    }

    // Bottom Right Signature Block
    const sigX = photoX + photoW + 12 * sRatio;
    const sigW = cx + cw - sigX;
    ctx.textAlign = 'center';
    ctx.font = `normal ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(
      template.studentDeclaration || `ជាសិស្ស ${template.schoolNameOnly || 'វិទ្យាល័យ អន្លង់វិល'}`,
      sigX + sigW / 2,
      photoY + 4 * sRatio
    );
    ctx.fillText(template.issueDateLine, sigX + sigW / 2, photoY + 20 * sRatio);

    // Dedicated signing line
    drawDottedLine(
      ctx,
      sigX + 12 * sRatio,
      photoY + 46 * sRatio,
      sigX + sigW - 12 * sRatio,
      blue,
      0.8 * sRatio,
      2,
      4
    );

    ctx.font = `normal ${Math.round(11 * sRatio)}px ${FONT_MOUL}`;
    ctx.fillText(template.directorTitle || 'នាយកសាលា', sigX + sigW / 2, photoY + photoH - 24 * sRatio);

    const dirName = template.directorName || 'ជា សារ៉ា';
    ctx.font = `bold ${Math.round(10.5 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(dirName, sigX + sigW / 2, photoY + photoH - 8 * sRatio);
  }

  return canvas;
}



/**
 * High-Resolution Canvas Renderer for Back Side (Reference Image 2)
 */
export async function renderBackCardToCanvas(
  template: CardTemplate,
  options: RenderCardOptions = {}
): Promise<HTMLCanvasElement> {
  await ensureKhmerFontsLoaded();

  const widthMm = options.widthMm || template.cardWidthMm || 64;
  const heightMm = options.heightMm || template.cardHeightMm || 92;
  const dpi = options.dpi || DPI_300;
  const scale = dpi / 25.4;

  const widthPx = Math.round(widthMm * scale);
  const heightPx = Math.round(heightMm * scale);
  const isLandscape = widthMm > heightMm;
  const sRatio = isLandscape ? widthPx / 350 : widthPx / 242;

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  const blue = template.primaryColor || '#163d7e';
  const layout = template.backLayout || 'rules-and-emblem';

  // MODE 1: Centered Emblem Only (Reference Standard)
  if (layout === 'emblem-only') {
    if (template.showBackEmblem) {
      try {
        const emblemImg = await loadImage(
          template.emblemUrl && !template.emblemUrl.includes('moeys_emblem.svg')
            ? template.emblemUrl
            : MOEYS_EMBLEM_DATA_URI
        );
        const sizePercent = (template.backEmblemSizePercent || 52) / 100;
        const emblemW = widthPx * sizePercent;
        const emblemH = emblemW * 1.15;
        const ex = (widthPx - emblemW) / 2;
        const ey = (heightPx - emblemH) / 2;
        ctx.drawImage(emblemImg, ex, ey, emblemW, emblemH);
      } catch (e) {
        console.warn('Could not draw back emblem on canvas:', e);
      }
    }
    return canvas;
  }

  // MODE 2 & 3: Rules & Emblem / Modern QR
  const cardPad = 4.5 * sRatio;
  const bx = cardPad;
  const by = cardPad;
  const bw = widthPx - 2 * cardPad;
  const bh = heightPx - 2 * cardPad;

  // Outer solid blue border
  ctx.strokeStyle = blue;
  ctx.lineWidth = 1.2 * sRatio;
  ctx.strokeRect(bx, by, bw, bh);

  const innerPad = 4 * sRatio;
  const cx = bx + innerPad;
  let curY = by + innerPad;
  const cw = bw - 2 * innerPad;

  // Top header: Emblem + Ministry & School
  try {
    const logoImg = await loadImage(
      template.emblemUrl && !template.emblemUrl.includes('moeys_emblem.svg')
        ? template.emblemUrl
        : MOEYS_EMBLEM_DATA_URI
    );
    const logoW = Math.round(20 * sRatio);
    const logoH = Math.round(26 * sRatio);
    ctx.drawImage(logoImg, cx, curY, logoW, logoH);

    ctx.textAlign = 'left';
    ctx.fillStyle = blue;
    ctx.font = `normal ${Math.round(9.5 * sRatio)}px ${FONT_MOUL}`;
    ctx.fillText(template.ministryDepartment || 'ក្រសួងអប់រំ យុវជន និងកីឡា', cx + logoW + 6 * sRatio, curY + 2 * sRatio);

    ctx.fillStyle = '#334155';
    ctx.font = `bold ${Math.round(8.5 * sRatio)}px ${FONT_BATTAMBANG}`;
    const schoolText = template.schoolNameOnly || 'សាលារៀនចំណេះទូទៅ';
    ctx.fillText(schoolText, cx + logoW + 6 * sRatio, curY + 14 * sRatio);

    curY += logoH + 6 * sRatio;
  } catch (e) {
    curY += 20 * sRatio;
  }

  // Header separator line
  ctx.strokeStyle = `${blue}40`;
  ctx.lineWidth = 0.8 * sRatio;
  ctx.beginPath();
  ctx.moveTo(cx, curY);
  ctx.lineTo(cx + cw, curY);
  ctx.stroke();
  curY += 6 * sRatio;

  // Title: បទបញ្ជាទូទៅសម្រាប់សិស្ស
  ctx.textAlign = 'center';
  ctx.fillStyle = blue;
  ctx.font = `normal ${Math.round(10.5 * sRatio)}px ${FONT_MOUL}`;
  ctx.fillText('បទបញ្ជាទូទៅសម្រាប់សិស្ស', cx + cw / 2, curY);
  curY += 16 * sRatio;

  // Rules list (Enforce exactly 5 rules with backfill)
  const userRules = (template.backRulesText || []).filter((r) => typeof r === 'string' && r.trim().length > 0);
  const rules = [...userRules, ...DEFAULT_STUDENT_CARD_RULES].slice(0, 5);

  ctx.textAlign = 'left';
  const ruleFontSize = Math.round(8.5 * sRatio);
  ctx.font = `normal ${ruleFontSize}px ${FONT_BATTAMBANG}`;

  const availableRulesHeight = (by + bh - 40 * sRatio) - curY;
  const ruleGap = Math.min(18 * sRatio, availableRulesHeight / (rules.length || 1));

  for (let i = 0; i < rules.length; i++) {
    const ruleText = rules[i];
    ctx.fillStyle = blue;
    ctx.fillText('•', cx + 2 * sRatio, curY);

    ctx.fillStyle = '#1e293b';
    ctx.fillText(ruleText, cx + 10 * sRatio, curY);
    curY += ruleGap;
  }

  // Footer area: Clean separation and centered barcode (No phone numbers)
  const footerY = by + bh - innerPad - 24 * sRatio;
  ctx.strokeStyle = `${blue}30`;
  ctx.lineWidth = 0.8 * sRatio;
  ctx.beginPath();
  ctx.moveTo(cx, footerY - 4 * sRatio);
  ctx.lineTo(cx + cw, footerY - 4 * sRatio);
  ctx.stroke();

  // Barcode simulation centered cleanly at bottom with safe buffer from bottom border
  if (template.showBackBarcodeOrQr) {
    const barW = Math.round(52 * sRatio);
    const barH = Math.round(13 * sRatio);
    const barX = cx + (cw - barW) / 2;
    const barY = footerY + 2 * sRatio;

    // Draw simulated barcode bars
    ctx.fillStyle = '#0f172a';
    const numBars = 22;
    const step = barW / numBars;
    for (let b = 0; b < numBars; b++) {
      if (b % 3 !== 0) {
        ctx.fillRect(barX + b * step, barY, step * 0.65, barH);
      }
    }
    ctx.font = `bold ${Math.round(7 * sRatio)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.fillText('MOEYS-ID', barX + barW / 2, barY + barH + 6 * sRatio);
  }

  return canvas;
}

/**
 * Dedicated Landscape Card Renderer (e.g. 86mm x 54mm CR80)
 * Photo Box measures strictly 30mm x 40mm (3.0 cm x 4.0 cm).
 */
async function renderLandscapeFrontCard(
  ctx: CanvasRenderingContext2D,
  student: Partial<Student> | undefined,
  template: CardTemplate,
  scale: number,
  sRatio: number,
  cx: number,
  cy: number,
  cw: number,
  _ch: number,
  blue: string
) {
  // 1. Photo Box on Left: EXACT 30mm x 40mm (3.0 cm x 4.0 cm)
  const photoW = Math.round((template.photoBoxWidthMm || 30) * scale);
  const photoH = Math.round((template.photoBoxHeightMm || 40) * scale);
  const photoX = cx + 8 * sRatio;
  const photoY = cy + 8 * sRatio;

  ctx.strokeStyle = blue;
  ctx.lineWidth = 1.2 * sRatio;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  if (student?.photoUrl) {
    try {
      const studentPhoto = await loadImage(student.photoUrl);
      ctx.drawImage(studentPhoto, photoX, photoY, photoW, photoH);
    } catch (e) {}
  } else {
    ctx.fillStyle = blue;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(13 * sRatio)}px sans-serif`;
    ctx.fillText(template.photoBoxText || '3 x 4', photoX + photoW / 2, photoY + photoH / 2);
    ctx.textBaseline = 'top';
  }

  // Label under photo: អត្តលេខៈ / លេខៈ
  const cardIdText = student?.studentId || (student?.cardNumber ? toKhmerNumerals(student.cardNumber) : '');
  ctx.fillStyle = blue;
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.round(10 * sRatio)}px ${FONT_BATTAMBANG}`;
  if (cardIdText) {
    ctx.fillText(`អត្តលេខៈ ${cardIdText}`, photoX + photoW / 2, photoY + photoH + 5 * sRatio);
  } else {
    ctx.fillText(`អត្តលេខៈ ...........`, photoX + photoW / 2, photoY + photoH + 5 * sRatio);
  }

  // 2. Right Side: Headers, Student Details, and Signatures
  const rx = photoX + photoW + 12 * sRatio;
  const rw = cx + cw - rx - 4 * sRatio;
  let curY = cy + 4 * sRatio;

  // Header 1: ព្រះរាជាណាចក្រកម្ពុជា
  const fMoul1 = Math.round(10.5 * sRatio);
  ctx.textAlign = 'center';
  ctx.font = `normal ${fMoul1}px ${FONT_MOUL}`;
  ctx.fillText(template.countryHeaderKm1, rx + rw / 2, curY);

  // Header 2: ជាតិ សាសនា ព្រះមហាក្សត្រ
  curY += fMoul1 + 3 * sRatio;
  const fMoul2 = Math.round(9.5 * sRatio);
  ctx.font = `normal ${fMoul2}px ${FONT_MOUL}`;
  ctx.fillText(template.countryHeaderKm2, rx + rw / 2, curY);

  // Flourish / Divider
  curY += fMoul2 + 2.5 * sRatio;
  const flW = Math.min(130 * sRatio, rw * 0.75);
  const flH = 10 * sRatio;
  try {
    const flImg = await loadImage(resolveFlourishUrl(template.flourishUrl));
    ctx.drawImage(flImg, rx + (rw - flW) / 2, curY, flW, flH);
  } catch (e) {
    drawDottedLine(ctx, rx + rw * 0.25, curY + 4 * sRatio, rx + rw * 0.75, blue, 1 * sRatio);
  }
  curY += flH + 3 * sRatio;

  // Ministry & School (Logo level with text)
  const logoH = 22 * sRatio;
  const logoW = Math.round(logoH * 0.77);
  try {
    const emblemImg = await loadImage(template.emblemUrl || getMoeysEmblemUrl());
    ctx.drawImage(emblemImg, rx, curY, logoW, logoH);
  } catch (e) {}

  const deptX = rx + logoW + 4 * sRatio;
  ctx.textAlign = 'left';
  ctx.font = `bold ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
  ctx.fillText(template.ministryDepartment, deptX, curY);

  const displaySchoolName = template.schoolNameOnly
    ? template.schoolNameOnly.replace(/^អនុ[\/\s]*វិទ្យាល័យ\s*/, '')
    : '';
  ctx.font = `normal ${Math.round(8.5 * sRatio)}px ${FONT_BATTAMBANG}`;
  ctx.fillText('អនុ/វិទ្យាល័យ', deptX, curY + 11 * sRatio);
  const sLabelW = ctx.measureText('អនុ/វិទ្យាល័យ').width;
  if (displaySchoolName) {
    ctx.font = `bold ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(displaySchoolName, deptX + sLabelW + 3 * sRatio, curY + 11 * sRatio);
  }
  curY += logoH + 4 * sRatio;

  // Title: អត្តសញ្ញាណប័ណ្ណសិស្ស
  const fTitle = Math.round(11 * sRatio);
  ctx.textAlign = 'center';
  ctx.font = `normal ${fTitle}px ${FONT_MOUL}`;
  ctx.fillText(template.cardTitleKm, rx + rw / 2, curY);
  curY += fTitle + 5 * sRatio;

  // Student Details Rows
  const fDetail = Math.round(9 * sRatio);
  const rowGap = 13 * sRatio;
  ctx.textAlign = 'left';

  // Row 1: គោត្តនាម-នាម
  ctx.font = `normal ${fDetail}px ${FONT_BATTAMBANG}`;
  ctx.fillText('គោត្តនាម-នាមៈ', rx, curY);
  const nW = ctx.measureText('គោត្តនាម-នាមៈ').width;
  if (student?.nameKm) {
    ctx.font = `bold ${Math.round(11 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(student.nameKm, rx + nW + 4 * sRatio, curY - 0.5 * sRatio);
  } else {
    drawDottedLine(ctx, rx + nW + 4 * sRatio, curY + fDetail, rx + rw, blue, 1 * sRatio);
  }
  curY += rowGap;

  // Row 2: ភេទ | សញ្ជាតិ | ថ្នាក់ទី
  ctx.font = `normal ${fDetail}px ${FONT_BATTAMBANG}`;
  ctx.fillText('ភេទ', rx, curY);
  const gW = ctx.measureText('ភេទ').width;
  ctx.font = `bold ${Math.round(9.5 * sRatio)}px ${FONT_BATTAMBANG}`;
  ctx.fillText(student?.gender || '...', rx + gW + 2 * sRatio, curY);

  const colNatX = rx + rw * 0.35;
  ctx.font = `normal ${fDetail}px ${FONT_BATTAMBANG}`;
  ctx.fillText('សញ្ជាតិ', colNatX, curY);
  const natW = ctx.measureText('សញ្ជាតិ').width;
  ctx.font = `bold ${Math.round(9.5 * sRatio)}px ${FONT_BATTAMBANG}`;
  ctx.fillText(student?.nationality || 'ខ្មែរ', colNatX + natW + 2 * sRatio, curY);

  const colClassX = rx + rw * 0.70;
  ctx.font = `normal ${fDetail}px ${FONT_BATTAMBANG}`;
  ctx.fillText('ថ្នាក់ទី', colClassX, curY);
  const clW = ctx.measureText('ថ្នាក់ទី').width;
  ctx.font = `bold ${Math.round(10 * sRatio)}px sans-serif`;
  ctx.fillText(student?.class ? toArabicNumerals(student.class) : '...', colClassX + clW + 2 * sRatio, curY);
  curY += rowGap;

  // Row 3: ថ្ងៃខែឆ្នាំកំណើត
  const dobVal = student?.dateOfBirth ? toArabicNumerals(student.dateOfBirth) : '';
  ctx.font = `normal ${fDetail}px ${FONT_BATTAMBANG}`;
  ctx.fillText('ថ្ងៃខែឆ្នាំកំណើតៈ', rx, curY);
  const dW = ctx.measureText('ថ្ងៃខែឆ្នាំកំណើតៈ').width;
  if (dobVal) {
    ctx.font = `bold ${Math.round(10 * sRatio)}px sans-serif`;
    ctx.fillText(dobVal, rx + dW + 4 * sRatio, curY);
  } else {
    drawDottedLine(ctx, rx + dW + 4 * sRatio, curY + fDetail, rx + rw, blue, 1 * sRatio);
  }
  curY += rowGap;

  // Row 4: ទីលំនៅបច្ចុប្បន្ន
  ctx.font = `normal ${fDetail}px ${FONT_BATTAMBANG}`;
  ctx.fillText('ទីលំនៅៈ', rx, curY);
  const aW = ctx.measureText('ទីលំនៅៈ').width;
  if (student?.address) {
    ctx.font = `normal ${Math.round(8.5 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(student.address, rx + aW + 4 * sRatio, curY);
  } else {
    drawDottedLine(ctx, rx + aW + 4 * sRatio, curY + fDetail, rx + rw, blue, 1 * sRatio);
  }
  curY += rowGap + 3 * sRatio;

  // Footer: Signatures
  const fFoot = Math.round(8.5 * sRatio);
  ctx.textAlign = 'left';
  ctx.font = `normal ${fFoot}px ${FONT_BATTAMBANG}`;
  ctx.fillText(`${template.issueDateLine || 'ថ្ងៃទី...ខែ...ឆ្នាំ២០...'}`, rx, curY);
  ctx.font = `bold ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
  ctx.fillText(`${template.directorTitle || 'នាយក'}: ${template.directorName || 'ជា សារ៉ា'}`, rx, curY + 11 * sRatio);

  ctx.textAlign = 'right';
  ctx.font = `medium ${fFoot}px ${FONT_BATTAMBANG}`;
  ctx.fillText(template.signatureTitle || 'ហត្ថលេខាសាមីខ្លួន', rx + rw, curY);
  if (student?.nameKm) {
    ctx.font = `bold ${Math.round(9 * sRatio)}px ${FONT_BATTAMBANG}`;
    ctx.fillText(student.nameKm, rx + rw, curY + 11 * sRatio);
  }
}


