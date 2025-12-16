// shared/components/layout/Header/Header.tsx

'use client';

import { LogOut, User, Settings, Menu } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ThemeToggle } from '@/shared/components/atoms/ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    // Clear all cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    
    // Clear storage
    sessionStorage.clear();
    
    // Sign out without redirect
    await signOut({ redirect: false });
    
    // Replace history and navigate to sign-in (prevents back button)
    window.location.replace('/sign-in');
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get page title based on route
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/window/')) {
      return 'Manufacturing Execution System';
    }
    if (pathname.startsWith('/form/')) {
      return 'Manufacturing Execution System';
    }
    return 'MES';
  };

  // Get mobile title
  const getMobileTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/window/')) {
      return 'MES';
    }
    if (pathname.startsWith('/form/')) {
      return 'MES';
    }
    return 'MES';
  };

  // Get breadcrumb
  const getBreadcrumb = () => {
    if (pathname === '/') return 'Dashboard';
    
    if (pathname.startsWith('/window/')) {
      const parts = pathname.split('/');
      const windowId = parts[parts.length - 1];
      // Map window IDs to menu names
      if (windowId === '1000011') return 'MES > Production Barcode';
      if (windowId === '1000002') return 'MES > Production Assembly';
      return 'MES > Window';
    }
    
    if (pathname.startsWith('/form/')) {
      const parts = pathname.split('/');
      const formId = parts[parts.length - 1];
      // Map form IDs to menu names
      if (formId === '1000000') return 'MES > Production Sewing';
      if (formId === '1000002') return 'MES > Production Assembly';
      return 'MES > Form';
    }
    
    return 'MES';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-blue-600 dark:bg-blue-700 shadow-md">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 md:px-6">
        {/* Left Section - Mobile Menu & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 h-9 w-9 hover:bg-white/10 text-white focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Title Section */}
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
              <span className="md:hidden">{getMobileTitle()}</span>
              <span className="hidden md:inline">{getPageTitle()}</span>
            </h1>
            <p className="hidden sm:block text-xs text-white/80 truncate">{getBreadcrumb()}</p>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">         {/* Theme Toggle */}
          {/* Theme Toggle */}
          <ThemeToggle className='text-white' />

          {/* Divider - Hidden on small screens */}
          <div className="hidden sm:block h-8 w-px bg-white/20 mx-1" />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 sm:h-10 gap-1 sm:gap-2 px-1.5 sm:px-2 hover:bg-white/10 rounded-xl focus-visible:ring-2 focus-visible:ring-white/50 text-white">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white/30 shadow-sm">
                  <AvatarFallback className="bg-white text-blue-600 text-xs font-semibold">
                    {getUserInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none text-white truncate max-w-[120px]">
                    {session?.user?.name || 'User'}
                  </span>
                  <span className="text-xs text-white/70 leading-none mt-1 truncate max-w-[120px]">
                    {session?.user?.roleName || 'User'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 py-2">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-md">
                    <AvatarFallback className="bg-linear-to-br from-primary via-primary to-chart-2 text-primary-foreground">
                      {getUserInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-none">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none mt-1.5">
                      {session?.user?.roleName || 'User'}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer py-2">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
