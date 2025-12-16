// features/auth/types/index.ts

/**
 * Authentication Types
 */

// Form interfaces
export interface SignInFormProps {
  appName: string;
  appDescription: string;
}

export interface SignInFormData {
  userName: string;
  password: string;
  clientId?: number;
  clientName?: string;
  roleId?: number;
  roleName?: string;
  organizationId?: number;
  organizationName?: string;
  warehouseId?: number;
  warehouseName?: string;
  language?: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  requiresContext?: boolean;
  token?: string;
  availableClients?: Array<{ id: string; name: string; value: string }>;
  availableRoles?: Array<{ id: string; name: string }>;
  availableOrganizations?: Array<{ id: string; name: string; value: string }>;
  availableWarehouses?: Array<{ id: string; name: string; value: string }>;
}

// Context selection
export interface ContextFormData {
  clientId: number;
  clientName?: string;
  roleId: number;
  roleName?: string;
  organizationId: number;
  organizationName?: string;
  warehouseId: number;
  warehouseName?: string;
  language: string;
}

export interface ContextOptions {
  clients: Array<{ id: string; name: string; value: string }>;
  roles: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; name: string; value: string }>;
  warehouses: Array<{ id: string; name: string; value: string }>;
}

export interface ContextSelectionFormProps {
  authToken: string;
  availableClients: Array<{ id: string; name: string; value: string }>;
  onSubmit: (contextData: ContextFormData) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

// iDempiere auth types
export interface IDempiereLoginCredentials {
  userName: string;
  password: string;
  parameters?: {
    clientId: number;
    roleId: number;
    organizationId: number;
    warehouseId: number;
    language: string;
  };
}

export interface IDempiereLoginResponse {
  token: string;
  refreshToken?: string;
  clients?: Array<{ id: string; name: string; value: string }>;
  roles?: Array<{ id: string; name: string }>;
  organizations?: Array<{ id: string; name: string; value: string }>;
  warehouses?: Array<{ id: string; name: string; value: string }>;
  sessionInfo?: {
    clientId: number;
    roleId: number;
    organizationId: number;
    warehouseId: number;
    userId: number;
    language: string;
  };
}

export interface IDempiereLoginResult {
  success: boolean;
  error?: string;
  requiresContext?: boolean;
  token?: string;
  refreshToken?: string;
  availableClients?: Array<{ id: string; name: string; value: string }>;
  availableRoles?: Array<{ id: string; name: string }>;
  availableOrganizations?: Array<{ id: string; name: string; value: string }>;
  availableWarehouses?: Array<{ id: string; name: string; value: string }>;
  sessionInfo?: {
    clientId: number;
    roleId: number;
    organizationId: number;
    warehouseId: number;
    userId: number;
    userName: string;
    language: string;
  };
}
