// shared/hooks/redux-hooks.ts

import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch } from '@/core/store/store';

/**
 * Pre-typed Redux Hooks
 * Use these instead of plain `useDispatch` and `useSelector`
 * 
 * Compatible with React-Redux v8+ and v9+
 */

// Typed dispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed selector hook  
export const useAppSelector = <TSelected = unknown>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
): TSelected => useSelector(selector, equalityFn);

// Typed store hook
export const useAppStore = () => useStore<RootState>();
