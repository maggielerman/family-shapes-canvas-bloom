import { 
  calculateGenerations, 
  getGenerationalConnections, 
  getSiblingConnections,
  isGenerationalConnection,
  isSiblingConnection,
  getGenerationColor 
} from '@/utils/generationUtils';

describe('Generation Utils', () => {
  const mockPersons = [
    { id: 'grandparent', name: 'Grandparent' },
    { id: 'parent1', name: 'Parent 1' },
    { id: 'parent2', name: 'Parent 2' },
    { id: 'donor', name: 'Sperm Donor' },
    { id: 'child1', name: 'Child 1' },
    { id: 'child2', name: 'Child 2' },
    { id: 'child3', name: 'Child 3' },
    { id: 'grandchild', name: 'Grandchild' },
  ];

  const mockConnections = [
    { id: 'c1', from_person_id: 'grandparent', to_person_id: 'parent1', relationship_type: 'parent', family_tree_id: 'tree1' },
    { id: 'c2', from_person_id: 'parent1', to_person_id: 'child1', relationship_type: 'parent', family_tree_id: 'tree1' },
    { id: 'c3', from_person_id: 'parent1', to_person_id: 'child2', relationship_type: 'parent', family_tree_id: 'tree1' },
    { id: 'c4', from_person_id: 'parent2', to_person_id: 'child3', relationship_type: 'parent', family_tree_id: 'tree1' },
    { id: 'c5', from_person_id: 'child1', to_person_id: 'grandchild', relationship_type: 'parent', family_tree_id: 'tree1' },
    { id: 'c6', from_person_id: 'child1', to_person_id: 'child2', relationship_type: 'sibling', family_tree_id: 'tree1' },
    { id: 'c7', from_person_id: 'parent1', to_person_id: 'parent2', relationship_type: 'partner', family_tree_id: 'tree1' },
    { id: 'c8', from_person_id: 'donor', to_person_id: 'child1', relationship_type: 'donor', family_tree_id: 'tree1' },
  ];

  describe('calculateGenerations', () => {
    it('should calculate correct generation levels', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);

      expect(generationMap.get('grandparent')?.generation).toBe(0);
      expect(generationMap.get('parent1')?.generation).toBe(1);
      expect(generationMap.get('parent2')?.generation).toBe(0); // No parent, so generation 0
      expect(generationMap.get('child1')?.generation).toBe(2);
      expect(generationMap.get('child2')?.generation).toBe(2);
      expect(generationMap.get('child3')?.generation).toBe(1);
      expect(generationMap.get('grandchild')?.generation).toBe(3);
    });

    it('should assign colors to each generation', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);

      // Check that each generation has a color assigned
      generationMap.forEach((info, personId) => {
        expect(info.color).toBeDefined();
        expect(info.color).toMatch(/^#[0-9a-f]{6}$/i);
      });

      // Check that people in same generation have same color
      const child1Gen = generationMap.get('child1');
      const child2Gen = generationMap.get('child2');
      expect(child1Gen?.generation).toBe(child2Gen?.generation);
      expect(child1Gen?.color).toBe(child2Gen?.color);
    });
  });

  describe('getGenerationalConnections', () => {
    it('should filter to only parent-child relationships', () => {
      const generationalConnections = getGenerationalConnections(mockConnections);
      
      expect(generationalConnections).toHaveLength(6);
      expect(generationalConnections.every(c => 
        ['parent', 'child', 'biological_parent', 'social_parent', 'donor'].includes(c.relationship_type)
      )).toBe(true);
    });
  });

  describe('getSiblingConnections', () => {
    it('should filter to only sibling relationships', () => {
      const siblingConnections = getSiblingConnections(mockConnections);
      
      expect(siblingConnections).toHaveLength(1);
      expect(siblingConnections[0].relationship_type).toBe('sibling');
    });
  });

  describe('isGenerationalConnection', () => {
    it('should identify generational relationships correctly', () => {
      expect(isGenerationalConnection('parent')).toBe(true);
      expect(isGenerationalConnection('child')).toBe(true);
      expect(isGenerationalConnection('biological_parent')).toBe(true);
      expect(isGenerationalConnection('social_parent')).toBe(true);
      expect(isGenerationalConnection('donor')).toBe(true);
      
      expect(isGenerationalConnection('sibling')).toBe(false);
      expect(isGenerationalConnection('partner')).toBe(false);
      expect(isGenerationalConnection('spouse')).toBe(false);
    });
  });

  describe('isSiblingConnection', () => {
    it('should identify sibling relationships correctly', () => {
      expect(isSiblingConnection('sibling')).toBe(true);
      expect(isSiblingConnection('half_sibling')).toBe(true);
      expect(isSiblingConnection('step_sibling')).toBe(true);
      
      expect(isSiblingConnection('parent')).toBe(false);
      expect(isSiblingConnection('partner')).toBe(false);
      expect(isSiblingConnection('spouse')).toBe(false);
    });
  });

  describe('getGenerationColor', () => {
    it('should return consistent colors for generations', () => {
      const color0 = getGenerationColor(0);
      const color1 = getGenerationColor(1);
      const color2 = getGenerationColor(2);

      expect(color0).toBeDefined();
      expect(color1).toBeDefined();
      expect(color2).toBeDefined();
      
      // Should return same color for same generation
      expect(getGenerationColor(0)).toBe(color0);
      expect(getGenerationColor(1)).toBe(color1);
      
      // Different generations should have different colors
      expect(color0).not.toBe(color1);
      expect(color1).not.toBe(color2);
    });

    it('should handle edge cases', () => {
      // Negative generation should return first color
      expect(getGenerationColor(-1)).toBe(getGenerationColor(0));
      
      // Very high generation should return last color
      const highGen = getGenerationColor(999);
      expect(highGen).toBeDefined();
    });
  });
});