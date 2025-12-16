// features/auth/services/auth.actions.ts

'use server';

import { signIn, signOut } from "@/core/auth/auth";
import { IDempiereLoginResult, SignInFormData, SignInResult } from "@/features/auth/types";
import { getIDempiereAuthService } from "@/features/auth/services/auth.service";

/**
 * Sign in action dengan integrasi iDempiere
 * Mendukung 2-step login:
 * 1. Step 1: Login dengan username/password → Return available context options
 * 2. Step 2: Login dengan full context (client, role, org, warehouse) → Create session
 */
export async function signInWithIDempiere(
  formData: SignInFormData
): Promise<SignInResult> {
  try {
    // Validasi input
    if (!formData.userName || !formData.password) {
      return {
        success: false,
        error: 'Username dan password harus diisi',
      };
    }

    // Login ke iDempiere
    const authService = getIDempiereAuthService();
    
    // Prepare login parameters
    // Note: warehouseId is optional (some users don't have warehouse)
    const hasFullContext = formData.clientId && formData.roleId && formData.organizationId !== undefined;
    
    console.log('🔐 Login attempt:', {
      userName: formData.userName,
      hasContext: !!hasFullContext,
      context: hasFullContext ? {
        clientId: formData.clientId,
        roleId: formData.roleId,
        organizationId: formData.organizationId,
        warehouseId: formData.warehouseId,
        language: formData.language || 'en_US',
      } : undefined
    });
    
    const loginResult: IDempiereLoginResult = await authService.login({
      userName: formData.userName,
      password: formData.password,
      parameters: hasFullContext ? {
        clientId: formData.clientId!,
        roleId: formData.roleId!,
        organizationId: formData.organizationId!,
        warehouseId: formData.warehouseId!,
        language: formData.language || 'en_US',
      } : undefined,
    });

    if (!loginResult.success) {
      return {
        success: false,
        error: loginResult.error || 'Login gagal',
      };
    }

    // Jika membutuhkan context selection (step 1 response)
    if (loginResult.requiresContext) {
      console.log('📊 Context selection required');
      return {
        success: true,
        requiresContext: true,
        token: loginResult.token,
        availableClients: loginResult.availableClients,
        availableRoles: loginResult.availableRoles,
        availableOrganizations: loginResult.availableOrganizations,
        availableWarehouses: loginResult.availableWarehouses,
      };
    }

    // Login sukses dengan full context (step 2 response)
    // Sign in dengan NextAuth (simpan token + refresh token di JWT)
    
    console.log('✅ Login successful with full context:', {
      clientId: loginResult.sessionInfo?.clientId,
      roleId: loginResult.sessionInfo?.roleId,
      organizationId: loginResult.sessionInfo?.organizationId,
      warehouseId: loginResult.sessionInfo?.warehouseId,
    });
    
    // Get role name from available roles if exists
    let roleName = formData.roleName || 'User';
    if (!formData.roleName && loginResult.availableRoles && loginResult.sessionInfo?.roleId) {
      const roleInfo = loginResult.availableRoles.find(
        r => Number(r.id) === loginResult.sessionInfo?.roleId
      );
      roleName = roleInfo?.name || 'User';
    }
    
    const signInData = {
      userName: formData.userName,
      password: formData.password,
      token: loginResult.token,
      refreshToken: loginResult.refreshToken,
      clientId: loginResult.sessionInfo?.clientId?.toString(),
      clientName: formData.clientName,
      roleId: loginResult.sessionInfo?.roleId?.toString(),
      roleName: roleName,
      organizationId: loginResult.sessionInfo?.organizationId?.toString(),
      organizationName: formData.organizationName,
      warehouseId: loginResult.sessionInfo?.warehouseId?.toString(),
      warehouseName: formData.warehouseName,
      userId: loginResult.sessionInfo?.userId?.toString(),
      language: loginResult.sessionInfo?.language,
      redirect: false,
    };

    console.log('🔐 Signing in with NextAuth:', {
      clientId: signInData.clientId,
      roleId: signInData.roleId,
      organizationId: signInData.organizationId,
      warehouseId: signInData.warehouseId,
    });
    
    await signIn('credentials', signInData);

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat login',
    };
  }
}

/**
 * Sign out action
 */
export async function signOutAction(): Promise<void> {
  await signOut();
}

/**
 * Fetch available roles for a specific client
 */
export async function fetchRoles(token: string, clientId: number): Promise<Array<{ id: string; name: string }>> {
  try {
    const authService = getIDempiereAuthService();
    const roles = await authService.getRoles(token, clientId);
    
    return roles.map(r => ({
      id: r.id.toString(),
      name: r.name,
    }));
  } catch (error) {
    console.error('❌ Error fetching roles:', error);
    return [];
  }
}

/**
 * Fetch available organizations for a specific client and role
 */
export async function fetchOrganizations(token: string, clientId: number, roleId: number): Promise<Array<{ id: string; name: string; value: string }>> {
  try {
    const authService = getIDempiereAuthService();
    const organizations = await authService.getOrganizations(token, clientId, roleId);
    
    return organizations.map(o => ({
      id: o.id.toString(),
      name: o.name,
      value: o.id.toString(),
    }));
  } catch (error) {
    console.error('❌ Error fetching organizations:', error);
    return [];
  }
}

/**
 * Fetch available warehouses for a specific client, role, and organization
 */
export async function fetchWarehouses(token: string, clientId: number, roleId: number, organizationId: number): Promise<Array<{ id: string; name: string; value: string }>> {
  try {
    const authService = getIDempiereAuthService();
    const warehouses = await authService.getWarehouses(token, clientId, roleId, organizationId);
    
    return warehouses.map(w => ({
      id: w.id.toString(),
      name: w.name,
      value: w.id.toString(),
    }));
  } catch (error) {
    console.error('❌ Error fetching warehouses:', error);
    return [];
  }
}

/**
 * Fetch available languages for a specific client
 */
export async function fetchLanguages(token: string, clientId: number): Promise<Array<{ id: string; name: string }>> {
  try {
    const authService = getIDempiereAuthService();
    const languages = await authService.getLanguages(token, clientId);
    
    return languages;
  } catch (error) {
    console.error('❌ Error fetching languages:', error);
    return [
      { id: 'en_US', name: 'English (US)' },
      { id: 'id_ID', name: 'Bahasa Indonesia' },
    ];
  }
}
