// shared/config/menu-mapping.ts
/**
 * Menu Mapping Configuration
 * 
 * Purpose: Map iDempiere menu items to frontend display properties
 * 
 * How it works:
 * 1. iDempiere API returns menu tree filtered by user role
 * 2. Frontend looks up this mapping to get icon, color, route
 * 3. If no mapping found, use default icon
 * 
 * HYBRID APPROACH:
 * - Menu structure & permissions: FROM iDempiere (by role)
 * - Icon, color, custom route: FROM this config (UI layer)
 */

import type { LucideIcon } from 'lucide-react';
import {
  Package,
  Settings
} from 'lucide-react';

export interface MenuIconMapping {
  // Match by window ID, form ID, or menu name
  windowId?: number;
  formId?: number;
  menuName?: string;  // Partial match (case-insensitive)
  
  // Display properties
  icon: LucideIcon;
  color: string;
  customRoute?: string;  // Override default route
  badge?: string;
}

/**
 * Menu Icon Mappings
 * 
 * Add mappings for your iDempiere menus here
 */
export const MENU_ICON_MAPPINGS: MenuIconMapping[] = [

  
  // Production Barcode (Window ID: 1000011)
  {
    windowId: 1000011,
    menuName: 'production barcode',
    icon: Package,
    color: 'text-green-500',
  },
  {
    formId: 1000002,
    menuName: 'production assembly',
    icon: Package,
    color: 'text-green-500',
  },
  {
    formId: 1000000,
    menuName: 'production sewing',
    icon: Package,
    color: 'text-green-500',
  },
];

/**
 * Default mapping when no specific mapping found
 */
export const DEFAULT_MENU_MAPPING: Omit<MenuIconMapping, 'windowId' | 'formId' | 'menuName'> = {
  icon: Settings,
  color: 'text-gray-500',
};

/**
 * Get icon mapping for a menu item
 */
export function getMenuIconMapping(item: {
  name: string;
  windowId?: number;
  formId?: number;
}): Omit<MenuIconMapping, 'windowId' | 'formId' | 'menuName'> {
  // Try to match by window ID
  if (item.windowId) {
    const mapping = MENU_ICON_MAPPINGS.find(m => m.windowId === item.windowId);
    if (mapping) return mapping;
  }
  
  // Try to match by form ID
  if (item.formId) {
    const mapping = MENU_ICON_MAPPINGS.find(m => m.formId === item.formId);
    if (mapping) return mapping;
  }
  
  // Try to match by menu name (partial, case-insensitive)
  const nameLower = item.name.toLowerCase();
  const mapping = MENU_ICON_MAPPINGS.find(m => 
    m.menuName && nameLower.includes(m.menuName.toLowerCase())
  );
  
  if (mapping) return mapping;
  
  // Return default
  return DEFAULT_MENU_MAPPING;
}
