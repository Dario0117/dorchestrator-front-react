export type Collapsible = 'offcanvas' | 'icon' | 'none';
export type Variant = 'inset' | 'sidebar' | 'floating';

export type LayoutContextType = {
  resetLayout: () => void;

  defaultCollapsible: Collapsible;
  collapsible: Collapsible;
  setCollapsible: (collapsible: Collapsible) => void;

  defaultVariant: Variant;
  variant: Variant;
  setVariant: (variant: Variant) => void;
};

export type LayoutProviderProps = {
  children: React.ReactNode;
};
