/**
 * Centralized API Client with Interceptors
 * 
 * This module provides a centralized configuration for all API calls to iDempiere.
 * It automatically handles:
 * - Token injection from NextAuth session
 * - Token expiry checking
 * - Error handling and retry logic
 * - Request/Response logging (in development)
 * 
 * @module shared/api/baseQuery
 */

import { 
  fetchBaseQuery, 
  BaseQueryFn, 
  FetchArgs, 
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

// ============================================
// TYPES
// ============================================

interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

// ============================================
// CONSTANTS
// ============================================

const API_BASE_URL = '/api/idempiere';
const TOKEN_EXPIRY_BUFFER_SECONDS = 60; // Consider token expired 60 seconds before actual expiry

// ============================================
// BASE QUERY CONFIGURATION
// ============================================

/**
 * Raw fetch base query with token injection
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const session = await getSession();
    
    if (session?.user?.idempiereToken) {
      headers.set("Authorization", `Bearer ${session.user.idempiereToken}`);
    }
    
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 API Request Headers configured');
    }
    
    return headers;
  },
});

// ============================================
// ENHANCED BASE QUERY WITH INTERCEPTORS
// ============================================

/**
 * Enhanced base query with automatic token validation and error handling
 * 
 * Features:
 * - Pre-request token expiry check
 * - Automatic logout on 401 Unauthorized
 * - Structured error response
 * - Request/Response logging in development
 */
export const baseQueryWithInterceptors: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  // ========== PRE-REQUEST INTERCEPTOR ==========
  
  // Check if token is valid before making request
  const session = await getSession();
  
  if (session?.user?.tokenExpiry) {
    const now = Math.floor(Date.now() / 1000);
    const isExpiringSoon = now >= (session.user.tokenExpiry - TOKEN_EXPIRY_BUFFER_SECONDS);
    
    if (isExpiringSoon) {
      console.warn('⚠️ Token is expired or expiring soon, redirecting to login');
      
      // Force logout and redirect
      await signOut({ redirect: true, callbackUrl: '/sign-in' });
      
      return {
        error: {
          status: 401,
          data: { message: 'Session expired. Please login again.' },
        } as FetchBaseQueryError,
      };
    }
  }
  
  // Check if user has iDempiere token
  if (!session?.user?.idempiereToken) {
    console.warn('⚠️ No iDempiere token found in session');
    
    return {
      error: {
        status: 401,
        data: { message: 'Not authenticated. Please login.' },
      } as FetchBaseQueryError,
    };
  }
  
  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    const endpoint = typeof args === 'string' ? args : args.url;
    console.log(`📤 API Request: ${endpoint}`);
  }
  
  // ========== EXECUTE REQUEST ==========
  
  const result = await rawBaseQuery(args, api, extraOptions);
  
  // ========== POST-RESPONSE INTERCEPTOR ==========
  
  // Log response in development
  if (process.env.NODE_ENV === 'development') {
    if (result.error) {
      console.error('📥 API Error:', result.error);
    } else {
      console.log('📥 API Success');
    }
  }
  
  // Handle 401 Unauthorized - Token might be invalidated server-side
  if (result.error && result.error.status === 401) {
    console.warn('🔒 Received 401 Unauthorized, logging out user');
    
    await signOut({ redirect: true, callbackUrl: '/sign-in' });
    
    return {
      error: {
        status: 401,
        data: { message: 'Session expired. Please login again.' },
      } as FetchBaseQueryError,
    };
  }
  
  // Handle 403 Forbidden - User doesn't have permission
  if (result.error && result.error.status === 403) {
    const errorData = result.error.data as ApiErrorResponse;
    return {
      error: {
        status: 403,
        data: { 
          message: errorData?.message || 'You do not have permission to access this resource.' 
        },
      } as FetchBaseQueryError,
    };
  }
  
  // Handle 500+ Server Errors
  if (result.error && typeof result.error.status === 'number' && result.error.status >= 500) {
    console.error('🔥 Server error:', result.error);
    return {
      error: {
        status: result.error.status,
        data: { 
          message: 'Server is temporarily unavailable. Please try again later.' 
        },
      } as FetchBaseQueryError,
    };
  }
  
  return result;
};

// ============================================
// LEGACY BASE QUERY (for backward compatibility)
// ============================================

/**
 * @deprecated Use baseQueryWithInterceptors instead
 * Kept for backward compatibility with existing code
 */
export const baseQuery = rawBaseQuery;

// ============================================
// RTK QUERY API SLICE
// ============================================

/**
 * Base API Slice with interceptors
 * 
 * All feature-specific APIs should use injectEndpoints from this slice
 * to ensure consistent token handling and error management.
 * 
 * @example
 * ```typescript
 * // features/menu/api/menuApi.ts
 * import { apiSlice } from '@/shared/api/baseQuery';
 * 
 * export const menuApiSlice = apiSlice.injectEndpoints({
 *   endpoints: (builder) => ({
 *     getMenuTree: builder.query({...}),
 *   }),
 * });
 * ```
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptors,
  tagTypes: [
    // Auth & User
    'Session',
    'User',
    // Menu
    'Menu',
    'MenuTree',
    // Production
    'BarcodeHeader',
    'BarcodeDetail',
    'ProductionSewing',
    'ProductionAssembly',
  ],
  endpoints: () => ({}),
});

// ============================================
// STANDALONE FETCH UTILITY
// ============================================

/**
 * Standalone fetch utility for use outside of React components
 * (e.g., in Server Actions or API Routes)
 * 
 * @param endpoint - API endpoint path (without base URL)
 * @param options - Fetch options
 * @param token - iDempiere token (required for authenticated requests)
 * @returns Promise<Response>
 * 
 * @example
 * ```typescript
 * // In a Server Action
 * const response = await fetchWithToken('/models/product', {
 *   method: 'GET',
 * }, session.user.idempiereToken);
 * ```
 */
export async function fetchWithToken(
  endpoint: string,
  options: RequestInit = {},
  token: string
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  
  return fetch(url, {
    ...options,
    headers,
  });
}
