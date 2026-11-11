import React, { useEffect, useState } from 'react';
import { Student } from '../../types/student';
import { CardTemplate } from '../../types/template';
import { renderFrontCardToCanvas, renderBackCardToCanvas } from '../../services/CardCanvasRenderer';

interface CanvasCardImageProps {
  side: 'front' | 'back';
  student?: Partial<Student>;
  template: CardTemplate;
  /** Display scale: 1 = 5 CSS px per mm (same sizing as the old DOM preview). */
  scale?: number;
  className?: string;
  showCuttingBorder?: boolean;
}

/**
 * Card preview drawn by the SAME canvas renderer that produces the PDF, so the on-screen
 * preview and the exported PDF are always identical (fonts, positions, sizes).
 */
export const CanvasCardImage: React.FC<CanvasCardImageProps> = ({
  side,
  student,
  template,
  scale = 1,
  className = '',
  showCuttingBorder = true,
}) => {
  const widthMm = template.cardWidthMm || 64;
  const heightMm = template.cardHeightMm || 92;
  const displayW = widthMm * 5 * scale;
  const displayH = heightMm * 5 * scale;

  // Render at roughly 2× the device pixels shown on screen (crisp, but cheaper than 300 DPI)
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const dpi = Math.min(300, Math.max(120, Math.ceil(((displayW * dpr * 2) / widthMm) * 25.4)));

  const [src, setSrc] = useState<string>('');

  // Re-render only when the inputs that affect the drawing change
  const key = JSON.stringify({ side, student: side === 'front' ? student ?? null : null, template, dpi });

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const canvas =
          side === 'front'
            ? await renderFrontCardToCanvas(student, template, { dpi })
            : await renderBackCardToCanvas(template, { dpi });
        if (!cancelled) setSrc(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Card preview render failed:', e);
      }
    }, 60); // small debounce while typing in the designer
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div
      style={{
        width: `${displayW}px`,
        height: `${displayH}px`,
        outline: showCuttingBorder ? '1px dashed #cbd5e1' : undefined,
        outlineOffset: '-1px',
      }}
      className={`relative shrink-0 select-none overflow-hidden bg-white ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={side === 'front' ? 'Student card front' : 'Student card back'}
          draggable={false}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      ) : (
        <div className="w-full h-full animate-pulse bg-slate-100" />
      )}
    </div>
  );
};
