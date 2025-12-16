// shared/components/layout/Sidebar/DynamicSidebar.tsx
'use client';

import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  Loader2, 
  AlertCircle, 
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/shared/lib/utils';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { useGetMenuTreeQuery } from '@/features/menu/api/menuApi';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux-hooks';
import { toggleExpanded } from '@/features/menu/store/menuSlice';
import { Logo } from '@/shared/components/atoms/Logo';
import { getMenuIconMapping } from '@/shared/config/menu-mapping';
import { MenuItem } from '@/shared/types/menu';

interface MenuItemProps {
  item: MenuItem;
  level: number;
  isCollapsed?: boolean;
}

function SidebarMenuItem({ item, level, isCollapsed = false }: MenuItemProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const expandedIds = useAppSelector((state) => state.menu.expandedIds);
  
  const isExpanded = expandedIds.includes(item.id);
  const isActive = pathname === item.href;
  const hasChildren = Boolean(item.children && item.children.length > 0);

  // Get icon mapping from config
  const mapping = getMenuIconMapping({
    name: item.name,
    windowId: item.windowId,
    formId: item.formId
  });
  const Icon = mapping.icon;

  const handleToggle = () => {
    if (hasChildren) {
      dispatch(toggleExpanded(item.id));
    }
  };

  // Jika punya children (folder)
  if (hasChildren) {
    // When collapsed, render as clickable Link to first child
    if (isCollapsed && item.children && item.children[0]) {
      const firstChild = item.children[0];
      const finalHref = firstChild.href || '#';
      const isChildActive = pathname === finalHref;
      
      return (
        <Link
          href={finalHref}
          className={cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
            'hover:bg-white/50 dark:hover:bg-white/5',
            'hover:shadow-sm hover:backdrop-blur-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            isChildActive && 'bg-gradient-to-r from-primary/20 to-primary/10 shadow-md',
            isChildActive && 'dark:from-primary/30 dark:to-primary/15',
            isChildActive && 'ring-2 ring-primary/20',
            'justify-center'
          )}
          title={item.name}
        >
          <div className={cn(
            'flex items-center justify-center rounded-lg p-2 transition-all duration-200',
            'bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5',
            'shadow-sm backdrop-blur-sm',
            'group-hover:shadow-md group-hover:scale-105',
            isChildActive && 'shadow-md scale-105 bg-gradient-to-br from-primary/20 to-primary/10'
          )}>
            <Icon className={cn('h-4 w-4', isChildActive ? 'text-primary' : mapping.color)} />
          </div>
        </Link>
      );
    }
    
    return (
      <Collapsible open={isExpanded} onOpenChange={handleToggle}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
              'hover:bg-white/50 dark:hover:bg-white/5',
              'hover:shadow-sm hover:backdrop-blur-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isExpanded && 'bg-white/40 dark:bg-white/5 shadow-sm backdrop-blur-sm',
              level > 0 && !isCollapsed && 'ml-4'
            )}
            title={item.name}
          >
            {/* Icon with glass effect */}
            <div className={cn(
              'flex items-center justify-center rounded-lg p-2 transition-all duration-200',
              'bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5',
              'shadow-sm backdrop-blur-sm',
              'group-hover:shadow-md group-hover:scale-105',
              isExpanded && 'shadow-md scale-105'
            )}>
              <Icon className={cn('h-4 w-4', mapping.color)} />
            </div>

            {!isCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground truncate block">
                    {item.name}
                  </span>
                </div>
                
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                    isExpanded && 'rotate-90'
                  )}
                />
              </>
            )}
          </button>
        </CollapsibleTrigger>

        {!isCollapsed && (
          <CollapsibleContent className="space-y-1 mt-1">
            {item.children?.map((child: MenuItem) => (
              <SidebarMenuItem 
                key={child.id} 
                item={child} 
                level={level + 1} 
                isCollapsed={isCollapsed} 
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  }

  // Menu item (leaf)
  const finalHref = mapping.customRoute || item.href || '#';

  return (
    <Link
      href={finalHref}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
        'hover:bg-orange-50 dark:hover:bg-orange-950/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
        isActive && 'bg-orange-500 text-white shadow-sm',
        isActive && 'hover:bg-orange-600',
        !isActive && 'text-gray-700 dark:text-gray-300',
        isCollapsed && 'justify-center',
        level > 0 && !isCollapsed && 'ml-4'
      )}
      title={isCollapsed ? item.name : undefined}
    >
      {/* Icon */}
      <div className={cn(
        'flex items-center justify-center rounded-lg p-1.5 transition-all duration-200',
        isActive && 'bg-white/20',
        !isActive && 'bg-transparent'
      )}>
        <Icon className={cn(
          'h-5 w-5',
          isActive ? 'text-white' : mapping.color
        )} />
      </div>

      {!isCollapsed && (
        <span className={cn(
          'flex-1 text-sm font-medium truncate transition-all',
          isActive && 'text-white font-semibold'
        )}>
          {item.name}
        </span>
      )}

      {mapping.badge && !isCollapsed && (
        <span className={cn(
          "px-2 py-0.5 text-[10px] font-semibold rounded-full",
          isActive ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
        )}>
          {mapping.badge}
        </span>
      )}
    </Link>
  );
}

interface DynamicSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DynamicSidebar({ 
  isOpen = true, 
  onClose
}: DynamicSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const { data: menuItems, isLoading, error } = useGetMenuTreeQuery(10);

  // Menu items already filtered by role from iDempiere API
  const filteredMenuItems = menuItems;

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getUserInitials = () => {
    if (!session?.user?.name) return 'U';
    return session.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container with Collapse Button */}
      <div className="relative flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            'fixed md:sticky top-0 left-0 z-50 flex h-screen flex-col',
            'border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
            'shadow-xl md:shadow-sm transition-all duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            isCollapsed ? 'w-20' : 'w-[280px] sm:w-[300px]'
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between gap-2 h-14 sm:h-16 px-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
          )}>
            <div className="flex-1 min-w-0">
              <Logo isCollapsed={isCollapsed} size="md" showCompanyName={!isCollapsed} />
            </div>
            
            {/* Mobile close button */}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4 bg-gray-100 dark:bg-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-primary/20" />
                </div>
                {!isCollapsed && <p className="text-sm text-muted-foreground">Loading menu...</p>}
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                {!isCollapsed && (
                  <div className="text-center">
                    <p className="text-sm font-medium">Failed to load menu</p>
                    <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
                  </div>
                )}
              </div>
            )}

            {!isCollapsed && filteredMenuItems && filteredMenuItems.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2">
                  Application Module
                </p>
              </div>
            )}

            {filteredMenuItems && filteredMenuItems.length > 0 && (
              <nav className="space-y-1">
                {filteredMenuItems.map((item: MenuItem) => (
                  <SidebarMenuItem 
                    key={item.id} 
                    item={item} 
                    level={0} 
                    isCollapsed={isCollapsed} 
                  />
                ))}
              </nav>
            )}
          </ScrollArea>

          {/* Profile Section - Info Only */}
          <div className={cn(
            'border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900',
            isCollapsed && 'px-2'
          )}>
            <div className={cn(
              'flex items-center gap-2 rounded-xl p-2 transition-all',
              'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
              isCollapsed && 'justify-center'
            )}>
              <Avatar className="h-8 w-8 ring-2 ring-blue-500/20 shrink-0">
                <AvatarFallback className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {session?.user?.roleName || 'User'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Collapse Button - On Border (Desktop Only) */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'hidden md:flex fixed left-[280px] top-18 z-50',
            'h-8 w-8 rounded-full bg-blue-600 text-white hover:text-white',
            'shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300',
            'border-2 border-white dark:border-gray-800',
            'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            isCollapsed && 'left-[68px]'
          )}
          onClick={handleToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
}
