import React from 'react';
import clsx from 'clsx';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-full gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-full gap-2',
    lg: 'text-base px-6 py-3 rounded-full gap-2.5 shadow-sm',
  };

  const variantClasses = {
    primary:
      'bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#0062c4] shadow-[0_1px_2px_rgba(0,113,227,0.2)]',
    secondary:
      'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] active:bg-[#dedee3] border border-black/[0.04]',
    ghost:
      'bg-transparent text-[#1d1d1f] hover:bg-black/[0.05] active:bg-black/[0.08]',
    danger:
      'bg-[#ff3b30] text-white hover:bg-[#ff453a] active:bg-[#d70015] shadow-[0_1px_2px_rgba(255,59,48,0.2)]',
  };

  return (
    <button
      className={clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
