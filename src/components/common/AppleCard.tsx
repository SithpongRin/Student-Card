import React from 'react';
import clsx from 'clsx';

interface AppleCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  variant?: 'elevated' | 'glass' | 'flat';
  noPadding?: boolean;
}

export const AppleCard: React.FC<AppleCardProps> = ({
  children,
  className,
  title,
  subtitle,
  headerAction,
  variant = 'elevated',
  noPadding = false,
}) => {
  const variantClasses = {
    elevated:
      'bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow duration-300',
    glass:
      'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)]',
    flat:
      'bg-[#f5f5f7] border border-black/[0.04]',
  };

  return (
    <div className={clsx('rounded-2xl overflow-hidden', variantClasses[variant], className)}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]">
          <div>
            {title && <h3 className="text-base font-semibold text-[#1d1d1f] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#86868b] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
