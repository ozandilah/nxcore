// features/auth/store/authSlice.ts

/**
 * Authentication UI State Slice
 * 
 * IMPORTANT: This slice manages ONLY the UI state for the login flow.
 * User data should NEVER be stored here after successful authentication.
 * 
 * Single Source of Truth:
 * - User profile data → NextAuth Session (use useCurrentUser hook)
 * - Login flow UI state → This Redux slice
 * 
 * This slice handles:
 * - Multi-step login flow state (credentials → context selection)
 * - Temporary auth token during context selection
 * - Available options (clients, roles, orgs, warehouses) during selection
 * - Loading and error states for the login form
 * 
 * After successful login, all data moves to NextAuth session
 * and this slice is reset.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================
// TYPES
// ============================================

/** Login flow steps */
export type AuthStep = 'credentials' | 'context-selection';

/** Context option from iDempiere */
export interface ContextOption {
  id: string;
  name: string;
  value: string;
}

/** Role option from iDempiere */
export interface RoleOption {
  id: string;
  name: string;
}

/** State shape for auth UI */
interface AuthUIState {
  // ===== Step Management =====
  /** Current step in the login flow */
  currentStep: AuthStep;
  
  // ===== Credentials Step =====
  /** Temporary storage for username during multi-step login */
  tempUserName: string;
  /** Temporary storage for password during multi-step login (cleared after use) */
  tempPassword: string;
  
  // ===== Context Selection Step =====
  /** Temporary token from step 1 (before full context is selected) */
  tempToken: string | null;
  
  /** Available clients/tenants for selection */
  availableClients: ContextOption[];
  /** Available roles for selected client */
  availableRoles: RoleOption[];
  /** Available organizations for selected role */
  availableOrganizations: ContextOption[];
  /** Available warehouses for selected organization */
  availableWarehouses: ContextOption[];
  
  /** Currently selected context values (before final submission) */
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
  
  // ===== UI States =====
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error message to display */
  error: string | null;
  /** Connection error (server unreachable) */
  connectionError: string | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthUIState = {
  currentStep: 'credentials',
  
  tempUserName: '',
  tempPassword: '',
  
  tempToken: null,
  availableClients: [],
  availableRoles: [],
  availableOrganizations: [],
  availableWarehouses: [],
  
  selectedContext: {
    clientId: null,
    clientName: null,
    roleId: null,
    roleName: null,
    organizationId: null,
    organizationName: null,
    warehouseId: null,
    warehouseName: null,
    language: 'en_US',
  },
  
  isLoading: false,
  error: null,
  connectionError: null,
};

// ============================================
// SLICE DEFINITION
// ============================================

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ===== Step Management =====
    
    /**
     * Move to context selection step after successful credentials validation
     */
    proceedToContextSelection: (
      state,
      action: PayloadAction<{
        token: string;
        userName: string;
        password: string;
        clients: ContextOption[];
        roles?: RoleOption[];
        organizations?: ContextOption[];
        warehouses?: ContextOption[];
      }>
    ) => {
      state.currentStep = 'context-selection';
      state.tempToken = action.payload.token;
      state.tempUserName = action.payload.userName;
      state.tempPassword = action.payload.password;
      state.availableClients = action.payload.clients;
      state.availableRoles = action.payload.roles || [];
      state.availableOrganizations = action.payload.organizations || [];
      state.availableWarehouses = action.payload.warehouses || [];
      state.error = null;
    },
    
    /**
     * Go back to credentials step
     */
    backToCredentials: (state) => {
      state.currentStep = 'credentials';
      state.tempToken = null;
      state.tempPassword = ''; // Clear password for security
      state.availableClients = [];
      state.availableRoles = [];
      state.availableOrganizations = [];
      state.availableWarehouses = [];
      state.selectedContext = initialState.selectedContext;
      state.error = null;
      state.connectionError = null;
    },
    
    // ===== Context Selection =====
    
    /**
     * Update available roles when client is selected
     */
    setAvailableRoles: (state, action: PayloadAction<RoleOption[]>) => {
      state.availableRoles = action.payload;
      // Reset dependent selections
      state.selectedContext.roleId = null;
      state.selectedContext.roleName = null;
      state.availableOrganizations = [];
      state.selectedContext.organizationId = null;
      state.selectedContext.organizationName = null;
      state.availableWarehouses = [];
      state.selectedContext.warehouseId = null;
      state.selectedContext.warehouseName = null;
    },
    
    /**
     * Update available organizations when role is selected
     */
    setAvailableOrganizations: (state, action: PayloadAction<ContextOption[]>) => {
      state.availableOrganizations = action.payload;
      // Reset dependent selections
      state.selectedContext.organizationId = null;
      state.selectedContext.organizationName = null;
      state.availableWarehouses = [];
      state.selectedContext.warehouseId = null;
      state.selectedContext.warehouseName = null;
    },
    
    /**
     * Update available warehouses when organization is selected
     */
    setAvailableWarehouses: (state, action: PayloadAction<ContextOption[]>) => {
      state.availableWarehouses = action.payload;
      // Reset warehouse selection
      state.selectedContext.warehouseId = null;
      state.selectedContext.warehouseName = null;
    },
    
    /**
     * Update selected context values
     */
    updateSelectedContext: (
      state,
      action: PayloadAction<Partial<AuthUIState['selectedContext']>>
    ) => {
      state.selectedContext = {
        ...state.selectedContext,
        ...action.payload,
      };
    },
    
    // ===== UI State Management =====
    
    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    /**
     * Set error message
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    /**
     * Set connection error
     */
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
    },
    
    /**
     * Clear all errors
     */
    clearErrors: (state) => {
      state.error = null;
      state.connectionError = null;
    },
    
    /**
     * Reset entire auth UI state
     * Call this after successful login or logout
     */
    resetAuthUI: () => initialState,
  },
});

// ============================================
// ACTION EXPORTS
// ============================================

export const {
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
} = authSlice.actions;

// ============================================
// DEPRECATED ACTIONS (for backward compatibility)
// ============================================

/**
 * @deprecated Use proceedToContextSelection instead
 */
export const setContextData = (payload: { 
  token: string; 
  clients: Array<{ id: string; name: string; value: string }> 
}) => proceedToContextSelection({
  token: payload.token,
  userName: '',
  password: '',
  clients: payload.clients,
});

/**
 * @deprecated No longer needed - credentials are temporary
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setCredentials = (_payload: { userName?: string; password?: string }) => ({
  type: 'auth/noop',
});

/**
 * @deprecated Use currentStep from state directly
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setStep = (_step: 'credentials' | 'context') => ({
  type: 'auth/noop',
});

export default authSlice.reducer;
