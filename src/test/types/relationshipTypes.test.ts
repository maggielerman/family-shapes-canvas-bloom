import { describe, it, expect } from 'vitest';
import { RelationshipTypeHelpers, RELATIONSHIP_TYPE_CONFIGS } from '@/types/relationshipTypes';
import { RelationshipType } from '@/types/connection';

describe('RelationshipTypeHelpers', () => {
  describe('getAllTypes', () => {
    it('should return all relationship types', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      
      expect(types).toContain('parent');
      expect(types).toContain('child');
      expect(types).toContain('partner');
      expect(types).toContain('sibling');
      expect(types).toContain('half_sibling');
      expect(types).toContain('step_sibling');
      expect(types).toContain('spouse');
      expect(types).toContain('donor');
      expect(types).toContain('biological_parent');
      expect(types).toContain('social_parent');
      expect(types).toContain('other');
      
      expect(types.length).toBe(11);
    });

    it('should return types that match the RELATIONSHIP_TYPE_CONFIGS keys', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      const configKeys = Object.keys(RELATIONSHIP_TYPE_CONFIGS);
      
      expect(types).toEqual(configKeys);
    });
  });

  describe('getConfig', () => {
    it('should return correct configuration for parent type', () => {
      const config = RelationshipTypeHelpers.getConfig('parent');
      
      expect(config.value).toBe('parent');
      expect(config.label).toBe('Parent');
      expect(config.isBidirectional).toBe(false);
      expect(config.reciprocalType).toBe('child');
      expect(config.icon).toBeDefined();
      expect(config.color).toBeDefined();
    });

    it('should return correct configuration for sibling type', () => {
      const config = RelationshipTypeHelpers.getConfig('sibling');
      
      expect(config.value).toBe('sibling');
      expect(config.label).toBe('Sibling');
      expect(config.isBidirectional).toBe(true);
      expect(config.reciprocalType).toBe('sibling');
      expect(config.icon).toBeDefined();
      expect(config.color).toBeDefined();
    });

    it('should return correct configuration for partner type', () => {
      const config = RelationshipTypeHelpers.getConfig('partner');
      
      expect(config.value).toBe('partner');
      expect(config.label).toBe('Partner');
      expect(config.isBidirectional).toBe(true);
      expect(config.reciprocalType).toBe('partner');
      expect(config.icon).toBeDefined();
      expect(config.color).toBeDefined();
    });

    it('should return correct configuration for donor type', () => {
      const config = RelationshipTypeHelpers.getConfig('donor');
      
      expect(config.value).toBe('donor');
      expect(config.label).toBe('Donor');
      expect(config.isBidirectional).toBe(false);
      expect(config.reciprocalType).toBe('child');
      expect(config.icon).toBeDefined();
      expect(config.color).toBeDefined();
    });
  });

  describe('getForSelection', () => {
    it('should return array of objects with selection properties', () => {
      const selectionTypes = RelationshipTypeHelpers.getForSelection();
      
      expect(selectionTypes).toBeInstanceOf(Array);
      expect(selectionTypes.length).toBeGreaterThan(0);
      
      selectionTypes.forEach(type => {
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('icon');
        expect(type).toHaveProperty('color');
        expect(typeof type.value).toBe('string');
        expect(typeof type.label).toBe('string');
        expect(typeof type.color).toBe('string');
        expect(type.icon).toBeDefined();
      });
    });

    it('should include all relationship types', () => {
      const selectionTypes = RelationshipTypeHelpers.getForSelection();
      const values = selectionTypes.map(t => t.value);
      
      expect(values).toContain('parent');
      expect(values).toContain('child');
      expect(values).toContain('partner');
      expect(values).toContain('sibling');
      expect(values).toContain('spouse');
      expect(values).toContain('donor');
      expect(values.length).toBe(11);
    });

    it('should match the configuration objects', () => {
      const selectionTypes = RelationshipTypeHelpers.getForSelection();
      
      selectionTypes.forEach(selectionType => {
        const config = RELATIONSHIP_TYPE_CONFIGS[selectionType.value as RelationshipType];
        expect(selectionType.value).toBe(config.value);
        expect(selectionType.label).toBe(config.label);
        expect(selectionType.icon).toBe(config.icon);
        expect(selectionType.color).toBe(config.color);
      });
    });
  });

  describe('getBidirectionalTypes', () => {
    it('should return only bidirectional relationship types', () => {
      const bidirectionalTypes = RelationshipTypeHelpers.getBidirectionalTypes();
      
      expect(bidirectionalTypes).toContain('sibling');
      expect(bidirectionalTypes).toContain('half_sibling');
      expect(bidirectionalTypes).toContain('step_sibling');
      expect(bidirectionalTypes).toContain('partner');
      expect(bidirectionalTypes).toContain('spouse');
      expect(bidirectionalTypes).toContain('other');
      
      expect(bidirectionalTypes).not.toContain('parent');
      expect(bidirectionalTypes).not.toContain('child');
      expect(bidirectionalTypes).not.toContain('donor');
      expect(bidirectionalTypes).not.toContain('biological_parent');
      expect(bidirectionalTypes).not.toContain('social_parent');
    });

    it('should match types that have isBidirectional: true', () => {
      const bidirectionalTypes = RelationshipTypeHelpers.getBidirectionalTypes();
      
      bidirectionalTypes.forEach(type => {
        const config = RELATIONSHIP_TYPE_CONFIGS[type];
        expect(config.isBidirectional).toBe(true);
      });
    });
  });

  describe('getDirectionalTypes', () => {
    it('should return only directional relationship types', () => {
      const directionalTypes = RelationshipTypeHelpers.getDirectionalTypes();
      
      expect(directionalTypes).toContain('parent');
      expect(directionalTypes).toContain('child');
      expect(directionalTypes).toContain('donor');
      expect(directionalTypes).toContain('biological_parent');
      expect(directionalTypes).toContain('social_parent');
      
      expect(directionalTypes).not.toContain('sibling');
      expect(directionalTypes).not.toContain('half_sibling');
      expect(directionalTypes).not.toContain('step_sibling');
      expect(directionalTypes).not.toContain('partner');
      expect(directionalTypes).not.toContain('spouse');
      expect(directionalTypes).not.toContain('other');
    });

    it('should match types that have isBidirectional: false', () => {
      const directionalTypes = RelationshipTypeHelpers.getDirectionalTypes();
      
      directionalTypes.forEach(type => {
        const config = RELATIONSHIP_TYPE_CONFIGS[type];
        expect(config.isBidirectional).toBe(false);
      });
    });
  });

  describe('getIcon', () => {
    it('should return the correct icon component for each type', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      
      types.forEach(type => {
        const icon = RelationshipTypeHelpers.getIcon(type);
        const config = RELATIONSHIP_TYPE_CONFIGS[type];
        
        expect(icon).toBe(config.icon);
        expect(icon).toBeDefined();
      });
    });
  });

  describe('getColor', () => {
    it('should return the correct color for each type', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      
      types.forEach(type => {
        const color = RelationshipTypeHelpers.getColor(type);
        const config = RELATIONSHIP_TYPE_CONFIGS[type];
        
        expect(color).toBe(config.color);
        expect(typeof color).toBe('string');
        expect(color).toMatch(/^hsl\(var\(--/); // Matches HSL CSS custom property format
      });
    });
  });

  describe('getLabel', () => {
    it('should return the correct label for each type', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      
      types.forEach(type => {
        const label = RelationshipTypeHelpers.getLabel(type);
        const config = RELATIONSHIP_TYPE_CONFIGS[type];
        
        expect(label).toBe(config.label);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });

    it('should return human-readable labels', () => {
      expect(RelationshipTypeHelpers.getLabel('parent')).toBe('Parent');
      expect(RelationshipTypeHelpers.getLabel('half_sibling')).toBe('Half Sibling');
      expect(RelationshipTypeHelpers.getLabel('biological_parent')).toBe('Biological Parent');
      expect(RelationshipTypeHelpers.getLabel('social_parent')).toBe('Social Parent');
    });
  });

  describe('isBidirectional', () => {
    it('should correctly identify bidirectional relationships', () => {
      expect(RelationshipTypeHelpers.isBidirectional('sibling')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('half_sibling')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('step_sibling')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('partner')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('spouse')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('other')).toBe(true);
    });

    it('should correctly identify directional relationships', () => {
      expect(RelationshipTypeHelpers.isBidirectional('parent')).toBe(false);
      expect(RelationshipTypeHelpers.isBidirectional('child')).toBe(false);
      expect(RelationshipTypeHelpers.isBidirectional('donor')).toBe(false);
      expect(RelationshipTypeHelpers.isBidirectional('biological_parent')).toBe(false);
      expect(RelationshipTypeHelpers.isBidirectional('social_parent')).toBe(false);
    });
  });

  describe('getReciprocalType', () => {
    it('should return correct reciprocal types for directional relationships', () => {
      expect(RelationshipTypeHelpers.getReciprocalType('parent')).toBe('child');
      expect(RelationshipTypeHelpers.getReciprocalType('child')).toBe('parent');
      expect(RelationshipTypeHelpers.getReciprocalType('donor')).toBe('child');
      expect(RelationshipTypeHelpers.getReciprocalType('biological_parent')).toBe('child');
      expect(RelationshipTypeHelpers.getReciprocalType('social_parent')).toBe('child');
    });

    it('should return self as reciprocal for bidirectional relationships', () => {
      expect(RelationshipTypeHelpers.getReciprocalType('sibling')).toBe('sibling');
      expect(RelationshipTypeHelpers.getReciprocalType('half_sibling')).toBe('half_sibling');
      expect(RelationshipTypeHelpers.getReciprocalType('step_sibling')).toBe('step_sibling');
      expect(RelationshipTypeHelpers.getReciprocalType('partner')).toBe('partner');
      expect(RelationshipTypeHelpers.getReciprocalType('spouse')).toBe('spouse');
      expect(RelationshipTypeHelpers.getReciprocalType('other')).toBe('other');
    });
  });

  describe('RELATIONSHIP_TYPE_CONFIGS integrity', () => {
    it('should have valid configuration for all types', () => {
      const configKeys = Object.keys(RELATIONSHIP_TYPE_CONFIGS);
      
      configKeys.forEach(key => {
        const config = RELATIONSHIP_TYPE_CONFIGS[key as RelationshipType];
        
        // Required properties
        expect(config.value).toBe(key);
        expect(typeof config.label).toBe('string');
        expect(config.label.length).toBeGreaterThan(0);
        expect(config.icon).toBeDefined();
        expect(typeof config.color).toBe('string');
        expect(config.color.length).toBeGreaterThan(0);
        expect(typeof config.isBidirectional).toBe('boolean');
        
        // Reciprocal type should exist if specified
        if (config.reciprocalType) {
          expect(RELATIONSHIP_TYPE_CONFIGS[config.reciprocalType]).toBeDefined();
        }
      });
    });

    it('should have consistent reciprocal relationships', () => {
      // Parent-Child reciprocal relationship
      const parentConfig = RELATIONSHIP_TYPE_CONFIGS.parent;
      const childConfig = RELATIONSHIP_TYPE_CONFIGS.child;
      expect(parentConfig.reciprocalType).toBe('child');
      expect(childConfig.reciprocalType).toBe('parent');

      // Bidirectional relationships should point to themselves
      const siblingConfig = RELATIONSHIP_TYPE_CONFIGS.sibling;
      expect(siblingConfig.reciprocalType).toBe('sibling');
      
      const partnerConfig = RELATIONSHIP_TYPE_CONFIGS.partner;
      expect(partnerConfig.reciprocalType).toBe('partner');
    });

    it('should have unique colors for different relationship categories', () => {
      const colors = Object.values(RELATIONSHIP_TYPE_CONFIGS).map(config => config.color);
      const uniqueColors = [...new Set(colors)];
      
      // Should have some variety in colors, but exact duplicates are allowed for related types
      expect(uniqueColors.length).toBeGreaterThan(3);
    });
  });
});