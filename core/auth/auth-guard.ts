// core/auth/auth-guard.ts

import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Check if iDempiere token is expired
  if (session.user.tokenExpiry) {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const isExpired = now >= session.user.tokenExpiry;
    
    if (isExpired) {
      console.warn('⚠️ Token expired, redirecting to sign-in...');
      redirect("/sign-in");
    }
  }

  return session;
}

