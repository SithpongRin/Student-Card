import React from 'react';
import { CardTemplate } from '../../types/template';
import { MOEYS_EMBLEM_DATA_URI } from '../../utils/assets';

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
  const baseWidth = Math.round(cardW * 5);
  const baseHeight = Math.round(cardH * 5);

  const emblemSizePx = Math.round((Math.min(baseWidth, baseHeight) * (template.backEmblemSizePercent || 52)) / 100);

  return (
    <div
      style={{
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
      }}
      className={`relative shrink-0 select-none overflow-hidden ${className}`}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className={`relative bg-white flex items-center justify-center box-border ${
          showCuttingBorder ? 'border border-dashed border-slate-300' : ''
        }`}
      >
        {/* Centered MoEYS Emblem (Exact reproduction of Reference Image 2) */}
        {template.showBackEmblem && (
          <div className="flex items-center justify-center p-4">
            <img
              src={
                template.emblemUrl && !template.emblemUrl.includes('moeys_emblem.svg') && (template.emblemUrl.startsWith('data:') || template.emblemUrl.startsWith('http'))
                  ? template.emblemUrl
                  : MOEYS_EMBLEM_DATA_URI
              }
              alt="Ministry of Education, Youth and Sport Emblem (Cambodia)"
              style={{
                width: `${emblemSizePx}px`,
                height: `${emblemSizePx * 1.15}px`,
              }}
              className="object-contain filter drop-shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};
