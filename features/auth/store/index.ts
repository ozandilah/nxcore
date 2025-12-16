// features/auth/store/index.ts

/**
 * Auth Store Barrel Export
 * 
 * This module exports the auth UI state management.
 * Remember: This is for LOGIN FLOW UI state only.
 * For user data, use useCurrentUser() from shared/hooks.
 */

export { default as authReducer } from './authSlice';

// Actions
export {
  // Step management
  proceedToContextSelection,
  backToCredentials,
  // Context options
  setAvailableRoles,
  setAvailableOrganizations,
  setAvailableWarehouses,
  updateSelectedContext,
  // UI state
  setLoading,
  setError,
  setConnectionError,
  clearErrors,
  resetAuthUI,
  // Deprecated (backward compatibility)
  setContextData,
  setCredentials,
  setStep,
} from './authSlice';

// Types
export type { AuthStep, ContextOption, RoleOption } from './authSlice';

// Selectors
export * from './selectors';
