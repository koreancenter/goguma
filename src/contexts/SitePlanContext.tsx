import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { SitePlan, MetadataConfig, DesignConfig, NavigationConfig } from '../types';
import { INITIAL_SITE_PLAN } from '../lib/initialPlan';

interface SitePlanContextType {
  plan: SitePlan;
  updateMetadata: (metadata: Partial<MetadataConfig>) => void;
  updateDesign: (design: Partial<DesignConfig>) => void;
  updateNavigation: (navigation: Partial<NavigationConfig>) => void;
  setPlan: (plan: SitePlan) => void;
}

const SitePlanContext = createContext<SitePlanContextType | undefined>(undefined);

export function SitePlanProvider({ 
  children, 
  plan: externalPlan, 
  onChange: externalOnChange 
}: { 
  children: React.ReactNode; 
  plan?: SitePlan; 
  onChange?: (plan: SitePlan) => void;
}) {
  const [internalPlan, setInternalPlan] = useState<SitePlan>(INITIAL_SITE_PLAN);

  const plan = externalPlan !== undefined ? externalPlan : internalPlan;
  const onChange = externalOnChange !== undefined ? externalOnChange : setInternalPlan;

  const updateMetadata = useCallback((metadata: Partial<MetadataConfig>) => {
    onChange({
      ...plan,
      metadata: { ...plan.metadata, ...metadata }
    });
  }, [plan, onChange]);

  const updateDesign = useCallback((design: Partial<DesignConfig>) => {
    onChange({
      ...plan,
      design: { ...plan.design, ...design }
    });
  }, [plan, onChange]);

  const updateNavigation = useCallback((navigation: Partial<NavigationConfig>) => {
    onChange({
      ...plan,
      navigation: { ...plan.navigation, ...navigation }
    });
  }, [plan, onChange]);

  const value = useMemo(() => ({
    plan,
    updateMetadata,
    updateDesign,
    updateNavigation,
    setPlan: onChange
  }), [plan, updateMetadata, updateDesign, updateNavigation, onChange]);

  return (
    <SitePlanContext.Provider value={value}>
      {children}
    </SitePlanContext.Provider>
  );
}

export function useSitePlan() {
  const context = useContext(SitePlanContext);
  if (context === undefined) {
    console.warn('useSitePlan must be used within a SitePlanProvider. Falling back to default plan.');
    return {
      plan: INITIAL_SITE_PLAN,
      updateMetadata: () => {},
      updateDesign: () => {},
      updateNavigation: () => {},
      setPlan: () => {},
    };
  }
  return context;
}

// Specialized hooks for better performance (splitting selectors)
export function useMetadata() {
  const { plan, updateMetadata } = useSitePlan();
  return { metadata: plan.metadata, updateMetadata };
}

export function useDesign() {
  const { plan, updateDesign } = useSitePlan();
  return { design: plan.design, updateDesign };
}

export function useNavigation() {
  const { plan, updateNavigation } = useSitePlan();
  return { navigation: plan.navigation, updateNavigation };
}
