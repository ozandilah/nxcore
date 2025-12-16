/**
 * Atomic Design - Atoms
 * Form Field Error Component
 */
import { cn } from '@/shared/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-2 text-sm text-destructive animate-fade-in-up',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span className="leading-tight">{message}</span>
    </div>
  );
}


