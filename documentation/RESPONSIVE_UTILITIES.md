# Responsive Utilities Guide

This document explains how to use the standardized responsive utilities and patterns to ensure consistent responsive behavior across all pages.

## Overview

We've created a comprehensive set of responsive utilities that use the `md:` breakpoint (768px) to match our mobile breakpoint defined in `useIsMobile`. This ensures consistent responsive behavior across all screen sizes.

## CSS Utility Classes

### Page Layout
```css
.responsive-page          /* space-y-4 md:space-y-6 */
.responsive-page-container /* px-6 lg:px-12 py-16 */
.responsive-header        /* flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-4 */
.responsive-title         /* text-2xl md:text-3xl font-bold */
.responsive-description   /* text-sm md:text-base text-muted-foreground */
```

### Card Layouts
```css
.responsive-grid          /* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 */
.responsive-card-header   /* flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 */
.responsive-card-title    /* text-sm md:text-base lg:text-lg font-semibold */
.responsive-card-content  /* text-lg md:text-xl lg:text-2xl font-bold */
.responsive-card-description /* text-xs md:text-sm text-muted-foreground */
```

### Typography
```css
.responsive-text-sm       /* text-xs md:text-sm */
.responsive-text-base     /* text-sm md:text-base */
.responsive-text-lg       /* text-base md:text-lg */
.responsive-text-xl       /* text-lg md:text-xl */
.responsive-text-2xl      /* text-xl md:text-2xl */
.responsive-text-3xl      /* text-2xl md:text-3xl */
```

### Icons
```css
.responsive-icon-sm       /* w-3 h-3 md:w-4 md:h-4 */
.responsive-icon-base     /* w-4 h-4 md:w-5 md:h-5 */
.responsive-icon-lg       /* w-5 h-5 md:w-6 md:h-6 */
.responsive-icon-xl       /* w-6 h-6 md:w-8 md:h-8 */
```

### Buttons
```css
.responsive-button        /* w-full md:w-auto */
.responsive-button-sm     /* h-7 w-7 md:h-8 md:w-auto p-0 md:px-3 */
```

### Spacing
```css
.responsive-gap-sm        /* gap-1 md:gap-2 */
.responsive-gap-base      /* gap-2 md:gap-3 */
.responsive-gap-lg        /* gap-3 md:gap-4 */
.responsive-gap-xl        /* gap-4 md:gap-6 */
```

### Flex Layouts
```css
.responsive-flex-col      /* flex flex-col md:flex-row */
.responsive-flex-center   /* flex flex-col md:flex-row md:items-center */
.responsive-flex-between  /* flex flex-col md:flex-row md:items-center md:justify-between */
```

### Tabs
```css
.responsive-tabs          /* space-y-4 md:space-y-6 */
.responsive-tabs-list     /* grid w-full grid-cols-3 h-auto */
.responsive-tabs-trigger  /* text-xs md:text-sm py-2 */
.responsive-tabs-content  /* space-y-4 md:space-y-6 */
```

### Tables
```css
.responsive-table-header  /* text-xs md:text-sm */
.responsive-table-cell    /* text-xs md:text-sm */
.responsive-table-hidden  /* hidden md:table-cell */
```

### Badges
```css
.responsive-badge         /* text-xs */
.responsive-badge-text    /* hidden md:inline */
.responsive-badge-text-mobile /* md:hidden */
```

### Dialogs
```css
.responsive-dialog        /* md:max-w-md */
.responsive-dialog-title  /* text-base md:text-lg */
.responsive-dialog-description /* text-sm */
```

### Content Width
```css
.responsive-content-sm    /* max-w-[150px] md:max-w-[200px] lg:max-w-none */
.responsive-content-base  /* max-w-[200px] md:max-w-none */
.responsive-content-lg    /* max-w-[250px] md:max-w-none */
```

### Avatar Sizes
```css
.responsive-avatar-sm     /* w-6 h-6 md:w-8 md:h-8 */
.responsive-avatar-base   /* w-8 h-8 md:w-10 md:h-10 */
.responsive-avatar-lg     /* w-10 h-10 md:w-12 md:h-12 */
```

### Text Display
```css
.responsive-text-truncate /* break-words */
.responsive-text-hidden   /* hidden md:inline */
.responsive-text-mobile   /* md:hidden */
```

## Usage Examples

### Basic Page Structure
```tsx
export default function MyPage() {
  return (
    <div className="responsive-page">
      <div className="responsive-header">
        <div>
          <h1 className="responsive-title">Page Title</h1>
          <p className="responsive-description">Page description</p>
        </div>
      </div>
      
      <div className="responsive-grid">
        {/* Cards */}
      </div>
    </div>
  );
}
```

### Card Component
```tsx
<Card>
  <CardHeader>
    <div className="responsive-card-header">
      <div className="flex items-center gap-2">
        <Icon className="responsive-icon-base" />
        <CardTitle className="responsive-card-title">Card Title</CardTitle>
      </div>
      <div className="responsive-text-sm text-muted-foreground">
        Additional info
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="responsive-card-content">42</div>
    <p className="responsive-card-description">Description</p>
  </CardContent>
</Card>
```

### Table Component
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="responsive-table-header">Column 1</TableHead>
      <TableHead className="responsive-table-header">Column 2</TableHead>
      <TableHead className="responsive-table-hidden">Column 3</TableHead>
      <TableHead className="responsive-table-header">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="responsive-table-cell">
        <Badge className="responsive-badge">
          <span className="responsive-badge-text">Full Label</span>
          <span className="responsive-badge-text-mobile">Short</span>
        </Badge>
      </TableCell>
      <TableCell className="responsive-table-cell">
        <div className="responsive-content-base">
          Content that wraps properly
        </div>
      </TableCell>
      <TableCell className="responsive-table-hidden">
        Hidden on mobile
      </TableCell>
      <TableCell className="responsive-table-cell">
        <div className="responsive-gap-sm flex">
          <Button className="responsive-button-sm">
            <Icon className="responsive-icon-sm" />
            <span className="responsive-text-hidden">Edit</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Tabs Component
```tsx
<Tabs defaultValue="all" className="responsive-tabs">
  <TabsList className="responsive-tabs-list">
    <TabsTrigger value="all" className="responsive-tabs-trigger">All</TabsTrigger>
    <TabsTrigger value="by-tree" className="responsive-tabs-trigger">By Tree</TabsTrigger>
    <TabsTrigger value="by-person" className="responsive-tabs-trigger">By Person</TabsTrigger>
  </TabsList>
  
  <TabsContent value="all" className="responsive-tabs-content">
    {/* Content */}
  </TabsContent>
</Tabs>
```

### Dialog Component
```tsx
<Dialog>
  <DialogContent className="responsive-dialog">
    <DialogHeader>
      <DialogTitle className="responsive-dialog-title">Dialog Title</DialogTitle>
      <DialogDescription className="responsive-dialog-description">
        Dialog description
      </DialogDescription>
    </DialogHeader>
    <div className="responsive-gap-lg flex">
      <Button className="responsive-button">Action</Button>
      <Button variant="outline" className="responsive-button">Cancel</Button>
    </div>
  </DialogContent>
</Dialog>
```

## Migration Guide

### Before (Inconsistent)
```tsx
<div className="space-y-4 sm:space-y-6">
  <div className="flex flex-col sm:flex-row sm:justify-between">
    <h1 className="text-2xl sm:text-3xl">Title</h1>
  </div>
</div>
```

### After (Consistent)
```tsx
<div className="responsive-page">
  <div className="responsive-header">
    <h1 className="responsive-title">Title</h1>
  </div>
</div>
```

## Benefits

1. **Consistency**: All responsive behavior uses the same 768px breakpoint
2. **Maintainability**: Changes to responsive behavior only need to be made in one place
3. **Readability**: Semantic class names make the code more readable
4. **Performance**: CSS classes are more efficient than inline styles
5. **Scalability**: Easy to add new responsive patterns as needed

## Best Practices

1. **Use utility classes** instead of inline responsive classes
2. **Follow the established patterns** for similar components
3. **Test on multiple screen sizes** to ensure consistency
4. **Document any new patterns** that are created
5. **Keep the mobile-first approach** in mind when designing

## Adding New Patterns

When adding new responsive patterns:

1. Add the CSS class to `src/index.css` in the `@layer components` section
2. Use the `md:` breakpoint for consistency
3. Follow the naming convention: `responsive-{component}-{variant}`
4. Document the new pattern in this guide
5. Update existing components to use the new pattern 