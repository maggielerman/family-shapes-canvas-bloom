import { createContext, useContext } from 'react';

export type ProductGroup = 'organization' | 'family' | 'donor';

export interface ProductContextType {
  productGroup: ProductGroup;
  setProductGroup: (group: ProductGroup) => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

/**
 * Determines the product group based on the current URL path
 */
export const detectProductGroup = (pathname: string): ProductGroup => {
  // Organization/SaaS paths
  if (pathname.includes('/organizations') || 
      pathname.includes('/get-started') ||
      pathname.includes('/organization-dashboard') ||
      pathname.includes('/admin')) {
    return 'organization';
  }
  
  // Donor paths
  if (pathname.includes('/for-donors') ||
      pathname.includes('/donor-landing')) {
    return 'donor';
  }
  
  // Family/recipient paths (default for most user-facing pages)
  return 'family';
};

/**
 * Get the appropriate primary color for the current product group
 */
export const getProductPrimaryColor = (productGroup: ProductGroup): string => {
  switch (productGroup) {
    case 'organization':
      return 'hsl(var(--navy-600))'; // Navy for organizations/SaaS
    case 'family':
      return 'hsl(var(--coral-600))'; // Coral for recipient families  
    case 'donor':
      return 'hsl(var(--sage-600))'; // Sage for donors
    default:
      return 'hsl(var(--coral-600))'; // Default fallback
  }
};

/**
 * Get the appropriate accent color for the current product group
 */
export const getProductAccentColor = (productGroup: ProductGroup): string => {
  // Terracotta is the universal accent color across all product groups
  return 'hsl(var(--terracotta-600))';
};