import {
  DEFAULT_COLLAPSIBLE,
  DEFAULT_VARIANT,
  LAYOUT_COLLAPSIBLE_COOKIE_NAME,
  LAYOUT_COOKIE_MAX_AGE,
  LAYOUT_VARIANT_COOKIE_NAME,
} from '@context/layout.provider.constants';
import type {
  Collapsible,
  LayoutContextType,
  LayoutProviderProps,
  Variant,
} from '@context/layout.provider.types';
import { getCookie, setCookie } from '@lib/cookies.utils';
import { createContext, useContext, useState } from 'react';

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [collapsible, _setCollapsible] = useState<Collapsible>(() => {
    const saved = getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME);
    return (saved as Collapsible) || DEFAULT_COLLAPSIBLE;
  });

  const [variant, _setVariant] = useState<Variant>(() => {
    const saved = getCookie(LAYOUT_VARIANT_COOKIE_NAME);
    return (saved as Variant) || DEFAULT_VARIANT;
  });

  const setCollapsible = (newCollapsible: Collapsible) => {
    _setCollapsible(newCollapsible);
    setCookie(
      LAYOUT_COLLAPSIBLE_COOKIE_NAME,
      newCollapsible,
      LAYOUT_COOKIE_MAX_AGE,
    );
  };

  const setVariant = (newVariant: Variant) => {
    _setVariant(newVariant);
    setCookie(LAYOUT_VARIANT_COOKIE_NAME, newVariant, LAYOUT_COOKIE_MAX_AGE);
  };

  const resetLayout = () => {
    setCollapsible(DEFAULT_COLLAPSIBLE);
    setVariant(DEFAULT_VARIANT);
  };

  const contextValue: LayoutContextType = {
    resetLayout,
    defaultCollapsible: DEFAULT_COLLAPSIBLE,
    collapsible,
    setCollapsible,
    defaultVariant: DEFAULT_VARIANT,
    variant,
    setVariant,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
}

// Define the hook for the provider
export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
