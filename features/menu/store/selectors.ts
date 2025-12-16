// features/menu/store/selectors.ts

import type { RootState } from '@/core/store/store';

/**
 * Menu Selectors
 * Centralized selectors for menu state
 */

export const selectMenuItems = (state: RootState) => state.menu.menuItems;
export const selectExpandedIds = (state: RootState) => state.menu.expandedIds;
export const selectMenuLoading = (state: RootState) => state.menu.loading;
export const selectMenuError = (state: RootState) => state.menu.error;

/**
 * Memoized selector to check if menu item is expanded
 */
export const selectIsMenuExpanded = (id: number) => (state: RootState) => 
  state.menu.expandedIds.includes(id);
