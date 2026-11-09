import React from 'react';
import clsx from 'clsx';

interface AppleBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const AppleBadge: React.FC<AppleBadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  className,
}) => {
  const variantClasses = {
    blue: 'bg-[#e8f2ff] text-[#0071e3] border-[#cce4ff]',
    green: 'bg-[#edf9f0] text-[#34c759] border-[#c8eed0]',
    orange: 'bg-[#fff5e9] text-[#ff9500] border-[#ffe4c2]',
    red: 'bg-[#ffefef] text-[#ff3b30] border-[#ffd4d1]',
    gray: 'bg-[#f5f5f7] text-[#6e6e73] border-[#e5e5ea]',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium border',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1 select-none', sizeClasses[size], variantClasses[variant], className)}>
      {children}
    </span>
  );
};
