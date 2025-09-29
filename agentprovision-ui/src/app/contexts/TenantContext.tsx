import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tenant {
  id: string;
  name: string;
}

const mockTenants: Tenant[] = [
  { id: 'tenant-1', name: 'Acme Corp' },
  { id: 'tenant-2', name: 'Globex Inc.' },
  { id: 'tenant-3', name: 'Wayne Enterprises' },
];

interface TenantContextType {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  tenants: Tenant[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant>(mockTenants[0]);
  return (
    <TenantContext.Provider value={{ tenant, setTenant, tenants: mockTenants }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
}; 