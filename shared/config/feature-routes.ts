// shared/config/feature-routes.ts
/**
 * Feature Route Configuration
 * 
 * Purpose: Map iDempiere Window/Form/Process IDs to Feature modules
 * 
 * Best Practice Structure:
 * - Each feature has its own folder in /features
 * - Each feature exports its page component
 * - Route mapping connects iDempiere ID to feature component
 * 
 * Example Feature Structure:
 * features/
 *   production-barcode/
 *     components/
 *       ProductionBarcodePage.tsx  <- Main page component
 *       BarcodeScanner.tsx
 *       ScannedItemsList.tsx
 *     hooks/
 *       useProductionBarcode.ts
 *     services/
 *       production-barcode.service.ts
 *     types/
 *       index.ts
 *     index.ts  <- Export { ProductionBarcodePage }
 */

export interface FeatureRoute {
  // iDempiere identifiers
  windowId?: number;
  formId?: number;
  processId?: number;
  
  // Feature module path
  featurePath: string;  // e.g., 'production-barcode'
  componentName: string; // e.g., 'ProductionBarcodePage'
  
  // Metadata
  title: string;
  description?: string;
}

/**
 * Feature Route Mappings
 * 
 * Add your feature routes here
 */
export const FEATURE_ROUTES: FeatureRoute[] = [
  // Production Barcode (Window ID: 1000011)
  {
    windowId: 1000011,
    featurePath: 'production-barcode',
    componentName: 'ProductionBarcodePage',
    title: 'Production Barcode',
    description: 'Scan and track production barcodes'
  },
  {
    formId: 1000002,
    featurePath: 'production-assembly',
    componentName: 'ProductionAssemblyPage',
    title: 'Production Assembly',
    description: 'Track production assembly processes'
  },
  
  // Production Sewing (Form ID: 1000000)
  {
    formId: 1000000,
    featurePath: 'production-sewing',
    componentName: 'ProductionSewingPage',
    title: 'Production Sewing',
    description: 'Production sewing output tracking'
  },
  
  // Add more feature routes here as you develop new features
];

/**
 * Get feature route by Window ID
 */
export function getFeatureByWindowId(windowId: number): FeatureRoute | undefined {
  return FEATURE_ROUTES.find(route => route.windowId === windowId);
}

/**
 * Get feature route by Form ID
 */
export function getFeatureByFormId(formId: number): FeatureRoute | undefined {
  return FEATURE_ROUTES.find(route => route.formId === formId);
}

/**
 * Get feature route by Process ID
 */
export function getFeatureByProcessId(processId: number): FeatureRoute | undefined {
  return FEATURE_ROUTES.find(route => route.processId === processId);
}

/**
 * Check if window/form/process has a feature module
 */
export function hasFeatureModule(params: {
  windowId?: number;
  formId?: number;
  processId?: number;
}): boolean {
  if (params.windowId) return !!getFeatureByWindowId(params.windowId);
  if (params.formId) return !!getFeatureByFormId(params.formId);
  if (params.processId) return !!getFeatureByProcessId(params.processId);
  return false;
}
