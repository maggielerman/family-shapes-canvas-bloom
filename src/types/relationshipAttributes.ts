/**
 * Centralized relationship attributes configuration
 * This eliminates duplicate hardcoded data across components
 */

export interface RelationshipAttribute {
  value: string;
  label: string;
  description: string;
}

export interface RelationshipAttributeCategory {
  [key: string]: RelationshipAttribute[];
}

// Centralized relationship attributes organized by category
export const RELATIONSHIP_ATTRIBUTES: RelationshipAttributeCategory = {
  biological: [
    { value: "biological", label: "Biological", description: "Genetically related" },
    { value: "adopted", label: "Adopted", description: "Legal adoption" },
    { value: "step", label: "Step", description: "Through marriage/partnership" },
    { value: "foster", label: "Foster", description: "Foster care relationship" },
  ],
  
  legal: [
    { value: "legal", label: "Legal", description: "Legally recognized" },
    { value: "intended", label: "Intended", description: "Intended parent in ART" },
  ],
  
  art: [
    { value: "ivf", label: "IVF", description: "In vitro fertilization" },
    { value: "iui", label: "IUI", description: "Intrauterine insemination" },
    { value: "donor_conceived", label: "Donor Conceived", description: "Conceived using donor gametes" },
  ],
  
  sibling: [
    { value: "full", label: "Full", description: "Shares both biological parents" },
    { value: "half", label: "Half", description: "Shares one biological parent" },
    { value: "donor_sibling", label: "Dibling", description: "Shares same sperm/egg donor" },
    { value: "step_sibling", label: "Step", description: "Through parent's marriage/partnership" },
  ],
  
  donor: [
    { value: "sperm_donor", label: "Sperm Donor", description: "Provided sperm" },
    { value: "egg_donor", label: "Egg Donor", description: "Provided eggs" },
    { value: "embryo_donor", label: "Embryo Donor", description: "Provided embryo" },
  ],
};

// Helper functions for relationship attributes
export const RelationshipAttributeHelpers = {
  /**
   * Get all attributes as a flat array
   */
  getAllAttributes: (): RelationshipAttribute[] => {
    return Object.values(RELATIONSHIP_ATTRIBUTES).flat();
  },

  /**
   * Get attributes by category
   */
  getAttributesByCategory: (category: string): RelationshipAttribute[] => {
    return RELATIONSHIP_ATTRIBUTES[category] || [];
  },

  /**
   * Get attribute info by value
   */
  getAttributeByValue: (value: string): RelationshipAttribute | undefined => {
    const allAttributes = RelationshipAttributeHelpers.getAllAttributes();
    return allAttributes.find(attr => attr.value === value);
  },

  /**
   * Get relevant attribute categories based on relationship type
   */
  getRelevantCategories: (relationshipType: string): string[] => {
    const baseCategories = ['biological', 'legal'];
    
    switch (relationshipType) {
      case 'sibling':
        return [...baseCategories, 'art', 'sibling'];
      case 'donor':
        return ['donor'];
      case 'parent':
      case 'child':
        return [...baseCategories, 'art'];
      case 'gestational_carrier':
        return ['legal', 'art'];
      case 'partner':
        return ['legal'];
      default:
        return baseCategories;
    }
  },

  /**
   * Get attribute info for a list of attribute values
   */
  getAttributeInfo: (attributes: string[]): RelationshipAttribute[] => {
    return attributes.map(attrValue => {
      const attribute = RelationshipAttributeHelpers.getAttributeByValue(attrValue);
      return {
        value: attrValue,
        label: attribute?.label || attrValue,
        description: attribute?.description || ''
      };
    });
  }
};

// Export the legacy relationshipAttributes object for backward compatibility
export const relationshipAttributes = RELATIONSHIP_ATTRIBUTES; 