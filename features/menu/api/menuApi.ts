// features/menu/api/menuApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';
import { IDempiereMenuTree, IDempiereMenuEntry, MenuItem } from '@/shared/types/menu';

/**
 * Transform iDempiere menu entry to simplified MenuItem
 * Filter out parent menus that don't have accessible children
 * Also filter out specific parent menus by name (System Admin, Material Management)
 */
function transformMenuEntry(entry: IDempiereMenuEntry): MenuItem | null {
  // Hide specific parent menus that should not be displayed
  const hiddenParentMenus = [
    'system admin',
    'material management and pricing',
    'material management',
    'general rules',
    'data'
  ];
  
  const menuNameLower = entry.Name.toLowerCase();
  const isHiddenParent = hiddenParentMenus.some(hidden => 
    menuNameLower.includes(hidden)
  );
  
  const menuItem: MenuItem = {
    id: entry.id,
    name: entry.Name,
    description: entry.Description,
  };

  // Determine action and set appropriate IDs
  if (entry.Action) {
    const actionId = entry.Action.identifier;
    menuItem.action = actionId as MenuItem['action'];
    
    if (actionId === 'Window' && entry.AD_Window_ID) {
      menuItem.windowId = entry.AD_Window_ID.id;
      menuItem.href = `/window/${entry.AD_Window_ID.id}`;
    } else if (actionId === 'Form' && entry.AD_Form_ID) {
      menuItem.formId = entry.AD_Form_ID.id;
      menuItem.href = `/form/${entry.AD_Form_ID.id}`;
    }
    // Process and Report actions don't have specific IDs in the current schema
  }

  // Transform children recursively and filter out nulls
  if (entry.entries && entry.entries.length > 0) {
    const transformedChildren = entry.entries
      .map(transformMenuEntry)
      .filter((child): child is MenuItem => child !== null);
    
    // If this is a hidden parent menu, return its children directly (flatten)
    if (isHiddenParent && transformedChildren.length > 0) {
      // Return null to filter out the parent, children will be handled by caller
      return null;
    }
    
    // Only include parent if it has accessible children OR has an action itself
    if (transformedChildren.length > 0) {
      menuItem.children = transformedChildren;
    } else if (!menuItem.action) {
      // Parent has no children and no action = don't show it
      return null;
    }
  } else if (isHiddenParent) {
    // Hidden parent with no children = don't show it
    return null;
  }

  return menuItem;
}

export const menuApi = createApi({
  reducerPath: 'menuApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/idempiere',
    prepareHeaders: async (headers) => {
      const session = await getSession();
      if (session?.user?.idempiereToken) {
        headers.set("Authorization", `Bearer ${session.user.idempiereToken}`);
      }
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ['Menu'],
  endpoints: (builder) => ({
    /**
     * Get menu tree from iDempiere
     * 
     * IMPORTANT: Menu items are automatically filtered by iDempiere based on:
     * - User's role permissions (from session token)
     * - Session context (client, org, role, warehouse)
     * - Window/Form access rights assigned to the role
     * - Menu visibility rules (IsActive, IsSOTrx, etc.)
     * 
     * The API endpoint (/api/idempiere/menutree/{id}) calls the real iDempiere REST API
     * with the user's session token. iDempiere backend will:
     * 1. Validate the token
     * 2. Extract user's role and permissions from session
     * 3. Filter menu tree based on assigned access rights
     * 4. Return only menu items the user has permission to access
     * 
     * No additional frontend filtering is required.
     * The menu tree you receive is already filtered for the authenticated user.
     * 
     * @param menuId - Menu ID (default: 10 for main menu tree)
     * @returns Filtered menu items based on user's role and permissions
     */
    getMenuTree: builder.query<MenuItem[], number>({
      query: (menuId = 10) => ({
        url: `/menutree/${menuId}`,
        method: 'GET',
      }),
      transformResponse: (response: IDempiereMenuTree) => {
        // Transform iDempiere menu tree to simplified menu items
        // Filter out null entries (parents without accessible children)
        return response.entries
          .map(transformMenuEntry)
          .filter((item): item is MenuItem => item !== null);
      },
      providesTags: ['Menu'],
    }),
  }),
});

export const { useGetMenuTreeQuery } = menuApi;
