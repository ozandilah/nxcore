// features/auth/api/authApi.ts

import { apiSlice } from '@/shared/api/baseQuery';
import { fetchLanguages, fetchOrganizations, fetchRoles, fetchWarehouses } from '../services/auth.actions';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<
      Array<{ id: string; name: string }>, 
      { token: string; clientId: number }
    >({
      queryFn: async ({ token, clientId }) => {
        try {
          const data = await fetchRoles(token, clientId);
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error instanceof Error ? error.message : 'Failed to fetch roles',
            },
          };
        }
      },
    }),
    
    getOrganizations: builder.query<
      Array<{ id: string; name: string; value: string }>,
      { token: string; clientId: number; roleId: number }
    >({
      queryFn: async ({ token, clientId, roleId }) => {
        try {
          const data = await fetchOrganizations(token, clientId, roleId);
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error instanceof Error ? error.message : 'Failed to fetch organizations',
            },
          };
        }
      },
    }),

    getWarehouses: builder.query<
      Array<{ id: string; name: string; value: string }>,
      { token: string; clientId: number; roleId: number; organizationId: number }
    >({
      queryFn: async ({ token, clientId, roleId, organizationId }) => {
        try {
          const data = await fetchWarehouses(token, clientId, roleId, organizationId);
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error instanceof Error ? error.message : 'Failed to fetch warehouses',
            },
          };
        }
      },
    }),
    
    getLanguages: builder.query<
      Array<{ id: string; name: string }>,
      { token: string; clientId: number }
    >({
      queryFn: async ({ token, clientId }) => {
        try {
          const data = await fetchLanguages(token, clientId);
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error instanceof Error ? error.message : 'Failed to fetch languages',
            },
          };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRolesQuery,
  useLazyGetRolesQuery,
  useGetOrganizationsQuery,
  useLazyGetOrganizationsQuery,
  useGetWarehousesQuery,
  useLazyGetWarehousesQuery,
  useGetLanguagesQuery,
  useLazyGetLanguagesQuery,
} = authApi;
