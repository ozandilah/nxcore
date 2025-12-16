// core/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '@/shared/api/baseQuery';
import { authReducer } from '@/features/auth/store';
import { menuReducer } from '@/features/menu/store';
import { menuApi } from '@/features/menu/api/menuApi';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    auth: authReducer,
    menu: menuReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(menuApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
