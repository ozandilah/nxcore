import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { APP_DESCRIPTION, APP_NAME } from "@/shared/config/constants";
import { ThemeToggle } from "@/shared/components/atoms/ThemeToggle";
import { SignInForm } from "@/features/auth";


export const metadata: Metadata = {
  title: `Sign In - ${APP_NAME}`,
  description: `Sign in to access ${APP_NAME}`,
};

export default async function SignInPage() {
  // Check if user is already authenticated
  const session = await auth();
  
  // Redirect to dashboard if already logged in
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-chart-2/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-delayed" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-chart-3/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-10">
        <ThemeToggle className="text-black" />
      </div>

      <div className="relative z-10 w-full max-w-[95%] sm:max-w-md mx-auto flex flex-col items-center">
        <div className="w-full">
          <SignInForm 
            appName={APP_NAME}
            appDescription={APP_DESCRIPTION}
          />
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 text-center text-xs sm:text-sm text-muted-foreground animate-fade-in-up">
          <p>&copy; {new Date().getFullYear()} PT Bintang Indokarya Gemilang</p>
          <p className="mt-1">All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

