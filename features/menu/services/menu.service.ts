// features/menu/services/menu.service.ts

/**
 * Menu Service
 * Business logic for menu operations
 */

import { MenuItem, IDempiereMenuEntry } from '@/shared/types/menu';

/**
 * Transform iDempiere menu entry to simplified MenuItem
 */
export function transformMenuEntry(entry: IDempiereMenuEntry): MenuItem {
  const menuItem: MenuItem = {
    id: entry.id,
    name: entry.Name,
    description: entry.Description,
  };

  // Determine action and IDs
  if (entry.Action?.identifier === 'W' && entry.AD_Window_ID) {
    menuItem.action = 'Window';
    menuItem.windowId = entry.AD_Window_ID.id;
    menuItem.href = `/window/${entry.AD_Window_ID.id}`;
  } else if (entry.Action?.identifier === 'F' && entry.AD_Form_ID) {
    menuItem.action = 'Form';
    menuItem.formId = entry.AD_Form_ID.id;
    menuItem.href = `/form/${entry.AD_Form_ID.id}`;
  } else if (entry.Action?.identifier === 'P') {
    menuItem.action = 'Process';
  } else if (entry.Action?.identifier === 'R') {
    menuItem.action = 'Report';
  }

  // Recursively transform children
  if (entry.entries && entry.entries.length > 0) {
    menuItem.children = entry.entries.map(transformMenuEntry);
  }

  return menuItem;
}

/**
 * Find menu item by ID recursively
 */
export function findMenuItemById(
  items: MenuItem[],
  id: number
): MenuItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all parent IDs for a menu item
 */
export function getMenuItemParents(
  items: MenuItem[],
  targetId: number,
  parents: number[] = []
): number[] | null {
  for (const item of items) {
    if (item.id === targetId) {
      return parents;
    }
    if (item.children) {
      const found = getMenuItemParents(item.children, targetId, [...parents, item.id]);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Filter menu items by search query
 */
export function filterMenuItems(
  items: MenuItem[],
  query: string
): MenuItem[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  
  return items.reduce<MenuItem[]>((acc, item) => {
    const nameMatch = item.name.toLowerCase().includes(lowerQuery);
    const descMatch = item.description?.toLowerCase().includes(lowerQuery);
    
    if (nameMatch || descMatch) {
      acc.push(item);
      return acc;
    }
    
    // Check children
    if (item.children) {
      const filteredChildren = filterMenuItems(item.children, query);
      if (filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren,
        });
      }
    }
    
    return acc;
  }, []);
}
