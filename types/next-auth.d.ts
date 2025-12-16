/**
 * Extended NextAuth types for iDempiere integration
 * 
 * Module Augmentation yang ketat untuk memastikan type safety
 * saat mengakses session.user dari komponen manapun.
 * 
 * @see https://next-auth.js.org/getting-started/typescript
 */
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

/**
 * iDempiere Session Context
 * Represents the complete iDempiere session context after successful authentication
 */
export interface IDempiereSessionContext {
  /** JWT Token from iDempiere for API calls */
  idempiereToken: string;
  /** Refresh token for token renewal */
  refreshToken?: string;
  /** Token expiry timestamp (Unix seconds) */
  tokenExpiry: number;
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
  /** Selected Warehouse ID (optional - some users don't have warehouse) */
  warehouseId?: number;
  /** Selected Warehouse Name */
  warehouseName?: string;
  /** User's preferred language (e.g., 'en_US', 'id_ID') */
  language: string;
}

/**
 * Extended User type for iDempiere integration
 * All fields are required after successful context selection
 */
export interface IDempiereUser extends DefaultUser {
  id: string;
  name: string;
  email: string;
  idempiereToken: string;
  refreshToken?: string;
  tokenExpiry: number;
  clientId: number;
  clientName: string;
  roleId: number;
  roleName: string;
  organizationId: number;
  organizationName: string;
  warehouseId?: number;
  warehouseName?: string;
  language: string;
}

declare module "next-auth" {
  /**
   * Extended User interface
   * Used in JWT callback and authorize function
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends IDempiereUser {}

  /**
   * Extended Session interface
   * This is what you get from useSession() or getServerSession()
   */
  interface Session extends DefaultSession {
    user: IDempiereUser;
    /** Indicates if iDempiere token is still valid */
    isTokenValid: boolean;
    /** Indicates if session needs token refresh */
    needsRefresh: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT interface
   * This is stored in the encrypted cookie
   */
  interface JWT extends DefaultJWT {
    id: string;
    idempiereToken: string;
    refreshToken?: string;
    tokenExpiry: number;
    clientId: number;
    clientName: string;
    roleId: number;
    roleName: string;
    organizationId: number;
    organizationName: string;
    warehouseId?: number;
    warehouseName?: string;
    language: string;
  }
}
