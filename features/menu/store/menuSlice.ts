// features/menu/store/menuSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem } from '@/shared/types/menu';

interface MenuState {
  menuItems: MenuItem[];
  expandedIds: number[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menuItems: [],
  expandedIds: [],
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.menuItems = action.payload;
    },
    toggleExpanded: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.expandedIds.indexOf(id);
      if (index > -1) {
        state.expandedIds.splice(index, 1);
      } else {
        state.expandedIds.push(id);
      }
    },
    setExpanded: (state, action: PayloadAction<number[]>) => {
      state.expandedIds = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMenuItems, toggleExpanded, setExpanded, setLoading, setError } = menuSlice.actions;
export default menuSlice.reducer;
