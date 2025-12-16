'use client';

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import FormSelectField from "@/shared/components/organisms/FormSelectField";
import { ContextFormData, ContextOptions, ContextSelectionFormProps } from "../../types";
import { useLazyGetOrganizationsQuery, useLazyGetRolesQuery, useLazyGetWarehousesQuery } from "../../api/authApi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";

const ContextSelectionForm = ({
  authToken,
  availableClients,
  onSubmit,
  onBack,
  isLoading,
}: ContextSelectionFormProps) => {
  const clientSelectRef = useRef<HTMLSelectElement>(null);
  
  // RTK Query lazy hooks for cascading dropdowns
  const [getRoles, { data: rolesData, isLoading: isLoadingRoles }] = useLazyGetRolesQuery();
  const [getOrganizations, { data: organizationsData, isLoading: isLoadingOrgs }] = useLazyGetOrganizationsQuery();
  const [getWarehouses, { data: warehousesData, isLoading: isLoadingWarehouses }] = useLazyGetWarehousesQuery();
  
  const [formData, setFormData] = useState<ContextFormData>({
    clientId: 0,
    roleId: 0,
    organizationId: 0,
    warehouseId: 0,
    language: 'en_US',
  });

  const [contextOptions, setContextOptions] = useState<ContextOptions>({
    clients: availableClients,
    roles: rolesData || [],
    organizations: organizationsData || [],
    warehouses: warehousesData || [],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-focus on mount
  useEffect(() => {
    if (clientSelectRef.current) {
      clientSelectRef.current.focus();
    }
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericValue = name.includes('Id') ? Number(value) : value;
    
    console.log(`📝 Context field changed: ${name} = ${value} (numeric: ${numericValue})`);
    
    const updatedData = {
      ...formData,
      [name]: numericValue,
    };
    
    setFormData(updatedData);
    console.log('✅ Context form data updated:', updatedData);
    
    // Clear field error when user selects
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Fetch dependent data when selections change using RTK Query
    if (name === 'clientId' && numericValue) {
      // Fetch roles when client is selected
      setFormData((prev) => ({ ...prev, roleId: 0, organizationId: 0, warehouseId: 0 }));
      setContextOptions((prev) => ({ ...prev, roles: [], organizations: [], warehouses: [] }));
      
      getRoles({ token: authToken, clientId: Number(numericValue) });
    } else if (name === 'roleId' && numericValue && formData.clientId) {
      // Fetch organizations when role is selected
      setFormData((prev) => ({ ...prev, organizationId: 0, warehouseId: 0 }));
      setContextOptions((prev) => ({ ...prev, organizations: [], warehouses: [] }));
      
      getOrganizations({ token: authToken, clientId: formData.clientId, roleId: Number(numericValue) });
    } else if (name === 'organizationId' && numericValue && formData.clientId && formData.roleId) {
      // Fetch warehouses when organization is selected
      setFormData((prev) => ({ ...prev, warehouseId: 0 }));
      setContextOptions((prev) => ({ ...prev, warehouses: [] }));
      
      getWarehouses({ 
        token: authToken, 
        clientId: formData.clientId, 
        roleId: formData.roleId, 
        organizationId: Number(numericValue) 
      });
    }
  };

  const validateContext = () => {
    const errors: Record<string, string> = {};
    
    const clientIdNum = Number(formData.clientId);
    const roleIdNum = Number(formData.roleId);
    const orgIdNum = Number(formData.organizationId);
    // Warehouse is optional - some users don't have warehouse
    
    if (!clientIdNum || isNaN(clientIdNum)) {
      errors.clientId = 'Client harus dipilih';
    }
    
    if (!roleIdNum || isNaN(roleIdNum)) {
      errors.roleId = 'Role harus dipilih';
    }
    
    if (isNaN(orgIdNum)) {
      errors.organizationId = 'Organization harus dipilih';
    }
    
    // Warehouse is optional - no validation needed
    
    console.log('🔍 Validating context:', {
      formData,
      parsed: { clientIdNum, roleIdNum, orgIdNum }
    });
    console.log('❌ Validation errors:', errors);
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContext()) {
      return;
    }
    
    // Find names for selected IDs from RTK Query data or contextOptions
    const client = contextOptions.clients.find(c => Number(c.id) === Number(formData.clientId));
    const role = rolesData?.find(r => Number(r.id) === Number(formData.roleId));
    const org = organizationsData?.find(o => Number(o.id) === Number(formData.organizationId));
    const warehouse = warehousesData?.find(w => Number(w.id) === Number(formData.warehouseId));

    const dataWithNames: ContextFormData = {
      ...formData,
      clientName: client?.name,
      roleName: role?.name,
      organizationName: org?.name,
      warehouseName: warehouse?.name,
    };

    console.log('📤 Submitting context data:', dataWithNames);
    console.log('📊 Organization data:', { 
      organizationsData, 
      selectedOrgId: formData.organizationId,
      foundOrg: org 
    });
    await onSubmit(dataWithNames);
  };

  return (
    <Card className="w-full max-w-[95%] sm:max-w-md mx-auto shadow-2xl animate-scale-in border-muted/50">
      <CardHeader className="space-y-2 pb-4 sm:pb-5 px-4 sm:px-6 pt-5 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">
          Pilih Context
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base text-muted-foreground">
          Pilih Client, Role, Organization, dan Warehouse
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <FormSelectField
            ref={clientSelectRef}
            id="clientId"
            name="clientId"
            label="Client"
            options={contextOptions.clients.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            value={formData.clientId || ''}
            onChange={handleInputChange}
            error={fieldErrors.clientId}
            required
            disabled={isLoading}
            placeholder="Pilih Client"
          />

          <FormSelectField
            id="roleId"
            name="roleId"
            label="Role"
            options={(rolesData || []).map((r) => ({
              value: r.id,
              label: r.name,
            }))}
            value={formData.roleId || ''}
            onChange={handleInputChange}
            error={fieldErrors.roleId}
            required
            disabled={isLoading || isLoadingRoles || !formData.clientId}
            placeholder={isLoadingRoles ? "Memuat roles..." : (!rolesData || rolesData.length === 0) ? "Pilih Client terlebih dahulu" : "Pilih Role"}
          />

          <FormSelectField
            id="organizationId"
            name="organizationId"
            label="Organization"
            options={(organizationsData || []).map((o) => ({
              value: o.id,
              label: o.name,
            }))}
            value={formData.organizationId || ''}
            onChange={handleInputChange}
            error={fieldErrors.organizationId}
            required
            disabled={isLoading || isLoadingOrgs || !formData.roleId}
            placeholder={isLoadingOrgs ? "Memuat organizations..." : (!organizationsData || organizationsData.length === 0) ? "Pilih Role terlebih dahulu" : "Pilih Organization"}
          />

          <FormSelectField
            id="warehouseId"
            name="warehouseId"
            label="Warehouse (Opsional)"
            options={(warehousesData || []).map((w) => ({
              value: w.id,
              label: w.name,
            }))}
            value={formData.warehouseId || ''}
            onChange={handleInputChange}
            error={fieldErrors.warehouseId}
            disabled={isLoading || isLoadingWarehouses || !formData.organizationId}
            placeholder={isLoadingWarehouses ? "Memuat warehouses..." : (!warehousesData || warehousesData.length === 0) ? "Tidak ada warehouse atau pilih Organization terlebih dahulu" : "Pilih Warehouse (opsional)"}
          />

          <FormSelectField
            id="language"
            name="language"
            label="Language"
            options={[
              { value: 'en_US', label: 'English (US)' },
              { value: 'id_ID', label: 'Bahasa Indonesia' },
            ]}
            value={formData.language}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-4 sm:px-6 pb-5 mt-5 sm:pb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          
          <Button 
            type="submit"
            className="w-full h-10 sm:h-11 text-sm sm:text-base" 
            variant="default" 
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Lanjutkan"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
 
export default ContextSelectionForm;
