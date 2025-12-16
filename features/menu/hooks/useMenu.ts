// features/menu/hooks/useMenu.ts

import { useAppDispatch, useAppSelector } from "@/shared/hooks/redux-hooks";
import { MenuItem } from "@/shared/types/menu";
import {
  selectMenuItems,
  selectExpandedIds,
  selectMenuLoading,
  selectMenuError,
  toggleExpanded,
  setExpanded,
  setMenuItems,
  setLoading,
  setError,
} from "../store";

/**
 * Custom hook for menu state management
 */
export function useMenu() {
  const dispatch = useAppDispatch();

  // Selectors
  const menuItems = useAppSelector(selectMenuItems);
  const expandedIds = useAppSelector(selectExpandedIds);
  const loading = useAppSelector(selectMenuLoading);
  const error = useAppSelector(selectMenuError);

  // Actions
  const toggleMenuItem = (id: number) => {
    dispatch(toggleExpanded(id));
  };

  const expandMenuItems = (ids: number[]) => {
    dispatch(setExpanded(ids));
  };

  const updateMenuItems = (items: MenuItem[]) => {
    dispatch(setMenuItems(items));
  };

  const setMenuLoading = (isLoading: boolean) => {
    dispatch(setLoading(isLoading));
  };

  const setMenuError = (errorMessage: string | null) => {
    dispatch(setError(errorMessage));
  };

  const isMenuExpanded = (id: number) => {
    return expandedIds.includes(id);
  };

  return {
    // State
    menuItems,
    expandedIds,
    loading,
    error,
    
    // Actions
    toggleMenuItem,
    expandMenuItems,
    updateMenuItems,
    setMenuLoading,
    setMenuError,
    isMenuExpanded,
  };
}
