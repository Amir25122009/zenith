import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#F3F4F6] text-[#6B7280]',
    success: 'bg-[#ECFDF5] text-[#2D5A3D]',
    warning: 'bg-[#FFF7ED] text-[#92400E]',
    error: 'bg-[#FEF2F2] text-[#B45555]',
    accent: 'bg-[#FDF8EF] text-[#92700E]',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
