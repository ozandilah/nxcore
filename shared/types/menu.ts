// shared/types/menu.ts

/**
 * iDempiere Menu Tree Types
 */

export interface IDempiereMenuAction {
  propertyLabel: string;
  id: string;
  identifier: string;
  'model-name': string;
}

export interface IDempiereWindow {
  propertyLabel: string;
  id: number;
  identifier: string;
  'model-name': string;
}

export interface IDempiereForm {
  propertyLabel: string;
  id: number;
  identifier: string;
  'model-name': string;
}

export interface IDempiereEntityType {
  propertyLabel: string;
  id: string;
  identifier: string;
  'model-name': string;
}

export interface IDempiereMenuEntry {
  id: number;
  uid: string;
  Name: string;
  Description?: string;
  IsSOTrx: boolean;
  'model-name': string;
  Action?: IDempiereMenuAction;
  AD_Window_ID?: IDempiereWindow;
  AD_Form_ID?: IDempiereForm;
  EntityType?: IDempiereEntityType;
  entries?: IDempiereMenuEntry[]; // Nested children
}

export interface IDempiereMenuTree {
  Name: string;
  Description: string;
  entries: IDempiereMenuEntry[];
}

/**
 * Simplified Menu Item for Sidebar
 */
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  href?: string;
  action?: 'Window' | 'Form' | 'Process' | 'Report' | 'Workflow';
  windowId?: number;
  formId?: number;
  children?: MenuItem[];
}
