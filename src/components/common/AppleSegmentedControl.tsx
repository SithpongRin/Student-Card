import React from 'react';
import clsx from 'clsx';

interface Option<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface AppleSegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function AppleSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: AppleSegmentedControlProps<T>) {
  return (
    <div
      className={clsx(
        'inline-flex p-1 bg-[#efeff4] rounded-full border border-black/[0.04] select-none',
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full',
              size === 'sm' ? 'px-3 py-1 text-xs gap-1.5' : 'px-4 py-1.5 text-xs gap-2',
              isSelected
                ? 'bg-white text-[#1d1d1f] shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
