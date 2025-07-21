# XYFlow Layout Features

## Overview

The XYFlow component now supports multiple layout algorithms to help visualize family trees in different ways. Each layout algorithm is optimized for specific use cases and data structures.

## Available Layout Algorithms

### 1. Manual Layout
- **Type**: `manual`
- **Description**: Drag nodes to position them manually
- **Best for**: Precise positioning and small family trees
- **Icon**: Network

### 2. Dagre Layout
- **Type**: `dagre`
- **Description**: Directed graph layout with hierarchical positioning
- **Best for**: Hierarchical family structures with clear parent-child relationships
- **Icon**: GitBranch
- **Library**: Dagre (JavaScript port of Graphviz)

### 3. ELK Layout
- **Type**: `elk`
- **Description**: Advanced layout engine with multiple algorithms
- **Best for**: Complex graphs with many nodes and relationships
- **Icon**: Target
- **Library**: ELK (Eclipse Layout Kernel)

### 4. D3 Hierarchy Layout
- **Type**: `d3-hierarchy`
- **Description**: Hierarchical tree layout using D3
- **Best for**: Traditional family tree visualization
- **Icon**: Users
- **Library**: D3.js

### 5. D3 Force Layout
- **Type**: `d3-force`
- **Description**: Force-directed layout for interactive graphs
- **Best for**: Exploring relationships interactively
- **Icon**: Zap
- **Library**: D3.js Force Simulation

### 6. D3 Cluster Layout
- **Type**: `d3-cluster`
- **Description**: Cluster layout for grouped hierarchies
- **Best for**: Grouping related family members
- **Icon**: Layers
- **Library**: D3.js

### 7. D3 Tree Layout
- **Type**: `d3-tree`
- **Description**: Traditional tree layout using D3
- **Best for**: Classic family tree visualization
- **Icon**: GitBranch
- **Library**: D3.js

## Implementation Details

### Components

1. **XYFlowLayoutSelector** (`src/components/family-trees/XYFlowLayoutSelector.tsx`)
   - Dropdown selector for choosing layout algorithms
   - Detailed descriptions and tips for each layout
   - Expandable details panel

2. **XYFlowLayoutService** (`src/components/family-trees/layouts/XYFlowLayoutService.ts`)
   - Service class handling all layout algorithms
   - Async layout application
   - Error handling and fallbacks

3. **XYFlowTreeBuilder** (Updated)
   - Integrated layout selector
   - Automatic layout application
   - Loading states and user feedback

### Dependencies

The following libraries were added to support the layout features:

```json
{
  "elkjs": "^0.9.2",
  "dagre": "^0.8.5",
  "@types/dagre": "^0.7.52"
}
```

### Usage

The layout selector is automatically integrated into the XYFlow component. Users can:

1. Select a layout algorithm from the dropdown
2. View detailed descriptions and tips
3. Apply layouts automatically
4. Reset to manual layout when needed
5. See loading indicators during layout application

### Technical Implementation

#### Layout Service Architecture

```typescript
class XYFlowLayoutService {
  static async applyLayout(
    nodes: Node[],
    edges: Edge[],
    layoutType: LayoutType,
    containerWidth: number,
    containerHeight: number
  ): Promise<LayoutResult>
}
```

#### Layout Application Flow

1. User selects layout algorithm
2. Layout service applies algorithm to nodes and edges
3. Node positions are updated
4. View is automatically fitted to show all nodes
5. Loading state is cleared

#### Error Handling

- Graceful fallback to manual layout on errors
- User-friendly error messages
- Console logging for debugging

## Testing

Comprehensive tests are included in `src/components/family-trees/layouts/XYFlowLayoutService.test.ts`:

- Manual layout preservation
- Dagre layout application
- D3 Force layout application
- Empty node handling
- Edge case handling

Run tests with:
```bash
npx vitest run src/components/family-trees/layouts/XYFlowLayoutService.test.ts
```

## Performance Considerations

- Layout algorithms run asynchronously to prevent UI blocking
- Loading states provide user feedback
- Automatic view fitting after layout application
- Error boundaries prevent layout failures from breaking the UI

## Future Enhancements

Potential improvements for future versions:

1. **Layout Configuration**: Allow users to customize layout parameters
2. **Layout Presets**: Pre-configured layouts for common family tree structures
3. **Animation**: Smooth transitions between different layouts
4. **Layout Comparison**: Side-by-side comparison of different layouts
5. **Export Layout**: Save and share specific layout configurations

## Browser Compatibility

All layout algorithms work in modern browsers that support:
- ES6+ features
- Canvas/SVG rendering
- Web Workers (for performance)

## Troubleshooting

### Common Issues

1. **Layout not applying**: Check console for errors, ensure nodes and edges are valid
2. **Performance issues**: Use manual layout for very large graphs (>100 nodes)
3. **Layout errors**: Try resetting to manual layout and selecting a different algorithm

### Debug Mode

Enable debug logging by setting:
```typescript
console.log('Layout application:', { nodes, edges, layoutType });
```

## Contributing

To add new layout algorithms:

1. Add the algorithm to `XYFlowLayoutService`
2. Update `LayoutType` and `layoutOptions` in `XYFlowLayoutSelector`
3. Add corresponding tests
4. Update documentation

## License

This implementation uses the following open-source libraries:
- Dagre: MIT License
- ELK: EPL-2.0 License
- D3.js: BSD-3-Clause License 