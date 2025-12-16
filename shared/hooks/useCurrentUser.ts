/**
 * useCurrentUser Hook - Single Source of Truth for User Data
 * 
 * This hook provides a centralized way to access the current user's data
 * from NextAuth session. It should be used instead of accessing Redux state
 * for user profile information.
 * 
 * IMPORTANT: User data should come from NextAuth session (cookie-based),
 * NOT from Redux store. Redux should only be used for UI state during
 * the login flow.
 * 
 * @module shared/hooks/useCurrentUser
 */

'use client';

import { useSession } from "next-auth/react";
import { useCallback, useSyncExternalStore } from "react";
import type { IDempiereUser } from "@/types/next-auth";

// ============================================
// TYPES
// ============================================

export interface CurrentUserData {
  /** User ID from iDempiere */
  id: string;
  /** User's display name */
  name: string;
  /** User's email */
  email: string;
  /** Selected Client/Tenant ID */
  clientId: number;
  /** Selected Client/Tenant Name */
  clientName: string;
  /** Selected Role ID */
  roleId: number;
  /** Selected Role Name */
  roleName: string;
  /** Selected Organization ID */
  organizationId: number;
  /** Selected Organization Name */
  organizationName: string;
  /** Selected Warehouse ID (optional) */
  warehouseId?: number;
  /** Selected Warehouse Name */
  warehouseName?: string;
  /** User's preferred language */
  language: string;
}

export interface TokenInfo {
  /** iDempiere JWT token for API calls */
  token: string;
  /** Token expiry timestamp (Unix seconds) */
  expiresAt: number;
  /** Whether token is still valid */
  isValid: boolean;
  /** Whether token is expiring soon (within 5 minutes) */
  isExpiringSoon: boolean;
  /** Time remaining until expiry (in seconds) */
  timeRemaining: number;
  /** Refresh token (if available) */
  refreshToken?: string;
}

export interface UseCurrentUserReturn {
  /** Current user data (null if not authenticated) */
  user: CurrentUserData | null;
  /** Full user object from session (includes token) */
  fullUser: IDempiereUser | null;
  /** Token information (call getTokenInfo() for real-time values) */
  tokenInfo: TokenInfo | null;
  /** Whether session is loading */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Session status from NextAuth */
  status: 'loading' | 'authenticated' | 'unauthenticated';
  /** Helper to get display name for header/sidebar */
  displayName: string;
  /** Helper to get organization context string */
  contextString: string;
  /** Get fresh token info (with real-time validity check) */
  getTokenInfo: () => TokenInfo | null;
}

// ============================================
// CONSTANTS
// ============================================

const TOKEN_EXPIRY_SOON_THRESHOLD = 5 * 60; // 5 minutes in seconds

// ============================================
// HELPER: Time subscription for real-time updates
// ============================================

/**
 * Subscribe to time updates (every minute)
 * Used with useSyncExternalStore for time-based reactivity
 */
function subscribeToTime(callback: () => void) {
  const intervalId = setInterval(callback, 60 * 1000);
  return () => clearInterval(intervalId);
}

function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate token info from session data and current time
 */
function calculateTokenInfo(
  idempiereToken: string | undefined,
  tokenExpiry: number | undefined,
  refreshToken: string | undefined,
  now: number
): TokenInfo | null {
  if (!idempiereToken) {
    return null;
  }
  
  const expiresAt = tokenExpiry || 0;
  const timeRemaining = Math.max(0, expiresAt - now);
  const isValid = timeRemaining > 0;
  const isExpiringSoon = timeRemaining > 0 && timeRemaining <= TOKEN_EXPIRY_SOON_THRESHOLD;
  
  return {
    token: idempiereToken,
    expiresAt,
    isValid,
    isExpiringSoon,
    timeRemaining,
    refreshToken,
  };
}

/**
 * Extract user data from session
 */
function extractUserData(sessionUser: IDempiereUser | undefined): CurrentUserData | null {
  if (!sessionUser) {
    return null;
  }
  
  return {
    id: sessionUser.id || '',
    name: sessionUser.name || '',
    email: sessionUser.email || '',
    clientId: sessionUser.clientId || 0,
    clientName: sessionUser.clientName || '',
    roleId: sessionUser.roleId || 0,
    roleName: sessionUser.roleName || '',
    organizationId: sessionUser.organizationId || 0,
    organizationName: sessionUser.organizationName || '',
    warehouseId: sessionUser.warehouseId,
    warehouseName: sessionUser.warehouseName || '',
    language: sessionUser.language || 'en_US',
  };
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Hook to access current user data from NextAuth session
 * 
 * @returns {UseCurrentUserReturn} Current user data and helpers
 * 
 * @example
 * ```tsx
 * function Header() {
 *   const { user, isAuthenticated, displayName } = useCurrentUser();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginButton />;
 *   }
 *   
 *   return <span>Welcome, {displayName}</span>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function ProductionPage() {
 *   const { user, getTokenInfo, contextString } = useCurrentUser();
 *   
 *   // Use user data for display
 *   console.log('Current context:', contextString);
 *   // Output: "PANARUB GROUP > BIG Production"
 *   
 *   // Check token validity before API calls (real-time)
 *   const tokenInfo = getTokenInfo();
 *   if (tokenInfo?.isExpiringSoon) {
 *     showWarning('Session expiring soon');
 *   }
 * }
 * ```
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const { data: session, status } = useSession();
  
  // Subscribe to time changes for token validity updates
  const now = useSyncExternalStore(
    subscribeToTime,
    getCurrentTimestamp,
    getCurrentTimestamp // Server snapshot
  );
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  
  // Get session user with proper type
  const sessionUser = session?.user as IDempiereUser | undefined;
  
  // Extract user data
  const user = isAuthenticated ? extractUserData(sessionUser) : null;
  
  // Full user object
  const fullUser = isAuthenticated && sessionUser ? sessionUser : null;
  
  // Token info (calculated with current time from useSyncExternalStore)
  const tokenInfo = isAuthenticated 
    ? calculateTokenInfo(
        sessionUser?.idempiereToken,
        sessionUser?.tokenExpiry,
        sessionUser?.refreshToken,
        now
      )
    : null;
  
  // Function to get fresh token info (for on-demand checks)
  const getTokenInfo = useCallback((): TokenInfo | null => {
    if (!isAuthenticated || !sessionUser?.idempiereToken) {
      return null;
    }
    return calculateTokenInfo(
      sessionUser.idempiereToken,
      sessionUser.tokenExpiry,
      sessionUser.refreshToken,
      Math.floor(Date.now() / 1000)
    );
  }, [isAuthenticated, sessionUser]);
  
  // Helper: Display name for UI
  const displayName = user?.name || user?.email || 'Guest';
  
  // Helper: Context string (Client > Organization)
  const contextString = user 
    ? [user.clientName, user.organizationName].filter(Boolean).join(' > ') || 'No context selected'
    : '';
  
  return {
    user,
    fullUser,
    tokenInfo,
    isLoading,
    isAuthenticated,
    status,
    displayName,
    contextString,
    getTokenInfo,
  };
}

// ============================================
// ADDITIONAL UTILITY HOOKS
// ============================================

/**
 * Hook to check if user has specific role
 * 
 * @param roleId - Role ID to check
 * @returns boolean - true if user has the role
 */
export function useHasRole(roleId: number): boolean {
  const { user } = useCurrentUser();
  return user?.roleId === roleId;
}

/**
 * Hook to check if user belongs to specific organization
 * 
 * @param orgId - Organization ID to check
 * @returns boolean - true if user belongs to the organization
 */
export function useIsInOrganization(orgId: number): boolean {
  const { user } = useCurrentUser();
  return user?.organizationId === orgId;
}

/**
 * Hook to check if user belongs to specific client/tenant
 * 
 * @param clientId - Client ID to check
 * @returns boolean - true if user belongs to the client
 */
export function useIsInClient(clientId: number): boolean {
  const { user } = useCurrentUser();
  return user?.clientId === clientId;
}

/**
 * Hook to get iDempiere token for API calls
 * ONLY use this when you need the actual token (rare cases)
 * 
 * @returns Token string or null
 */
export function useIDempiereToken(): string | null {
  const { tokenInfo } = useCurrentUser();
  return tokenInfo?.isValid ? tokenInfo.token : null;
}

export default useCurrentUser;
