// core/auth/auth.config.ts

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      // Array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/profile/,
        /\/user\/(.*)/,
        /\/admin/,
      ];
      
      // Public paths yang tidak perlu auth
      const publicPaths = [
        /\/sign-in/,
        /\/sign-up/,
        /\/_next/,
        /\/api/,
      ];
      
      // Get pathname from the request URL Object
      const { pathname } = request.nextUrl;
      
      // Allow public paths
      if (publicPaths.some((p) => p.test(pathname))) return true;

      // Check if user is not authenticated and the path is protected
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;
      
      return true;
    },
  }
};
