import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * ResponsiveWrapper provides consistent responsive patterns for pages using SidebarLayout.
 * This component wraps content with standardized responsive spacing and layout classes.
 */
export function ResponsiveWrapper({ children, className }: ResponsiveWrapperProps) {
  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveHeader provides consistent header styling for page titles and descriptions.
 */
export function ResponsiveHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-4", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveTitle provides consistent title styling with responsive typography.
 */
export function ResponsiveTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <h1 className={cn("text-2xl md:text-3xl font-bold", className)}>
      {children}
    </h1>
  );
}

/**
 * ResponsiveDescription provides consistent description styling with responsive typography.
 */
export function ResponsiveDescription({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <p className={cn("text-sm md:text-base text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/**
 * ResponsiveGrid provides consistent grid layouts for cards and content sections.
 */
export function ResponsiveGrid({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveCard provides consistent card styling with responsive typography.
 */
export function ResponsiveCard({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("p-4 md:p-6", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveCardTitle provides consistent card title styling.
 */
export function ResponsiveCardTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <h3 className={cn("text-sm md:text-base lg:text-lg font-semibold", className)}>
      {children}
    </h3>
  );
}

/**
 * ResponsiveCardContent provides consistent card content styling.
 */
export function ResponsiveCardContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("text-lg md:text-xl lg:text-2xl font-bold", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveCardDescription provides consistent card description styling.
 */
export function ResponsiveCardDescription({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <p className={cn("text-xs md:text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/**
 * ResponsiveTabs provides consistent tabs styling.
 */
export function ResponsiveTabs({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveTabsList provides consistent tabs list styling.
 */
export function ResponsiveTabsList({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("grid w-full grid-cols-3 h-auto", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveTabsTrigger provides consistent tabs trigger styling.
 */
export function ResponsiveTabsTrigger({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("text-xs md:text-sm py-2", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveTabsContent provides consistent tabs content styling.
 */
export function ResponsiveTabsContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveButton provides consistent button styling with responsive sizing.
 */
export function ResponsiveButton({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("w-full md:w-auto", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveIcon provides consistent icon styling with responsive sizing.
 */
export function ResponsiveIcon({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("w-4 h-4 md:w-5 md:h-5", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveText provides consistent text styling with responsive typography.
 */
export function ResponsiveText({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <span className={cn("text-xs md:text-sm", className)}>
      {children}
    </span>
  );
}

/**
 * ResponsiveBadge provides consistent badge styling with responsive text.
 */
export function ResponsiveBadge({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <span className={cn("text-xs", className)}>
      {children}
    </span>
  );
}

/**
 * ResponsiveFlex provides consistent flex layout with responsive direction.
 */
export function ResponsiveFlex({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4", className)}>
      {children}
    </div>
  );
}

/**
 * ResponsiveGap provides consistent gap spacing with responsive sizing.
 */
export function ResponsiveGap({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("gap-1 md:gap-2", className)}>
      {children}
    </div>
  );
} 