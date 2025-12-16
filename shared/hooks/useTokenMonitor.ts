/**
 * Custom Hook: useTokenMonitor
 * Monitor token/session expiry dan auto logout ketika expired
 * 
 * Features:
 * - Check token expiry setiap interval tertentu
 * - Show warning toast ketika mendekati expiry
 * - Auto logout ketika token expired
 * - Clear all cookies and session data
 * - Replace browser history to prevent back button access
 * 
 * Note: Monitors BOTH iDempiere token AND NextAuth session expiry
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';

// ============================================
// CONFIGURATION (TESTING - 1 minute session)
// ============================================

const CHECK_INTERVAL = 5 * 1000; // Check setiap 5 detik (untuk testing)
const WARNING_THRESHOLD = 30; // Warning 30 detik sebelum expiry
const CRITICAL_THRESHOLD = 15; // Critical warning 15 detik sebelum expiry

// Production settings (uncomment untuk production):
// const CHECK_INTERVAL = 30 * 1000; // Check setiap 30 detik
// const WARNING_THRESHOLD = 5 * 60; // Warning 5 menit sebelum expiry
// const CRITICAL_THRESHOLD = 60; // Critical 1 menit sebelum expiry

/**
 * Clear all cookies related to auth
 */
function clearAuthCookies() {
  // Get all cookies and delete them
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    
    // Delete cookie for all paths
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
  }
  
  console.log('🧹 All auth cookies cleared');
}

/**
 * Clear browser storage
 */
function clearStorage() {
  try {
    // Clear localStorage items related to auth
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('session') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.log('🧹 Storage cleared');
  } catch (e) {
    console.warn('Failed to clear storage:', e);
  }
}

export function useTokenMonitor() {
  const { data: session, status } = useSession();
  
  // State untuk tracking
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  // Track warning states to avoid duplicate toasts
  const warningShown = useRef(false);
  const criticalShown = useRef(false);
  const logoutInitiated = useRef(false);
  const sessionStartTime = useRef<number | null>(null);

  const handleLogout = useCallback(async () => {
    if (logoutInitiated.current) return;
    logoutInitiated.current = true;

    console.warn('🚪 Session/Token expired. Initiating logout...');
    
    // Show toast before logout
    toast.error('Sesi Anda telah berakhir. Mengalihkan ke halaman login...', {
      duration: 3000,
    });

    // Clear all auth-related data
    clearAuthCookies();
    clearStorage();

    // Small delay to ensure toast is shown and cleanup is done
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sign out and replace history so user can't go back
    await signOut({ 
      redirect: false, // Don't let NextAuth handle redirect
    });

    // Replace current history entry and navigate to sign-in
    // This prevents user from using back button to return
    window.location.replace('/sign-in');
  }, []);

  useEffect(() => {
    // Only monitor if user is authenticated
    if (status !== 'authenticated' || !session) {
      // Reset flags when not authenticated
      warningShown.current = false;
      criticalShown.current = false;
      logoutInitiated.current = false;
      sessionStartTime.current = null;
      return;
    }

    // Record session start time jika belum ada
    if (!sessionStartTime.current) {
      sessionStartTime.current = Math.floor(Date.now() / 1000);
      console.log('📝 Session started at:', new Date().toLocaleTimeString());
    }

    const checkExpiry = () => {
      if (logoutInitiated.current) return;

      const now = Math.floor(Date.now() / 1000);
      
      // Check iDempiere token expiry (from session.user.tokenExpiry)
      const idempiereTokenExpiry = session.user?.tokenExpiry || 0;
      const idempiereTimeLeft = idempiereTokenExpiry - now;
      
      // Check NextAuth session expiry (session.expires is ISO string)
      let nextAuthTimeLeft = Infinity;
      if (session.expires) {
        const nextAuthExpiry = Math.floor(new Date(session.expires).getTime() / 1000);
        nextAuthTimeLeft = nextAuthExpiry - now;
      }
      
      // Use the shorter of the two
      const effectiveTimeLeft = Math.min(idempiereTimeLeft, nextAuthTimeLeft);
      
      setTimeRemaining(Math.max(0, effectiveTimeLeft));

      // Debug log
      console.log('🔍 Session monitor:', {
        idempiereExpiry: idempiereTokenExpiry > 0 ? new Date(idempiereTokenExpiry * 1000).toLocaleTimeString() : 'N/A',
        idempiereTimeLeft: idempiereTimeLeft > 0 ? `${idempiereTimeLeft}s` : 'EXPIRED',
        nextAuthExpiry: session.expires ? new Date(session.expires).toLocaleTimeString() : 'N/A',
        nextAuthTimeLeft: nextAuthTimeLeft !== Infinity ? `${nextAuthTimeLeft}s` : 'N/A',
        effectiveTimeLeft: `${effectiveTimeLeft}s`,
        now: new Date().toLocaleTimeString(),
      });

      // Session/Token sudah expired - logout segera
      if (effectiveTimeLeft <= 0) {
        console.warn('⛔ Session/Token EXPIRED!');
        handleLogout();
        return;
      }

      // Critical warning (15 detik sebelum expiry)
      if (effectiveTimeLeft <= CRITICAL_THRESHOLD && !criticalShown.current) {
        console.warn('🔴 Critical: Session akan berakhir dalam', effectiveTimeLeft, 'detik');
        toast.error(`⚠️ Sesi akan berakhir dalam ${effectiveTimeLeft} detik!`, {
          duration: 10000,
          id: 'token-critical',
        });
        criticalShown.current = true;
      }
      // Warning (30 detik sebelum expiry)
      else if (effectiveTimeLeft <= WARNING_THRESHOLD && !warningShown.current) {
        console.warn('🟡 Warning: Session akan berakhir dalam', effectiveTimeLeft, 'detik');
        toast.warning(`Sesi Anda akan berakhir dalam ${effectiveTimeLeft} detik`, {
          duration: 10000,
          id: 'token-warning',
        });
        warningShown.current = true;
      }
    };

    // Initial check
    checkExpiry();

    // Setup interval untuk periodic check
    const intervalId = setInterval(checkExpiry, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [session, status, handleLogout]);

  // Return useful info for components that need it
  return {
    tokenExpiry: session?.user?.tokenExpiry,
    sessionExpiry: session?.expires ? new Date(session.expires).getTime() / 1000 : null,
    isAuthenticated: status === 'authenticated',
    timeRemaining,
  };
}
