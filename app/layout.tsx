import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { GeistSans } from "geist/font/sans";

import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/shared/config/constants";
import { Toaster } from "@/shared/components/ui/sonner";

import "@/assets/styles/globals.css";
import { TokenMonitor } from "@/shared/components/molecules/TokenMonitor";
import ProgressBar from "@/shared/components/molecules/ProgressBar";
import AppProviders from "@/core/providers/AppProviders";

export const metadata: Metadata = {
  title: {
    template: `%s | CORE - APP - PT BINTANG INDOKARYA GEMILANG`,
    default: APP_NAME,
  },
  description: `${APP_DESCRIPTION}`,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased`}>
        <AppProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TokenMonitor />
            <ProgressBar />
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}

