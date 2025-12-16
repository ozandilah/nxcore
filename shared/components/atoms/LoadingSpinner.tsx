/**
 * Atomic Design - Atoms
 * Loading Spinner Component
 */

import { cn } from '@/shared/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 sm:h-8 sm:w-8 border-2 sm:border-3',
    lg: 'h-10 w-10 sm:h-12 sm:w-12 border-3 sm:border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}


