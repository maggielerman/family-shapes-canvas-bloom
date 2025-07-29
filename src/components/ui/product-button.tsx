import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useProductContext } from "@/lib/productContext";

const productButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Product-specific variants that use dynamic theming
        organization: "bg-navy-600 text-white shadow hover:bg-navy-700",
        family: "bg-coral-600 text-white shadow hover:bg-coral-700", 
        donor: "bg-sage-600 text-white shadow hover:bg-sage-700",
        accent: "bg-terracotta-600 text-white shadow hover:bg-terracotta-700"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ProductButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof productButtonVariants> {
  asChild?: boolean;
}

const ProductButton = React.forwardRef<HTMLButtonElement, ProductButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { productGroup } = useProductContext();
    
    // If no specific variant is provided, use the product group as default
    const effectiveVariant = variant || productGroup;
    
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        className={cn(productButtonVariants({ variant: effectiveVariant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ProductButton.displayName = "ProductButton";

export { ProductButton, productButtonVariants };