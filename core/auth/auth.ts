// core/auth/auth.ts

/**
 * NextAuth Configuration for iDempiere Integration
 * 
 * This is the SERVER-SIDE auth configuration.
 * All authentication logic with iDempiere should happen here or in auth.actions.ts.
 * 
 * Architecture:
 * - This file: NextAuth configuration (JWT strategy, callbacks)
 * - auth.actions.ts: Server Actions for login flow (calls iDempiere API)
 * - auth.service.ts: Pure HTTP client for iDempiere API
 * 
 * Flow:
 * 1. Client calls signInWithIDempiere() server action
 * 2. Server action calls iDempiere API via auth.service.ts
 * 3. On success, server action calls signIn() from here
 * 4. This authorize() function creates the user object
 * 5. JWT callback stores user data in encrypted cookie
 * 6. Session callback exposes user data to client
 */

import { authConfig } from "@/core/auth/auth.config";
import NextAuth, { NextAuthConfig, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Decode JWT token to extract expiry time
 */
function decodeTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    const expiry = payload.exp as number;
    console.log('🕒 Token will expire at:', new Date(expiry * 1000).toLocaleString());
    return expiry;
  } catch (error) {
    console.error('❌ Failed to decode token expiry:', error);
    // Default to 1 hour from now if decode fails
    return Math.floor(Date.now() / 1000) + 3600;
  }
}

/**
 * Safely parse string to avoid 'undefined' string
 */
function safeString(value: unknown, fallback: string = ''): string {
  if (value === undefined || value === null || value === 'undefined' || value === 'null') {
    return fallback;
  }
  return String(value);
}

/**
 * Safely parse number
 */
function safeNumber(value: unknown, fallback: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

// ============================================
// NEXTAUTH CONFIGURATION
// ============================================

export const config: NextAuthConfig = {
  ...authConfig,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 1, // 1 minute (TESTING ONLY - change back to 60 * 60 for production)
    updateAge: 30, // Update session every 30 seconds (TESTING)
  },
  cookies: {
    sessionToken: {
      name: `session-idempiere`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        userName: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        clientId: { label: "Client ID", type: "text" },
        clientName: { label: "Client Name", type: "text" },
        roleId: { label: "Role ID", type: "text" },
        roleName: { label: "Role Name", type: "text" },
        organizationId: { label: "Organization ID", type: "text" },
        organizationName: { label: "Organization Name", type: "text" },
        warehouseId: { label: "Warehouse ID", type: "text" },
        warehouseName: { label: "Warehouse Name", type: "text" },
        userId: { label: "User ID", type: "text" },
        language: { label: "Language", type: "text" },
      },
      /**
       * Authorize function - Creates user object from iDempiere login response
       * 
       * This is called by NextAuth when signIn('credentials', {...}) is invoked.
       * The credentials object contains data from auth.actions.ts after
       * successful iDempiere authentication.
       */
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.token) {
          console.warn('⚠️ No token provided to authorize');
          return null;
        }

        const tokenExpiry = decodeTokenExpiry(credentials.token as string);

        // Build user object with all iDempiere context
        const user: User = {
          id: safeString(credentials.userId) || safeString(credentials.userName),
          name: safeString(credentials.userName),
          email: `${safeString(credentials.userName)}@idempiere.local`,
          
          // iDempiere Token
          idempiereToken: safeString(credentials.token),
          refreshToken: safeString(credentials.refreshToken),
          tokenExpiry,
          
          // Context - Client/Tenant
          clientId: safeNumber(credentials.clientId),
          clientName: safeString(credentials.clientName, 'Unknown Client'),
          
          // Context - Role
          roleId: safeNumber(credentials.roleId),
          roleName: safeString(credentials.roleName, 'User'),
          
          // Context - Organization
          organizationId: safeNumber(credentials.organizationId),
          organizationName: safeString(credentials.organizationName, 'Unknown Org'),
          
          // Context - Warehouse (optional)
          warehouseId: credentials.warehouseId ? safeNumber(credentials.warehouseId) : undefined,
          warehouseName: safeString(credentials.warehouseName),
          
          // Language
          language: safeString(credentials.language, 'en_US'),
        };

        console.log('✅ User authorized:', {
          id: user.id,
          clientId: user.clientId,
          roleId: user.roleId,
          organizationId: user.organizationId,
        });

        return user;
      },
    }),
  ],
  callbacks: {
    /**
     * JWT Callback - Store user data in JWT token
     * 
     * This runs on:
     * - Initial sign in (user object is available)
     * - Subsequent requests (user is undefined, token persists)
     * - Session update (trigger === 'update')
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - transfer all user data to token
      if (user) {
        token.id = user.id ?? '';
        token.name = user.name;
        token.email = user.email;
        
        // iDempiere Token
        token.idempiereToken = user.idempiereToken;
        token.refreshToken = user.refreshToken;
        token.tokenExpiry = user.tokenExpiry;
        
        // Context
        token.clientId = user.clientId;
        token.clientName = user.clientName;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
        token.warehouseId = user.warehouseId;
        token.warehouseName = user.warehouseName;
        token.language = user.language;
      }

      // Check if iDempiere token is expired
      if (token.tokenExpiry && typeof token.tokenExpiry === 'number') {
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now >= token.tokenExpiry;
        
        if (isExpired) {
          console.warn('⚠️ iDempiere token has expired! Session will be invalidated.');
          // Mark token as invalid (will trigger logout on client)
          token.idempiereToken = '';
          token.tokenExpiry = 0;
        }
      }

      // Handle session updates (e.g., context change)
      if (trigger === "update" && session) {
        // Allow updating specific fields
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.language) token.language = session.user.language;
      }

      return token;
    },

    /**
     * Session Callback - Expose token data to client
     * 
     * This runs whenever the session is accessed (useSession, getServerSession).
     * Only expose what's needed - avoid exposing raw tokens unless necessary.
     */
    async session({ session, token }) {
      // Build session user from token
      // Note: We spread existing session.user to preserve AdapterUser fields like emailVerified
      session.user = {
        ...session.user,
        id: token.id as string,
        name: token.name as string || '',
        email: token.email as string || '',
        
        // iDempiere Token (needed for API calls)
        idempiereToken: token.idempiereToken as string,
        refreshToken: token.refreshToken as string | undefined,
        tokenExpiry: token.tokenExpiry as number,
        
        // Context
        clientId: token.clientId as number,
        clientName: token.clientName as string,
        roleId: token.roleId as number,
        roleName: token.roleName as string,
        organizationId: token.organizationId as number,
        organizationName: token.organizationName as string,
        warehouseId: token.warehouseId as number | undefined,
        warehouseName: token.warehouseName as string | undefined,
        language: token.language as string,
      };

      // Add helper flags
      const now = Math.floor(Date.now() / 1000);
      session.isTokenValid = !!(token.idempiereToken && token.tokenExpiry && now < (token.tokenExpiry as number));
      session.needsRefresh = !!(token.tokenExpiry && (token.tokenExpiry as number) - now < 300); // 5 min before expiry

      return session;
    },
  },
};

// ============================================
// EXPORTS
// ============================================

export const { handlers, auth, signIn, signOut } = NextAuth(config);
