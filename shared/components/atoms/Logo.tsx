/**
 * Atomic Design - Atoms
 * Logo Component
 */

import { cn } from '@/shared/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isCollapsed?: boolean;
  showCompanyName?: boolean;
}

export function Logo({ className, size = 'md', isCollapsed = false, showCompanyName = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[12px]',
    lg: 'text-xs',
  };

  
  return (
    <div className={cn('flex items-center gap-2', showCompanyName && !isCollapsed ? 'w-full' : '', className)}>
      <div className={cn('relative shrink-0', sizeClasses[size])}>
        <Image
          src="/logo.png"
          alt="PT Bintang Indokarya Gemilang"
          width={100}
          height={100}
          priority
          className="h-full w-full object-contain"
        />
      </div>
      {showCompanyName && !isCollapsed && (
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span className={cn(
            'font-bold text-foreground leading-tight truncate',
            textSizeClasses[size]
          )}>
            PT BINTANG INDOKARYA GEMILANG
          </span>
          
        </div>
      )}
    </div>
  );
}


