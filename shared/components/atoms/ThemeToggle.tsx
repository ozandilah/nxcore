/**
 * Atomic Design - Atoms
 * Theme Toggle Component
 */

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/ui/button';
import { useState } from 'react';


interface ThemeToggleProps {
  className?: string;
}
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted] = useState(true);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 text-white hover:bg-white/10 transition-all"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-white" />
      ) : (
        <Moon className={`h-5 w-5 ${className}`} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


