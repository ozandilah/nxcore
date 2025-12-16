// features/menu/types/index.ts

/**
 * Menu Feature Types
 * Feature-specific types for menu functionality
 */

import { MenuItem } from '@/shared/types/menu';

/**
 * Menu State Interface
 */
export interface MenuState {
  menuItems: MenuItem[];
  expandedIds: number[];
  loading: boolean;
  error: string | null;
}

/**
 * Menu Component Props
 */
export interface MenuTreeProps {
  userId?: number;
  roleId?: number;
}

export interface MenuItemProps {
  item: MenuItem;
  level?: number;
  isExpanded?: boolean;
  onToggle?: (id: number) => void;
  onClick?: (item: MenuItem) => void;
}
