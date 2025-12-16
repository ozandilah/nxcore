// features/auth/services/auth.service.ts

import { IDEMPIERE_API_URL, IDEMPIERE_ENDPOINTS } from "@/shared/config/env";
import { formatErrorMessage, isNetworkError } from "@/shared/lib/error-handler";
import { 
  IDempiereLoginCredentials, 
  IDempiereLoginResponse, 
  IDempiereLoginResult 
} from "../types";

/**
 * iDempiere Authentication Service
 * Pure technical layer untuk komunikasi dengan iDempiere API
 * 
 * Responsibilities:
 * - Execute HTTP requests to iDempiere API
 * - Transform API responses to internal format
 * - Handle HTTP errors
 * 
 * Does NOT:
 * - Show UI notifications (toast)
 * - Handle business logic
 * - Manage sessions
 */
export class IDempiereAuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = IDEMPIERE_API_URL;
    
    if (!this.baseUrl) {
      throw new Error('IDEMPIERE_API_URL is not configured in environment variables');
    }
  }

  // ========================================
  // LOGIN
  // ========================================
  
  /**
   * Authenticate user with iDempiere
   * 
   * @param credentials - Login credentials with optional context parameters
   * @returns Promise<IDempiereLoginResult>
   * @throws Error if request fails or validation errors
   */
  async login(credentials: IDempiereLoginCredentials): Promise<IDempiereLoginResult> {
    // Validate input
    if (!credentials.userName || !credentials.password) {
      return {
        success: false,
        error: 'Username and password are required',
      };
    }

    // Build request body
    const requestBody = this.buildLoginRequestBody(credentials);

    try {
      // Execute HTTP request
      const response = await fetch(
        `${this.baseUrl}${IDEMPIERE_ENDPOINTS.AUTH.LOGIN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Handle HTTP errors
      if (!response.ok) {
        const errorMessage = await this.parseErrorResponse(response);
        
        // Check if it's an authentication error (401 Unauthorized)
        if (response.status === 401) {
          return {
            success: false,
            error: 'Invalid Credentials',
          };
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Parse response
      const data: IDempiereLoginResponse = await response.json();

      // Process login response
      return this.processLoginResponse(data, credentials);

    } catch (error) {
      // Handle network/connection errors (server down, maintenance, etc.)
      if (isNetworkError(error)) {
        return {
          success: false,
          error: 'Server sedang dalam perbaikan atau maintenance. Silakan coba lagi nanti atau hubungi administrator.',
        };
      }

      // Handle other errors
      return {
        success: false,
        error: formatErrorMessage(error, 'login'),
      };
    }
  }

  // ========================================
  // TOKEN VALIDATION
  // ========================================
  
  /**
   * Validate JWT token
   * 
   * @param token - JWT token to validate
   * @returns Promise<boolean> - true if token is valid
   */
  async validateToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}${IDEMPIERE_ENDPOINTS.AUTH.VALIDATE}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  // ========================================
  // COMPLETE CONTEXT SELECTION
  // ========================================
  
  /**
   * Complete context selection after one-step login
   * This generates a new token with full context (client, role, org, warehouse)
   * 
   * @param userName - User name
   * @param password - User password  
   * @param context - Selected context (clientId, roleId, organizationId, warehouseId, language)
   * @returns Promise<IDempiereLoginResult> - Final token with full context
   */
  async completeContextSelection(
    userName: string,
    password: string,
    context: {
      clientId: number;
      roleId: number;
      organizationId: number;
      warehouseId: number;
      language: string;
    }
  ): Promise<IDempiereLoginResult> {
    // Re-login with full context parameters to get final token
    return this.login({
      userName,
      password,
      parameters: context,
    });
  }

  // ========================================
  // LOGOUT
  // ========================================
  
  /**
   * Logout and invalidate token
   * 
   * @param token - Token to invalidate
   * @returns Promise<boolean> - true if logout successful
   */
  async logout(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}${IDEMPIERE_ENDPOINTS.AUTH.LOGOUT}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  // ========================================
  // CONTEXT ENDPOINTS
  // ========================================
  
  /**
   * Get available roles for client
   */
  async getRoles(
    token: string, 
    clientId: number
  ): Promise<Array<{ id: number; name: string }>> {
    return this.fetchContextData<{ id: number; name: string }>(
      token,
      `${IDEMPIERE_ENDPOINTS.AUTH.ROLES}?client=${clientId}`,
      'roles'
    );
  }

  /**
   * Get available organizations for client and role
   */
  async getOrganizations(
    token: string,
    clientId: number,
    roleId: number
  ): Promise<Array<{ id: number; name: string }>> {
    return this.fetchContextData<{ id: number; name: string }>(
      token,
      `${IDEMPIERE_ENDPOINTS.AUTH.ORGANIZATIONS}?client=${clientId}&role=${roleId}`,
      'organizations'
    );
  }

  /**
   * Get available warehouses for client, role, and organization
   */
  async getWarehouses(
    token: string,
    clientId: number,
    roleId: number,
    organizationId: number
  ): Promise<Array<{ id: number; name: string }>> {
    return this.fetchContextData<{ id: number; name: string }>(
      token,
      `${IDEMPIERE_ENDPOINTS.AUTH.WAREHOUSES}?client=${clientId}&role=${roleId}&organization=${organizationId}`,
      'warehouses'
    );
  }

  /**
   * Get available languages for client
   */
  async getLanguages(
    token: string,
    clientId: number
  ): Promise<Array<{ id: string; name: string }>> {
    return this.fetchContextData<{ id: string; name: string }>(
      token,
      `${IDEMPIERE_ENDPOINTS.AUTH.LANGUAGE}?client=${clientId}`,
      'languages'
    );
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Build login request body
   */
  private buildLoginRequestBody(
    credentials: IDempiereLoginCredentials
  ): Partial<IDempiereLoginCredentials> {
    const requestBody: Partial<IDempiereLoginCredentials> = {
      userName: credentials.userName,
      password: credentials.password,
    };

    // Add parameters if required context fields are provided
    // Note: warehouseId is optional (some users don't have warehouse)
    if (
      credentials.parameters?.clientId &&
      credentials.parameters?.roleId &&
      credentials.parameters?.organizationId !== undefined
    ) {
      requestBody.parameters = {
        clientId: credentials.parameters.clientId,
        roleId: credentials.parameters.roleId,
        organizationId: credentials.parameters.organizationId,
        warehouseId: credentials.parameters.warehouseId || 0, // Default to 0 if not provided
        language: credentials.parameters.language || 'en_US',
      };
    }

    return requestBody;
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<string> {
    const status = response.status;
    const statusText = response.statusText;

    try {
      const errorData = await response.json();
      return errorData.detail || errorData.title || `Request failed: ${status} ${statusText}`;
    } catch {
      try {
        const errorText = await response.text();
        return errorText || `Request failed: ${status} ${statusText}`;
      } catch {
        return `Request failed: ${status} ${statusText}`;
      }
    }
  }

  /**
   * Process login response and determine next step
   */
  private processLoginResponse(
    data: IDempiereLoginResponse,
    credentials: IDempiereLoginCredentials
  ): IDempiereLoginResult {
    // Check if user has multiple context options
    const hasMultipleOptions = this.hasMultipleContextOptions(data);
    const needsContext = this.needsContextSelection(credentials, hasMultipleOptions);

    // Return available context options if selection needed
    if (needsContext && (data.clients || data.roles)) {
      return {
        success: true,
        requiresContext: true,
        token: data.token,
        availableClients: this.mapContextArray(data.clients || []),
        availableRoles: this.mapRolesArray(data.roles || []),
        availableOrganizations: this.mapContextArray(data.organizations || []),
        availableWarehouses: this.mapContextArray(data.warehouses || []),
      };
    }

    // Auto-select if single option available
    const finalContext = this.autoSelectContext(data, credentials);
    
    // CRITICAL: Check if context values are invalid (0 means not selected)
    // iDempiere one-step login returns roleId: 0, orgId: 0, warehouseId: 0
    // This is NOT a valid context and MUST trigger context selection
    // Note: Warehouse is optional (some users don't have warehouse)
    const hasInvalidContext = 
      !finalContext.roleId || finalContext.roleId === 0 ||
      finalContext.organizationId === undefined || finalContext.organizationId === 0;
    
    if (hasInvalidContext) {
      console.warn('⚠️ Login returned invalid context (values are 0). Forcing context selection.');
      return {
        success: true,
        requiresContext: true,
        token: data.token,
        availableClients: this.mapContextArray(data.clients || []),
        availableRoles: this.mapRolesArray(data.roles || []),
        availableOrganizations: this.mapContextArray(data.organizations || []),
        availableWarehouses: this.mapContextArray(data.warehouses || []),
      };
    }

    // Return successful login with full context
    return {
      success: true,
      requiresContext: false,
      token: data.token,
      refreshToken: data.refreshToken,
      sessionInfo: {
        userId: data.sessionInfo?.userId || 0,
        userName: credentials.userName,
        clientId: this.toNumber(finalContext.clientId) || 0,
        roleId: this.toNumber(finalContext.roleId) || 0,
        organizationId: this.toNumber(finalContext.organizationId) || 0,
        warehouseId: this.toNumber(finalContext.warehouseId) || 0,
        language: data.sessionInfo?.language || credentials.parameters?.language || 'en_US',
      },
    };
  }

  /**
   * Check if user has multiple context options
   */
  private hasMultipleContextOptions(data: IDempiereLoginResponse): boolean {
    const hasMultipleClients = data.clients && data.clients.length > 1;
    const hasMultipleRoles = data.roles && data.roles.length > 1;
    const hasMultipleOrgs = data.organizations && data.organizations.length > 1;
    const hasMultipleWarehouses = data.warehouses && data.warehouses.length > 1;

    return !!(hasMultipleClients || hasMultipleRoles || hasMultipleOrgs || hasMultipleWarehouses);
  }

  /**
   * Check if context selection is needed
   */
  private needsContextSelection(
    credentials: IDempiereLoginCredentials,
    hasMultipleOptions: boolean
  ): boolean {
    const hasCompleteParameters =
      credentials.parameters?.clientId &&
      credentials.parameters?.roleId &&
      credentials.parameters?.organizationId &&
      credentials.parameters?.warehouseId;

    return !hasCompleteParameters && hasMultipleOptions;
  }

  /**
   * Auto-select context if only one option available
   */
  private autoSelectContext(
    data: IDempiereLoginResponse,
    credentials: IDempiereLoginCredentials
  ) {
    return {
      clientId:
        credentials.parameters?.clientId ||
        (data.clients?.length === 1 ? data.clients[0].id : undefined),
      roleId:
        credentials.parameters?.roleId ||
        (data.roles?.length === 1 ? data.roles[0].id : undefined),
      organizationId:
        credentials.parameters?.organizationId ||
        (data.organizations?.length === 1 ? data.organizations[0].id : undefined),
      warehouseId:
        credentials.parameters?.warehouseId ||
        (data.warehouses?.length === 1 ? data.warehouses[0].id : undefined),
    };
  }

  /**
   * Map context array to standard format
   */
  private mapContextArray(
    items: Array<{ id: string | number; name: string; value?: string | number }>
  ): Array<{ id: string; name: string; value: string }> {
    return items.map((item) => ({
      id: typeof item.id === 'string' ? item.id : item.id.toString(),
      name: item.name,
      value: item.value ? (typeof item.value === 'string' ? item.value : item.value.toString()) : item.id.toString(),
    }));
  }

  /**
   * Map roles array to standard format
   */
  private mapRolesArray(
    items: Array<{ id: string | number; name: string }>
  ): Array<{ id: string; name: string }> {
    return items.map((item) => ({
      id: typeof item.id === 'string' ? item.id : item.id.toString(),
      name: item.name,
    }));
  }

  /**
   * Safely convert string or number to number
   */
  private toNumber(value: string | number | undefined): number | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return value;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Generic method to fetch context data (roles, orgs, warehouses, languages)
   */
  private async fetchContextData<T>(
    token: string,
    endpoint: string,
    dataKey: string
  ): Promise<T[]> {
    if (!token) {
      throw new Error('Authentication token is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${dataKey}: ${response.status}`);
      }

      const data = await response.json();
      
      // API might return { [dataKey]: [...] } or direct array
      return data[dataKey] || data || [];
    } catch (error) {
      // Rethrow error to be handled by caller
      throw new Error(
        error instanceof Error 
          ? error.message 
          : `Failed to fetch ${dataKey}`
      );
    }
  }
}

// ========================================
// SINGLETON PATTERN
// ========================================

let authServiceInstance: IDempiereAuthService | null = null;

/**
 * Get singleton instance of IDempiereAuthService
 * Ensures only one instance exists throughout application lifecycle
 * 
 * @returns IDempiereAuthService instance
 */
export function getIDempiereAuthService(): IDempiereAuthService {
  if (!authServiceInstance) {
    authServiceInstance = new IDempiereAuthService();
  }
  return authServiceInstance;
}