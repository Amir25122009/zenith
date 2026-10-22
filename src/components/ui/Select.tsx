import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1A1A1A] text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent',
          'transition-all duration-200',
          error && 'border-[#B45555] focus:ring-[#B45555]',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-[#B45555]">{error}</p>}
    </div>
  );
}
