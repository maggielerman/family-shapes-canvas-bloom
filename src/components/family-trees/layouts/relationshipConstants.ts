// Define relationship categories for filtering
export const RELATIONSHIP_CATEGORIES = {
  generational: ['parent', 'child', 'grandparent', 'grandchild', 'great_grandparent', 'great_grandchild'],
  lateral: ['sibling', 'half_sibling', 'step_sibling', 'partner', 'spouse', 'ex_partner', 'cousin'],
  donor: ['donor', 'sperm_donor', 'egg_donor', 'surrogate', 'donor_sibling', 'donor_half_sibling']
} as const;

export type RelationshipCategory = keyof typeof RELATIONSHIP_CATEGORIES; 