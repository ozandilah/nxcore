// features/auth/store/selectors.ts

/**
 * Auth UI State Selectors
 * 
 * These selectors access the LOGIN FLOW UI state, NOT user data.
 * For user data, use the useCurrentUser() hook from shared/hooks.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/core/store/store';

// ============================================
// STEP MANAGEMENT
// ============================================

/** Get current step in login flow */
export const selectCurrentStep = (state: RootState) => state.auth.currentStep;

/** Check if on credentials step */
export const selectIsCredentialsStep = createSelector(
  [selectCurrentStep],
  (currentStep) => currentStep === 'credentials'
);

/** Check if on context selection step */
export const selectIsContextSelectionStep = createSelector(
  [selectCurrentStep],
  (currentStep) => currentStep === 'context-selection'
);

// ============================================
// TEMPORARY DATA (during login flow)
// ============================================

/** Get temporary auth token (for context selection API calls) */
export const selectTempToken = (state: RootState) => state.auth.tempToken;

/** Get temporary username (for re-login with context) */
export const selectTempUserName = (state: RootState) => state.auth.tempUserName;

/** Get temporary password (for re-login with context) */
export const selectTempPassword = (state: RootState) => state.auth.tempPassword;

// ============================================
// CONTEXT OPTIONS
// ============================================

/** Get available clients for selection */
export const selectAvailableClients = (state: RootState) => state.auth.availableClients;

/** Get available roles for selection */
export const selectAvailableRoles = (state: RootState) => state.auth.availableRoles;

/** Get available organizations for selection */
export const selectAvailableOrganizations = (state: RootState) => state.auth.availableOrganizations;

/** Get available warehouses for selection */
export const selectAvailableWarehouses = (state: RootState) => state.auth.availableWarehouses;

/** Get currently selected context values */
export const selectSelectedContext = (state: RootState) => state.auth.selectedContext;

// ============================================
// UI STATE
// ============================================

/** Get loading state */
export const selectIsLoading = (state: RootState) => state.auth.isLoading;

/** Get error message */
export const selectError = (state: RootState) => state.auth.error;

/** Get connection error */
export const selectConnectionError = (state: RootState) => state.auth.connectionError;

/** Check if there's any error */
export const selectHasError = createSelector(
  [selectError, selectConnectionError],
  (error, connectionError) => error !== null || connectionError !== null
);

// ============================================
// DEPRECATED SELECTORS (for backward compatibility)
// ============================================

/**
 * @deprecated Use selectTempToken instead
 */
export const selectAuthToken = (state: RootState) => state.auth.tempToken;

/**
 * @deprecated Credentials should be in local form state, not Redux.
 * This selector is memoized to prevent unnecessary re-renders.
 * Will be removed in future versions.
 */
export const selectCredentials = createSelector(
  [selectTempUserName, selectTempPassword],
  (userName, password) => ({ userName, password })
);
