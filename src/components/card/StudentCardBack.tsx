import React from 'react';
import { CardTemplate } from '../../types/template';
import { MOEYS_EMBLEM_DATA_URI } from '../../utils/assets';
import { DEFAULT_STUDENT_CARD_RULES } from '../../db/defaultTemplates';

interface StudentCardBackProps {
  template: CardTemplate;
  scale?: number;
  className?: string;
  showCuttingBorder?: boolean;
}

export const StudentCardBack: React.FC<StudentCardBackProps> = ({
  template,
  scale = 1,
  className = '',
  showCuttingBorder = true,
}) => {
  const cardW = template.cardWidthMm || 64;
  const cardH = template.cardHeightMm || 92;
  const isLandscape = cardW > cardH;
  const baseWidth = Math.round(cardW * 5);
  const baseHeight = Math.round(cardH * 5);
  const exactMarginPx =
    !isLandscape && template.whiteMarginMm && template.whiteMarginMm > 0
      ? template.whiteMarginMm * 5
      : 0;
  const s = isLandscape
    ? baseWidth / 430
    : exactMarginPx
    ? (baseWidth - 2 * exactMarginPx) / 308
    : baseWidth / 320;
  const outerPadPx = exactMarginPx || Math.round(6 * s);
  const blueColor = template.primaryColor || '#163d7e';
  const layout = template.backLayout || 'rules-and-emblem';
  const emblemSizePx = Math.round((Math.min(baseWidth, baseHeight) * (template.backEmblemSizePercent || 52)) / 100);

  const emblemSource =
    template.emblemUrl &&
    !template.emblemUrl.includes('moeys_emblem.svg') &&
    (template.emblemUrl.startsWith('data:') || template.emblemUrl.startsWith('http'))
      ? template.emblemUrl
      : MOEYS_EMBLEM_DATA_URI;

  // Enforce strictly 5 standard MoEYS student card rules (guarantee exactly 5 by backfilling from default)
  const userRules = (template.backRulesText || []).filter((r) => typeof r === 'string' && r.trim().length > 0);
  const rules = [...userRules, ...DEFAULT_STUDENT_CARD_RULES].slice(0, 5);

  const displaySchool = template.schoolNameOnly || 'សាលារៀនចំណេះទូទៅ';

  return (
    <div
      style={{ width: `${baseWidth * scale}px`, height: `${baseHeight * scale}px` }}
      className={`relative shrink-0 select-none overflow-hidden ${className}`}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          padding: `${outerPadPx}px`,
          outline: showCuttingBorder ? '1px dashed #cbd5e1' : undefined,
          outlineOffset: '-1px',
        }}
        className="relative bg-white font-battambang box-border"
      >
        {layout === 'emblem-only' ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            {template.showBackEmblem && (
              <img
                src={emblemSource}
                alt="Emblem"
                style={{ width: `${emblemSizePx}px`, height: `${emblemSizePx * 1.15}px` }}
                className="object-contain filter drop-shadow-sm"
              />
            )}
          </div>
        ) : (
          <div
            style={{
              borderColor: blueColor,
              borderWidth: `${Math.max(1, 1.2 * s)}px`,
              padding: `${Math.round(6 * s)}px`,
              color: blueColor,
            }}
            className="w-full h-full border border-solid flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: `${blueColor}25` }}>
              <img
                src={emblemSource}
                alt="Logo"
                style={{ width: `${Math.round(22 * s)}px`, height: `${Math.round(28 * s)}px` }}
                className="object-contain shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-moul truncate tracking-wide" style={{ fontSize: `${Math.round(9.5 * s)}px`, lineHeight: `${Math.round(14 * s)}px` }}>
                  {template.ministryDepartment || 'ក្រសួងអប់រំ យុវជន និងកីឡា'}
                </div>
                <div className="font-battambang font-bold truncate text-slate-700" style={{ fontSize: `${Math.round(8.5 * s)}px`, lineHeight: `${Math.round(13 * s)}px` }}>
                  {displaySchool}
                </div>
              </div>
            </div>

            <div className="text-center my-1">
              <div
                className="font-moul tracking-wide inline-block pb-0.5 border-b-2"
                style={{ fontSize: `${Math.round(10 * s)}px`, lineHeight: `${Math.round(15 * s)}px`, borderColor: blueColor }}
              >
                បទបញ្ជាទូទៅសម្រាប់សិស្ស
              </div>
            </div>

            {/* Exactly 5 Rules displayed */}
            <div className="space-y-1.5 flex-1 my-1 overflow-hidden" style={{ fontSize: `${Math.round(8.5 * s)}px`, lineHeight: `${Math.round(13 * s)}px` }}>
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-1 text-slate-800 text-left">
                  <span className="shrink-0 font-bold" style={{ color: blueColor }}>•</span>
                  <span className="leading-tight line-clamp-2">{rule}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 mt-auto border-t flex items-center justify-center" style={{ borderColor: `${blueColor}25` }}>
              {template.showBackBarcodeOrQr && (
                <div className="shrink-0 flex flex-col items-center">
                  <div className="flex items-end gap-[1.5px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200" style={{ height: `${Math.round(18 * s)}px` }}>
                    {[16, 20, 14, 20, 10, 18, 20, 12, 16, 20, 14, 18, 20, 15, 20].map((h, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 rounded-sm"
                        style={{ width: `${Math.max(1, Math.round(1.2 * s))}px`, height: `${Math.round((h / 20) * (14 * s))}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-slate-500 tracking-widest mt-0.5 font-bold" style={{ fontSize: `${Math.round(6.5 * s)}px` }}>
                    MOEYS-ID
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
