/**
 * Shared Configuration - Environment
 * iDempiere API configuration
 */

export const IDEMPIERE_API_URL =
  process.env.IDEMPIERE_API_URL || "http://your-idempiere-server:8080/ADInterface/services/rest";

export const IDEMPIERE_API_USERNAME =
  process.env.IDEMPIERE_API_USERNAME || "";

export const IDEMPIERE_API_PASSWORD =
  process.env.IDEMPIERE_API_PASSWORD || "";

export const IDEMPIERE_CLIENT_ID =
  process.env.IDEMPIERE_API_CLIENT_ID || "1000000";

export const IDEMPIERE_ROLE_ID =
  process.env.IDEMPIERE_API_ROLE_ID || "1000000";

export const IDEMPIERE_ORG_ID =
  process.env.IDEMPIERE_API_ORG_ID || "1000000";

export const IDEMPIERE_WAREHOUSE_ID =
  process.env.IDEMPIERE_API_WAREHOUSE_ID || "1000000";

/**
 * iDempiere API Endpoints
 */
export const IDEMPIERE_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/tokens',
    VALIDATE: '/auth/tokens/validate',
    LOGOUT: '/auth/tokens/logout',
    ROLES: '/auth/roles',
    ORGANIZATIONS: '/auth/organizations',
    WAREHOUSES: '/auth/warehouses',
    LANGUAGE: '/auth/language',
  },
  WINDOWS: '/windows',
  PROCESSES: '/processes',
  MODELS: '/models',
  FORMS: '/forms',
  REPORTS: '/reports',
} as const;
