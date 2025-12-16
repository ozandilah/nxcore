// features/auth/hooks/useAuth.ts

/**
 * useAuth Hook - Login Flow State Management
 * 
 * This hook manages the UI STATE for the multi-step login flow.
 * It should be used in login-related components only.
 * 
 * IMPORTANT DISTINCTION:
 * - useAuth() → For login flow UI state (step, loading, errors, available options)
 * - useCurrentUser() → For authenticated user data (profile, context, token)
 * 
 * Use useCurrentUser() in all other parts of the application
 * to access the logged-in user's data.
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from "@/shared/hooks/redux-hooks";
import {
  // Selectors
  selectCurrentStep,
  selectTempToken,
  selectTempUserName,
  selectTempPassword,
  selectAvailableClients,
  selectAvailableRoles,
  selectAvailableOrganizations,
  selectAvailableWarehouses,
  selectSelectedContext,
  selectIsLoading,
  selectError,
  selectConnectionError,
  // Actions
  proceedToContextSelection,
  backToCredentials,
  setAvailableRoles,
  setAvailableOrganizations,
  setAvailableWarehouses,
  updateSelectedContext,
  setLoading,
  setError,
  setConnectionError,
  clearErrors,
  resetAuthUI,
} from "@/features/auth/store";
import type { ContextOption, RoleOption } from "@/features/auth/store";

// ============================================
// TYPES
// ============================================

export interface UseAuthReturn {
  // ===== State =====
  /** Current step in login flow */
  currentStep: 'credentials' | 'context-selection';
  /** Whether on credentials step */
  isCredentialsStep: boolean;
  /** Whether on context selection step */
  isContextSelectionStep: boolean;
  
  /** Temporary token for context selection API calls */
  tempToken: string | null;
  /** Temporary username for re-login with context */
  tempUserName: string;
  /** Temporary password for re-login with context */
  tempPassword: string;
  
  /** Available clients for selection */
  availableClients: ContextOption[];
  /** Available roles for selection */
  availableRoles: RoleOption[];
  /** Available organizations for selection */
  availableOrganizations: ContextOption[];
  /** Available warehouses for selection */
  availableWarehouses: ContextOption[];
  /** Currently selected context values */
  selectedContext: {
    clientId: number | null;
    clientName: string | null;
    roleId: number | null;
    roleName: string | null;
    organizationId: number | null;
    organizationName: string | null;
    warehouseId: number | null;
    warehouseName: string | null;
    language: string;
  };
  
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Connection error */
  connectionError: string | null;
  
  // ===== Actions =====
  /** Proceed to context selection after successful credentials */
  goToContextSelection: (data: {
    token: string;
    userName: string;
    password: string;
    clients: ContextOption[];
    roles?: RoleOption[];
    organizations?: ContextOption[];
    warehouses?: ContextOption[];
  }) => void;
  /** Go back to credentials step */
  goBackToCredentials: () => void;
  /** Update available roles */
  updateAvailableRoles: (roles: RoleOption[]) => void;
  /** Update available organizations */
  updateAvailableOrganizations: (orgs: ContextOption[]) => void;
  /** Update available warehouses */
  updateAvailableWarehouses: (warehouses: ContextOption[]) => void;
  /** Update selected context values */
  updateContext: (context: Partial<UseAuthReturn['selectedContext']>) => void;
  /** Set loading state */
  setAuthLoading: (loading: boolean) => void;
  /** Set error message */
  setAuthError: (error: string | null) => void;
  /** Set connection error */
  setAuthConnectionError: (error: string | null) => void;
  /** Clear all errors */
  clearAuthErrors: () => void;
  /** Reset entire auth UI state (call after successful login) */
  resetAuth: () => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Hook for login flow state management
 * 
 * @returns {UseAuthReturn} Login flow state and actions
 * 
 * @example
 * ```tsx
 * function SignInForm() {
 *   const { 
 *     currentStep, 
 *     isLoading, 
 *     error,
 *     goToContextSelection,
 *     setAuthError 
 *   } = useAuth();
 *   
 *   const handleSubmit = async (credentials) => {
 *     try {
 *       const result = await signInWithIDempiere(credentials);
 *       if (result.requiresContext) {
 *         goToContextSelection({
 *           token: result.token,
 *           userName: credentials.userName,
 *           password: credentials.password,
 *           clients: result.availableClients,
 *         });
 *       }
 *     } catch (error) {
 *       setAuthError(error.message);
 *     }
 *   };
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  
  // ===== Selectors =====
  const currentStep = useAppSelector(selectCurrentStep);
  const tempToken = useAppSelector(selectTempToken);
  const tempUserName = useAppSelector(selectTempUserName);
  const tempPassword = useAppSelector(selectTempPassword);
  const availableClients = useAppSelector(selectAvailableClients);
  const availableRoles = useAppSelector(selectAvailableRoles);
  const availableOrganizations = useAppSelector(selectAvailableOrganizations);
  const availableWarehouses = useAppSelector(selectAvailableWarehouses);
  const selectedContext = useAppSelector(selectSelectedContext);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const connectionError = useAppSelector(selectConnectionError);

  // ===== Computed Values =====
  const isCredentialsStep = currentStep === 'credentials';
  const isContextSelectionStep = currentStep === 'context-selection';

  // ===== Actions =====
  const goToContextSelection = useCallback((data: Parameters<typeof proceedToContextSelection>[0]) => {
    dispatch(proceedToContextSelection(data));
  }, [dispatch]);

  const goBackToCredentials = useCallback(() => {
    dispatch(backToCredentials());
  }, [dispatch]);

  const updateAvailableRoles = useCallback((roles: RoleOption[]) => {
    dispatch(setAvailableRoles(roles));
  }, [dispatch]);

  const updateAvailableOrganizations = useCallback((orgs: ContextOption[]) => {
    dispatch(setAvailableOrganizations(orgs));
  }, [dispatch]);

  const updateAvailableWarehouses = useCallback((warehouses: ContextOption[]) => {
    dispatch(setAvailableWarehouses(warehouses));
  }, [dispatch]);

  const updateContext = useCallback((context: Partial<UseAuthReturn['selectedContext']>) => {
    dispatch(updateSelectedContext(context));
  }, [dispatch]);

  const setAuthLoading = useCallback((loading: boolean) => {
    dispatch(setLoading(loading));
  }, [dispatch]);

  const setAuthError = useCallback((errorMessage: string | null) => {
    dispatch(setError(errorMessage));
  }, [dispatch]);

  const setAuthConnectionError = useCallback((errorMessage: string | null) => {
    dispatch(setConnectionError(errorMessage));
  }, [dispatch]);

  const clearAuthErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const resetAuth = useCallback(() => {
    dispatch(resetAuthUI());
  }, [dispatch]);

  return {
    // State
    currentStep,
    isCredentialsStep,
    isContextSelectionStep,
    tempToken,
    tempUserName,
    tempPassword,
    availableClients,
    availableRoles,
    availableOrganizations,
    availableWarehouses,
    selectedContext,
    isLoading,
    error,
    connectionError,
    
    // Actions
    goToContextSelection,
    goBackToCredentials,
    updateAvailableRoles,
    updateAvailableOrganizations,
    updateAvailableWarehouses,
    updateContext,
    setAuthLoading,
    setAuthError,
    setAuthConnectionError,
    clearAuthErrors,
    resetAuth,
  };
}

export default useAuth;
