# Donor Relationship Management Implementation

## Overview

This implementation addresses the issue of proper donor handling in family tree visualization. Donors are now treated as being at the same generation level as recipient parents, rather than being treated as traditional parents in the relationship hierarchy.

## Key Design Principles

1. **Same Generation Placement**: Donors are placed at the same generation level as the recipient parent(s)
2. **Visual Distinction**: Donors have special visual treatment (different color, larger size, DNA icon)
3. **Logical Relationships**: Donor relationships don't create generational hierarchies like parent-child relationships
4. **Database Integration**: Full integration with existing donor table and services

## Implementation Details

### 1. Generation Calculation Logic (`src/utils/generationUtils.ts`)

#### New Features:
- **Donor Detection**: Identifies donors based on connection type
- **Same-Level Placement**: Places donors at the same generation as recipient parents
- **Special Coloring**: Assigns unique purple color (`#9333ea`) to donors
- **Generation Statistics**: Tracks donors separately in statistics

#### Key Functions Added:
- `isDonorConnection(relationshipType: string)`: Identifies donor relationships
- `getDonorConnections(connections)`: Filters donor connections
- `getDonorColor()`: Returns the special donor color

#### Updated Functions:
- `calculateGenerations()`: Now handles donor placement logic
- `getGenerationStats()`: Includes donor count
- `getGenerationColorPalette()`: Includes donor color in legend

### 2. Family Tree Visualization (`src/components/family-trees/FamilyTreeVisualization.tsx`)

#### New Features:
- **Add Donor Button**: Allows adding donors directly to family trees
- **Donor Statistics**: Shows donor count in overview panel
- **Donor Service Integration**: Uses DonorService for creating donor records

#### Changes Made:
- Added `AddDonorDialog` import and state management
- Added donor creation handler with proper database integration
- Updated statistics display to show donor count
- Added "Add Donor" button to controls

### 3. Tree Layout Visualization (`src/components/family-trees/layouts/TreeLayout.tsx`)

#### Visual Enhancements:
- **Larger Nodes**: Donors have 35px radius (vs 30px for regular persons)
- **Thicker Borders**: 4px border width for donors (vs 3px for regular)
- **DNA Icon**: 🧬 emoji displayed on donor nodes
- **Dashed Lines**: Special dashed purple lines for donor-child connections
- **Enhanced Legend**: Separate legend entry for donors

### 4. Radial Tree Layout (`src/components/family-trees/layouts/RadialTreeLayout.tsx`)

#### Similar Enhancements:
- Larger nodes (30px vs 25px radius)
- Thicker borders (4px vs 3px)
- DNA icon overlay
- Enhanced legend with donor section

### 5. Database Integration

#### Existing Services Enhanced:
- **DonorService**: Already provides full CRUD operations
- **Person-Donor Linking**: Creates both person and donor records
- **Family Tree Integration**: Adds donors as family tree members

#### Donor Creation Flow:
1. Create person record with `donor: true` flag
2. Create corresponding donor record with detailed information
3. Link donor to family tree as member
4. Create donor connections to children

## Usage Scenarios Supported

### 1. Single Mother by Choice
```
Generation 1: [Single Mom] [Donor (same level)]
              ↓           ↗ (dashed line)
Generation 2: [Child]
```

### 2. Lesbian Couple with Donors
```
Generation 1: [Mom A] [Mom B] [Egg Donor] [Sperm Donor]
              ↓       ↓       ↗         ↗ (all dashed)
Generation 2: [Child]
```

### 3. Multiple Children, Same Donor
```
Generation 1: [Parent] [Donor]
              ↓        ↗↗ (dashed lines to both children)
Generation 2: [Child1] [Child2]
```

## Visual Design Features

### Node Styling:
- **Regular Persons**: 30px radius, 3px border, generation color
- **Donors**: 35px radius, 4px border, purple color (#9333ea), DNA icon

### Connection Lines:
- **Parent-Child**: Solid lines (regular relationships)
- **Donor-Child**: Dashed purple lines (biological contribution)
- **Siblings**: No lines (color-coded grouping only)

### Legend:
- Regular generations with their assigned colors
- Special donor entry with DNA icon and count

## Testing

Created comprehensive test suite (`src/test/integration/donor-relationship-management.test.ts`) covering:

### Test Scenarios:
1. **Basic Donor Placement**: Verifies donors are at same generation as parents
2. **Visual Distinction**: Confirms special color and isDonor flag
3. **Generation Hierarchy**: Validates correct generation calculations
4. **Connection Filtering**: Tests proper separation of donor vs generational connections
5. **Statistics**: Verifies donor counting and generation stats
6. **Complex Families**: Multiple donors, lesbian couples, etc.
7. **Edge Cases**: Isolated donors, empty data sets

## Benefits

### For Users:
1. **Logical Visualization**: Donors appear at the correct generational level
2. **Clear Distinction**: Easy to identify donors vs social parents
3. **Biological Accuracy**: Represents genetic contribution without hierarchical confusion
4. **Comprehensive Information**: Full donor details and characteristics

### For Developers:
1. **Consistent Logic**: Clear separation between generational and donor relationships
2. **Extensible Design**: Easy to add new donor types or visualization features
3. **Type Safety**: Proper TypeScript integration throughout
4. **Test Coverage**: Comprehensive test suite for reliability

## Future Enhancements

### Potential Additions:
1. **Gestational Carriers**: Similar treatment to donors but for surrogacy
2. **Adoption Relationships**: Social vs biological parent distinctions
3. **Donor Matching**: Visual connections between half-siblings with same donor
4. **Medical History**: Integration of donor medical information
5. **Anonymous vs Known**: Different visual treatment based on anonymity

## Database Schema

### Tables Used:
- **donors**: Detailed donor information and characteristics
- **persons**: Basic person data with `donor: boolean` flag
- **connections**: Relationships with `relationship_type: 'donor'`
- **family_tree_members**: Links donors to specific family trees

### Connection Types:
- `'donor'`: Biological contribution (not generational)
- `'parent'`: Social/legal parent (generational)
- `'biological_parent'`: Birth parent (generational)

## Migration Considerations

### Existing Data:
- No breaking changes to existing relationships
- Donor relationships will be automatically detected and visualized correctly
- Existing donors in database will be properly integrated

### Backward Compatibility:
- All existing functionality preserved
- Enhanced visualization doesn't affect data integrity
- Previous relationship types continue to work as expected

## Summary

This implementation provides a comprehensive solution for donor relationship management that:

1. **Solves the Core Issue**: Donors are no longer incorrectly placed in parent generation
2. **Maintains Logical Hierarchies**: Generation structure reflects actual family relationships
3. **Provides Visual Clarity**: Clear distinction between donors and social parents
4. **Supports Complex Families**: Handles various modern family structures
5. **Integrates Seamlessly**: Works with existing database and service architecture

The solution respects the biological reality that donors provide genetic material (50% DNA contribution) while maintaining the social and legal distinction that they are not parents in the traditional family structure sense.