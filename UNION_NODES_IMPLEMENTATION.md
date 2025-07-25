# Union Nodes Implementation Guide

This document explains the newly implemented union nodes system for handling complex family relationships in the DagreLayout.

## Overview

The union nodes system solves the visual complexity problem when dealing with multiple parents in family trees. Instead of having children connect directly to both parents (creating crossing lines and visual confusion), children now connect to a "union node" that represents the relationship between the parents.

## Architecture

### Core Components

1. **Types** (`src/types/unionTypes.ts`):
   - `UnionNode`: Represents a marriage/partnership between people
   - `EnhancedConnection`: Connections that can route through unions
   - `FamilyUnit`: Groups parents and children together
   - `UnionProcessedData`: Complete processed family structure

2. **Processing Service** (`src/services/unionProcessingService.ts`):
   - Analyzes person-to-person connections
   - Identifies potential unions (parents who share children)
   - Creates union nodes and reroutes connections
   - Handles different union types (marriage, partnership, donor relationships)

3. **Visual Components** (`src/components/family-trees/layouts/UnionNodeSVG.tsx`):
   - `UnionNodeSVG`: Renders individual union nodes
   - `UnionConnectionLine`: Handles connection lines from unions to children
   - `ParentUnionConnection`: Renders parent-to-union connections

4. **Enhanced Layout** (`src/components/family-trees/layouts/UnionDagreLayout.tsx`):
   - Extends DagreLayout with union node support
   - Integrates union processing with existing layout logic
   - Renders both person nodes and union nodes

## How It Works

### 1. Data Processing
```typescript
const unionData = processConnectionsWithUnions(persons, connections, {
  minSharedChildren: 1,
  includeSingleParents: false,
  groupSiblings: true
});
```

### 2. Union Detection
The system identifies unions by finding:
- Parents who share one or more children
- Explicit spouse/partner relationships
- Confidence scoring based on relationship strength

### 3. Connection Rerouting
Instead of:
```
Parent A ──→ Child
Parent B ──→ Child
```

We get:
```
Parent A ──→ Union Node ──→ Child
Parent B ──→ Union Node
```

### 4. Visual Representation
- **Marriage unions**: Red heart symbol (♥)
- **Partnership unions**: Blue diamond symbol (◊)
- **Donor relationships**: Orange "D" symbol
- **Other unions**: Gray circle (●)

## Usage Examples

### Basic Usage
```tsx
import { UnionDagreLayout } from './layouts/UnionDagreLayout';

<UnionDagreLayout
  persons={persons}
  connections={connections}
  relationshipTypes={relationshipTypes}
  width={1200}
  height={800}
  enableUnions={true}
  minSharedChildren={1}
  onPersonClick={handlePersonClick}
  onUnionClick={handleUnionClick}
  currentLayout="dagre"
  onLayoutChange={setCurrentLayout}
/>
```

### Testing with Demo
```tsx
import { UnionDagreLayoutDemo } from './layouts/UnionDagreLayoutDemo';

<UnionDagreLayoutDemo width={1200} height={800} />
```

## Configuration Options

### Union Processing Config
- `minSharedChildren`: Minimum shared children to create a union (default: 1)
- `includeSingleParents`: Whether to create unions for single parents (default: false)
- `groupSiblings`: Whether to group sibling relationships (default: true)

### Visual Customization
- `enableUnions`: Toggle union node creation on/off
- Union node colors and symbols are configurable in `UnionNodeSVG.tsx`
- Connection line styles can be modified for different relationship types

## Benefits

1. **Visual Clarity**: Eliminates crossing parent-child connection lines
2. **Logical Structure**: Groups family units together naturally
3. **Flexible Configuration**: Adjustable thresholds and behaviors
4. **Modular Design**: Can be enabled/disabled without affecting existing layouts
5. **Type Safety**: Full TypeScript support with comprehensive interfaces

## Integration with Existing Code

The union system is designed to be:
- **Non-breaking**: Existing DagreLayout continues to work unchanged
- **Modular**: All union logic is contained in separate files
- **Optional**: Can be enabled/disabled per use case
- **Compatible**: Works with existing person/connection data structures

## Sample Data Structure

The system works with standard Person and Connection data:

```typescript
// Standard person-to-person connections
const connections = [
  { from_person_id: 'parent1', to_person_id: 'child1', relationship_type: 'parent' },
  { from_person_id: 'parent2', to_person_id: 'child1', relationship_type: 'parent' },
  { from_person_id: 'parent1', to_person_id: 'parent2', relationship_type: 'spouse' }
];

// Gets automatically processed into:
// - Union node between parent1 and parent2
// - Single connection from union to child1
// - Parent-to-union connections
```

## Future Enhancements

Potential improvements for the union system:
1. Support for complex family structures (remarriage, blended families)
2. Interactive union editing and management
3. Union metadata (marriage dates, locations, etc.)
4. Advanced union algorithms for complex genealogies
5. Export functionality for processed union data

## Testing

Use the `UnionDagreLayoutDemo` component to test the system with sample family data. The demo includes:
- Toggle for enabling/disabling unions
- Adjustable minimum shared children threshold
- Sample multi-generational family with shared children
- Interactive controls for testing different configurations 