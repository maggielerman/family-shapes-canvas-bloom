export interface RelationshipDisplayInfo {
  label: string;
  description: string;
  otherPersonName: string;
  canEdit: boolean;
}

export interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
  direction?: 'incoming' | 'outgoing';
  other_person_name?: string;
  other_person_id?: string;
  metadata?: any; // Database JSONB field
}

export const relationshipTypes = [
  { value: "parent", label: "Parent", icon: "Users", color: "hsl(var(--chart-1))" },
  { value: "child", label: "Child", icon: "Baby", color: "hsl(var(--chart-2))" },
  { value: "partner", label: "Partner", icon: "Heart", color: "hsl(var(--chart-3))" },
  { value: "sibling", label: "Sibling", icon: "Users", color: "hsl(var(--chart-4))" },
  { value: "donor", label: "Donor", icon: "Dna", color: "hsl(var(--chart-5))" },
  { value: "gestational_carrier", label: "Gestational Carrier", icon: "Baby", color: "hsl(var(--chart-1))" },
];

/**
 * Get the reciprocal relationship type
 */
export const getReciprocalRelationship = (relationshipType: string): string => {
  const reciprocals: Record<string, string> = {
    'parent': 'child',
    'child': 'parent',
    'partner': 'partner',
    'sibling': 'sibling',
    'donor': 'child',
    'gestational_carrier': 'child'
  };
  return reciprocals[relationshipType] || relationshipType;
};

/**
 * Get the display label for a relationship based on direction
 */
export const getDisplayLabel = (connection: Connection): string => {
  if (connection.direction === 'incoming') {
    // For incoming connections, show the reciprocal label
    return getReciprocalRelationship(connection.relationship_type);
  } else {
    // For outgoing connections, show the original relationship type
    return connection.relationship_type;
  }
};

/**
 * Get the display text for a relationship connection
 * This function determines how relationships should be displayed from the current person's perspective
 */
export const getConnectionDisplayText = (
  connection: Connection, 
  currentPersonName: string
): RelationshipDisplayInfo => {
  const otherPersonName = connection.other_person_name || 'Unknown';
  
  if (connection.direction === 'incoming') {
    // For incoming connections, show the relationship from the current person's perspective
    // If someone is the parent of this person, then this person is their child
    if (connection.relationship_type === 'parent') {
      // Someone is this person's parent, so this person is their child
      return {
        label: 'Child',
        description: `${currentPersonName} is ${otherPersonName}'s child`,
        otherPersonName,
        canEdit: true
      };
    } else if (connection.relationship_type === 'child') {
      // Someone is this person's child, so this person is their parent
      return {
        label: 'Parent',
        description: `${currentPersonName} is ${otherPersonName}'s parent`,
        otherPersonName,
        canEdit: true
      };
    } else {
      // For symmetric relationships like partner/sibling
      const label = getReciprocalRelationship(connection.relationship_type);
      return {
        label,
        description: `${currentPersonName} is ${otherPersonName}'s ${label.toLowerCase()}`,
        otherPersonName,
        canEdit: true
      };
    }
  } else {
    // For outgoing connections, show the relationship from the current person's perspective
    if (connection.relationship_type === 'parent') {
      // This person is someone's parent
      return {
        label: 'Parent',
        description: `${currentPersonName} is ${otherPersonName}'s parent`,
        otherPersonName,
        canEdit: true
      };
    } else if (connection.relationship_type === 'child') {
      // This person is someone's child
      return {
        label: 'Child',
        description: `${currentPersonName} is ${otherPersonName}'s child`,
        otherPersonName,
        canEdit: true
      };
    } else {
      // For symmetric relationships like partner/sibling
      const relationshipType = relationshipTypes.find(rt => rt.value === connection.relationship_type);
      const label = relationshipType?.label || connection.relationship_type;
      return {
        label,
        description: `${currentPersonName} is ${otherPersonName}'s ${label.toLowerCase()}`,
        otherPersonName,
        canEdit: true
      };
    }
  }
};

/**
 * Get the relationship icon name
 */
export const getRelationshipIcon = (type: string): string => {
  const relationship = relationshipTypes.find(r => r.value === type);
  return relationship?.icon || 'Link2';
};

/**
 * Get the relationship color
 */
export const getRelationshipColor = (type: string): string => {
  return relationshipTypes.find(r => r.value === type)?.color || "hsl(var(--muted-foreground))";
};

/**
 * Helper function to determine reciprocal attributes
 */
export const getReciprocalAttributes = (relationshipType: string, attributes: string[]): string[] => {
  // Some attributes should be preserved in reciprocal relationships
  const preservedAttributes = attributes.filter(attr => {
    // Preserve biological/legal context and ART context
    return ['biological', 'adopted', 'step', 'foster', 'legal', 'intended', 'ivf', 'iui', 'donor_conceived'].includes(attr);
  });
  
  // For siblings, preserve specific sibling attributes
  if (relationshipType === 'sibling') {
    const siblingAttributes = attributes.filter(attr => 
      ['full', 'half', 'donor_sibling', 'step_sibling'].includes(attr)
    );
    return [...preservedAttributes, ...siblingAttributes];
  }
  
  return preservedAttributes;
}; 