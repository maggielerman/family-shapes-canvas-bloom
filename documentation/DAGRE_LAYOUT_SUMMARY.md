# Dagre Layout for Family Trees

## Overview

A new Dagre-based layout has been added to the family tree visualization system. Dagre is a directed graph layout library that provides excellent hierarchical layouts with automatic positioning and edge routing. This layout offers multiple orientation options and is particularly well-suited for complex family structures.

## Key Features

### 1. **Multiple Layout Orientations**
- **TB (Top-Bottom)**: Traditional hierarchical layout from top to bottom
- **LR (Left-Right)**: Horizontal layout from left to right
- **BT (Bottom-Top)**: Reversed hierarchical layout from bottom to top
- **RL (Right-Left)**: Reversed horizontal layout from right to left

### 2. **Automatic Layout Calculation**
- Dagre automatically calculates optimal node positions
- Minimizes edge crossings and optimizes space usage
- Handles complex hierarchical relationships efficiently
- Automatic edge routing with smooth curves

### 3. **Enhanced Node Design**
- Card-based nodes with rounded corners
- Profile photos with circular clipping
- Generation-based color coding
- Gender indicators (♂/♀ symbols)
- Generation labels and name display

### 4. **Interactive Controls**
- Layout direction cycling (Grid3X3 button)
- Zoom in/out controls
- Reset view functionality
- Real-time layout and zoom indicators

### 5. **Consistent Relationship Logic**
- Uses the same generational connection filtering as other layouts
- Only shows parent-child relationships as visual edges
- Sibling relationships are color-coded but not shown as lines
- Generation-based color palette consistent with other layouts

## Technical Implementation

### Component Location
```
src/components/family-trees/layouts/DagreLayout.tsx
```

### Dependencies
- **Dagre**: Core layout engine for directed graphs
- **D3.js**: SVG manipulation and zoom/pan functionality
- **Generation Utils**: For color coding and hierarchy calculation
- **React Hooks**: For state management and effects

### Key Dependencies Added
```bash
npm install dagre @types/dagre
```

### Integration
- Added as a new tab option in `FamilyTreeVisualization.tsx`
- Uses the "Share2" icon from Lucide React
- Lazy-loaded for performance optimization
- Follows the same interface pattern as other layout components

## Layout Configuration

### Graph Settings
```typescript
g.setGraph({
  rankdir: layoutDirection,  // TB, LR, BT, RL
  nodesep: 80,              // Vertical separation between nodes
  edgesep: 40,              // Horizontal separation between edges
  ranksep: 100,             // Separation between ranks
  marginx: 50,              // Horizontal margin
  marginy: 50               // Vertical margin
});
```

### Node Configuration
- **Width**: 120px
- **Height**: 80px
- **Border Radius**: 8px
- **Profile Photo**: 40x40px with circular clipping
- **Text**: Name and generation labels

## Usage

The Dagre layout is available as a new tab option in the family tree visualization:

1. Navigate to any family tree
2. Select the "Dagre" tab (Share2 icon)
3. Use the controls to:
   - Click the Grid3X3 button to cycle through layout directions
   - Use zoom controls for detailed viewing
   - Pan around the chart
   - Click on person cards to view details

## Layout Directions

### TB (Top-Bottom) - Default
- Traditional hierarchical layout
- Root ancestors at the top
- Descendants flow downward
- Best for traditional family tree viewing

### LR (Left-Right)
- Horizontal layout
- Root ancestors on the left
- Descendants flow rightward
- Good for wide screens and horizontal space

### BT (Bottom-Top)
- Reversed hierarchical layout
- Root ancestors at the bottom
- Descendants flow upward
- Alternative perspective for complex trees

### RL (Right-Left)
- Reversed horizontal layout
- Root ancestors on the right
- Descendants flow leftward
- Useful for right-to-left language contexts

## Benefits

1. **Automatic Layout**: No manual positioning required
2. **Multiple Orientations**: Adapts to different viewing preferences
3. **Efficient Space Usage**: Optimizes node placement
4. **Complex Relationship Support**: Handles intricate family structures
5. **Professional Appearance**: Clean, organized visual presentation
6. **Consistent Theming**: Matches existing design system

## Visual Design

### Node Cards
- **Size**: 120x80 pixels
- **Shape**: Rounded rectangles with 8px border radius
- **Content**: Profile photo, name, generation label, gender indicator
- **Colors**: Generation-based background and border colors

### Connections
- **Style**: Curved paths with automatic routing
- **Color**: Border color with 60% opacity
- **Width**: 2px stroke width

### Controls
- **Position**: Top-right corner
- **Style**: Outline buttons with icons
- **Functionality**: Layout direction, zoom in/out, reset view

## Future Enhancements

Potential improvements could include:
- Custom node templates
- Edge styling options
- Animation transitions between layouts
- Export to image/PDF
- Keyboard navigation
- Touch gesture support for mobile
- Custom layout algorithms
- Node clustering for large families

## Compatibility

- Works with existing family tree data structure
- Compatible with all relationship types
- Integrates with generation calculation system
- Follows existing component patterns
- Responsive design for different screen sizes
- Uses the same relationship hierarchy logic as other layouts

## Performance

- Lazy-loaded for optimal initial load time
- Efficient Dagre layout calculations
- Smooth zoom and pan interactions
- Minimal re-renders with React optimization
- Memory-efficient with proper cleanup

The Dagre layout provides a powerful, flexible alternative for visualizing family trees with automatic layout optimization and multiple orientation options. 