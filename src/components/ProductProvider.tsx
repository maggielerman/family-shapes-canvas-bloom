import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ProductContext, ProductGroup, detectProductGroup } from '@/lib/productContext';

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const location = useLocation();
  const [productGroup, setProductGroup] = useState<ProductGroup>(() => 
    detectProductGroup(location.pathname)
  );

  // Update product group when route changes
  useEffect(() => {
    const newProductGroup = detectProductGroup(location.pathname);
    setProductGroup(newProductGroup);
  }, [location.pathname]);

  // Apply CSS custom properties for dynamic theming
  useEffect(() => {
    const root = document.documentElement;
    
    // Update CSS custom properties based on product group
    switch (productGroup) {
      case 'organization':
        root.style.setProperty('--primary-dynamic', 'var(--navy-600)');
        root.style.setProperty('--primary-foreground-dynamic', '255 255 255');
        break;
      case 'family':
        root.style.setProperty('--primary-dynamic', 'var(--coral-600)');
        root.style.setProperty('--primary-foreground-dynamic', '255 255 255');
        break;
      case 'donor':
        root.style.setProperty('--primary-dynamic', 'var(--sage-600)');
        root.style.setProperty('--primary-foreground-dynamic', '255 255 255');
        break;
    }
    
    // Terracotta is always the accent color
    root.style.setProperty('--accent-dynamic', 'var(--terracotta-600)');
    root.style.setProperty('--accent-foreground-dynamic', '255 255 255');
  }, [productGroup]);

  return (
    <ProductContext.Provider value={{ productGroup, setProductGroup }}>
      {children}
    </ProductContext.Provider>
  );
};