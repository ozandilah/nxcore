'use client';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Main Content with proper responsive padding */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-linear-to-br from-background via-background to-muted/5 dark:from-background dark:via-background dark:to-muted/10">
          <div className="w-full h-full p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-full lg:max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
  );
}


