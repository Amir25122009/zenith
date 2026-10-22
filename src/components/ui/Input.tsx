import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1A1A1A] text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent',
          'placeholder:text-[#9CA3AF] transition-all duration-200',
          error && 'border-[#B45555] focus:ring-[#B45555]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#B45555]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#1A1A1A] text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent',
          'placeholder:text-[#9CA3AF] transition-all duration-200 resize-none',
          error && 'border-[#B45555] focus:ring-[#B45555]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#B45555]">{error}</p>}
    </div>
  );
}
