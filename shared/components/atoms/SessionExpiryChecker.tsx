'use client';

import { useTokenMonitor } from '@/shared/hooks/useTokenMonitor';

/**
 * SessionExpiryChecker Component
 * 
 * Monitors token/session expiry and handles auto-logout with toast notifications.
 * Simply uses useTokenMonitor hook which does all the heavy lifting.
 */
export function SessionExpiryChecker() {
  // Use the token monitor hook - it handles everything
  const { timeRemaining, isAuthenticated } = useTokenMonitor();

  // Debug: Log time remaining to console
  if (isAuthenticated && timeRemaining > 0 && timeRemaining <= 60) {
    console.log(`⏱️ Session expires in: ${timeRemaining}s`);
  }

  return null;
}
