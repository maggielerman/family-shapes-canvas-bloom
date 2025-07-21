# Duplicate Connection Fix

## Problem

The family tree was showing duplicate connections for bidirectional relationships like siblings. For example:
- Oliver → Maggie (Sibling)
- Maggie → Oliver (Sibling)

This created visual clutter and confusion in both the connection list and the XYFlow visualization.

## Solution

### 1. Relationship Classification

**Bidirectional Relationships** (show as single lines):
- Sibling
- Half Sibling  
- Step Sibling
- Partner
- Spouse
- Other

**Directional Relationships** (show with arrows):
- Parent
- Child
- Donor
- Biological Parent
- Social Parent

### 2. Implementation

#### New Utilities (`src/components/family-trees/utils/relationshipUtils.ts`)

- `isBidirectionalRelationship()` - Identifies which relationships are bidirectional
- `getCanonicalDirection()` - Ensures consistent direction for bidirectional relationships
- `deduplicateConnections()` - Removes duplicate connections from display
- `connectionExists()` - Prevents creating duplicate connections
- `getConnectionDisplayText()` - Shows bidirectional relationships with ↔ symbol

#### Updated Components

**XYFlowConnectionManager**:
- Uses canonical direction when creating connections
- Displays bidirectional relationships with ↔ instead of →
- Deduplicates connections in the list view

**XYFlowTreeBuilder**:
- Removes arrow markers for bidirectional relationships
- Deduplicates connections in the visualization
- Shows single lines for sibling/partner relationships

### 3. Database Cleanup

**Cleanup Script** (`src/components/family-trees/utils/cleanupDuplicates.ts`):
- Removes existing duplicate connections
- Standardizes connection directions
- Can be run via admin interface

**Admin Component** (`src/components/admin/DuplicateCleanup.tsx`):
- Provides UI to run the cleanup
- Shows progress and results
- Includes safety warnings

## Usage

### For New Connections

1. Create connections normally through the UI
2. System automatically uses canonical direction
3. Bidirectional relationships show as single lines
4. No duplicates are created

### For Existing Data

1. Go to Admin page
2. Use "Duplicate Connection Cleanup" tool
3. Run the cleanup to fix existing duplicates
4. Verify results in family tree view

## Visual Changes

### Before Fix
```
Oliver → Maggie (Sibling)     [Remove]
Maggie → Oliver (Sibling)     [Remove]
```

### After Fix  
```
Oliver ↔ Maggie (Sibling)     [Remove]
```

### XYFlow Visualization

**Before**: Two arrows between siblings
**After**: Single line without arrows for bidirectional relationships

## Best Practices

### Family Tree Standards

Following industry standards like Ancestry.com:

1. **Sibling Relationships**: Single bidirectional line
2. **Parent-Child**: Directional arrow (Parent → Child)
3. **Partner/Spouse**: Single bidirectional line
4. **Complex Relationships**: Use appropriate relationship types

### Database Design

- Store bidirectional relationships in canonical direction
- Use relationship type to determine display behavior
- Prevent duplicate creation at application level
- Provide cleanup tools for existing data

## Testing

### Manual Testing
1. Create sibling relationship between two people
2. Verify only one connection appears in list
3. Verify single line in XYFlow visualization
4. Try to create duplicate - should be prevented

### Automated Testing
- Unit tests for relationship utilities
- Integration tests for connection creation
- Visual regression tests for XYFlow display

## Migration

### For Existing Users
1. Run cleanup script once
2. Verify family trees display correctly
3. Continue using normal connection creation

### For New Users
- No migration needed
- System prevents duplicates from creation

## Future Enhancements

1. **Relationship Strength**: Add weight/strength to relationships
2. **Multiple Relationships**: Allow multiple relationship types between same people
3. **Relationship History**: Track relationship changes over time
4. **Advanced Visualization**: Custom line styles for different relationship types 