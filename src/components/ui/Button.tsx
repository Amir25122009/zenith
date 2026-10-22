import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#2D5A3D] text-white hover:bg-[#1e3d2a] focus:ring-[#2D5A3D] shadow-sm',
    secondary: 'bg-[#F3F4F6] text-[#1A1A1A] hover:bg-[#E5E7EB] focus:ring-[#9CA3AF]',
    ghost: 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] focus:ring-[#9CA3AF]',
    danger: 'bg-[#B45555] text-white hover:bg-[#943c3c] focus:ring-[#B45555] shadow-sm',
    outline: 'border border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] focus:ring-[#2D5A3D]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
