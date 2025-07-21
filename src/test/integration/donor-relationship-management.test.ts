import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateGenerations, 
  getDonorConnections, 
  getGenerationalConnections,
  getGenerationStats,
  isDonorConnection,
  getDonorColor
} from '@/utils/generationUtils';
import { DonorService } from '@/services/donorService';

describe('Donor Relationship Management', () => {
  // Mock data for testing
  const mockPersons = [
    { id: 'parent1', name: 'Sarah (Single Mom)', gender: 'female' },
    { id: 'donor1', name: 'Donor #12345', gender: 'male' },
    { id: 'child1', name: 'Emma', gender: 'female' },
    { id: 'child2', name: 'Alex', gender: 'male' },
    { id: 'grandparent1', name: 'Grandma Rose', gender: 'female' },
  ];

  const mockConnections = [
    // Traditional parent-child relationship
    { id: 'conn1', from_person_id: 'grandparent1', to_person_id: 'parent1', relationship_type: 'parent' },
    { id: 'conn2', from_person_id: 'parent1', to_person_id: 'child1', relationship_type: 'parent' },
    { id: 'conn3', from_person_id: 'parent1', to_person_id: 'child2', relationship_type: 'parent' },
    
    // Donor relationships
    { id: 'conn4', from_person_id: 'donor1', to_person_id: 'child1', relationship_type: 'donor' },
    { id: 'conn5', from_person_id: 'donor1', to_person_id: 'child2', relationship_type: 'donor' },
    
    // Sibling relationship
    { id: 'conn6', from_person_id: 'child1', to_person_id: 'child2', relationship_type: 'sibling' },
  ];

  describe('Generation Calculation with Donors', () => {
    it('should place donors at the same generation as recipient parents', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);
      
      const parentGeneration = generationMap.get('parent1')?.generation;
      const donorGeneration = generationMap.get('donor1')?.generation;
      
      expect(parentGeneration).toBeDefined();
      expect(donorGeneration).toBeDefined();
      expect(donorGeneration).toBe(parentGeneration);
    });

    it('should mark donors with isDonor flag', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);
      
      const donorInfo = generationMap.get('donor1');
      const parentInfo = generationMap.get('parent1');
      
      expect(donorInfo?.isDonor).toBe(true);
      expect(parentInfo?.isDonor).toBeUndefined();
    });

    it('should assign special donor color', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);
      
      const donorInfo = generationMap.get('donor1');
      const expectedDonorColor = getDonorColor();
      
      expect(donorInfo?.color).toBe(expectedDonorColor);
    });

    it('should calculate correct generation hierarchy', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);
      
      const grandparentGeneration = generationMap.get('grandparent1')?.generation;
      const parentGeneration = generationMap.get('parent1')?.generation;
      const childGeneration = generationMap.get('child1')?.generation;
      
      expect(grandparentGeneration).toBe(0); // Root generation
      expect(parentGeneration).toBe(1); // One generation down
      expect(childGeneration).toBe(2); // Two generations down
    });
  });

  describe('Connection Filtering', () => {
    it('should correctly identify donor connections', () => {
      expect(isDonorConnection('donor')).toBe(true);
      expect(isDonorConnection('parent')).toBe(false);
      expect(isDonorConnection('sibling')).toBe(false);
    });

    it('should filter donor connections', () => {
      const donorConnections = getDonorConnections(mockConnections);
      
      expect(donorConnections).toHaveLength(2);
      expect(donorConnections.every(c => c.relationship_type === 'donor')).toBe(true);
    });

    it('should exclude donor connections from generational connections', () => {
      const generationalConnections = getGenerationalConnections(mockConnections);
      
      expect(generationalConnections.every(c => c.relationship_type !== 'donor')).toBe(true);
      expect(generationalConnections.some(c => c.relationship_type === 'parent')).toBe(true);
    });
  });

  describe('Generation Statistics', () => {
    it('should count donors separately in statistics', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);
      const stats = getGenerationStats(generationMap);
      
      expect(stats.donorCount).toBe(1);
      expect(stats.totalGenerations).toBe(3); // 0, 1, 2
    });

    it('should not include donors in generation counts', () => {
      const generationMap = calculateGenerations(mockPersons, mockConnections);
      const stats = getGenerationStats(generationMap);
      
      // Generation 1 should have 1 person (parent1), not 2 (parent1 + donor1)
      expect(stats.generationCounts.get(1)).toBe(1);
    });
  });

  describe('Complex Family Structures', () => {
    it('should handle multiple donors for different children', () => {
      const complexPersons = [
        ...mockPersons,
        { id: 'donor2', name: 'Donor #67890', gender: 'male' },
        { id: 'child3', name: 'Riley', gender: 'non-binary' },
      ];

      const complexConnections = [
        ...mockConnections,
        { id: 'conn7', from_person_id: 'donor2', to_person_id: 'child3', relationship_type: 'donor' },
        { id: 'conn8', from_person_id: 'parent1', to_person_id: 'child3', relationship_type: 'parent' },
      ];

      const generationMap = calculateGenerations(complexPersons, complexConnections);
      const stats = getGenerationStats(generationMap);
      
      expect(stats.donorCount).toBe(2);
      
      // Both donors should be at the same generation as parent1
      const parentGeneration = generationMap.get('parent1')?.generation;
      expect(generationMap.get('donor1')?.generation).toBe(parentGeneration);
      expect(generationMap.get('donor2')?.generation).toBe(parentGeneration);
    });

    it('should handle egg donors in lesbian couples', () => {
      const lesbianFamilyPersons = [
        { id: 'mom1', name: 'Alice', gender: 'female' },
        { id: 'mom2', name: 'Beth', gender: 'female' },
        { id: 'donor_egg', name: 'Egg Donor #111', gender: 'female' },
        { id: 'donor_sperm', name: 'Sperm Donor #222', gender: 'male' },
        { id: 'child', name: 'Sam', gender: 'male' },
      ];

      const lesbianFamilyConnections = [
        { id: 'conn1', from_person_id: 'mom1', to_person_id: 'child', relationship_type: 'parent' },
        { id: 'conn2', from_person_id: 'mom2', to_person_id: 'child', relationship_type: 'parent' },
        { id: 'conn3', from_person_id: 'donor_egg', to_person_id: 'child', relationship_type: 'donor' },
        { id: 'conn4', from_person_id: 'donor_sperm', to_person_id: 'child', relationship_type: 'donor' },
        { id: 'conn5', from_person_id: 'mom1', to_person_id: 'mom2', relationship_type: 'partner' },
      ];

      const generationMap = calculateGenerations(lesbianFamilyPersons, lesbianFamilyConnections);
      const stats = getGenerationStats(generationMap);
      
      expect(stats.donorCount).toBe(2);
      
      // All parents and donors should be at the same generation
      const mom1Generation = generationMap.get('mom1')?.generation;
      expect(generationMap.get('mom2')?.generation).toBe(mom1Generation);
      expect(generationMap.get('donor_egg')?.generation).toBe(mom1Generation);
      expect(generationMap.get('donor_sperm')?.generation).toBe(mom1Generation);
      
      // Child should be one generation down
      expect(generationMap.get('child')?.generation).toBe(mom1Generation! + 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle donors with no children', () => {
      const personsWithIsolatedDonor = [
        ...mockPersons,
        { id: 'isolated_donor', name: 'Unused Donor', gender: 'male' },
      ];

      // No connections for the isolated donor
      const generationMap = calculateGenerations(personsWithIsolatedDonor, mockConnections);
      
      // Isolated donor should be placed at generation 0 as a fallback
      const isolatedDonorInfo = generationMap.get('isolated_donor');
      expect(isolatedDonorInfo?.generation).toBeDefined();
      expect(isolatedDonorInfo?.isDonor).toBeUndefined(); // Not marked as donor since no donor connections
    });

    it('should handle empty person/connection arrays', () => {
      const generationMap = calculateGenerations([], []);
      expect(generationMap.size).toBe(0);
      
      const stats = getGenerationStats(generationMap);
      expect(stats.donorCount).toBe(0);
      expect(stats.totalGenerations).toBe(0);
    });
  });
});

// Mock service tests (these would need actual Supabase setup in integration tests)
describe('Donor Service Integration', () => {
  describe('DonorService', () => {
    it('should have proper structure for donor creation', () => {
      expect(DonorService.createPersonAsDonor).toBeDefined();
      expect(DonorService.convertPersonToDonor).toBeDefined();
      expect(DonorService.getDonorByPersonId).toBeDefined();
      expect(DonorService.getAllDonors).toBeDefined();
    });

    // Note: These would be actual integration tests with Supabase
    it.skip('should create donor with person record', async () => {
      // This would require actual database setup
      // const donorData = {
      //   donor_type: 'sperm',
      //   donor_number: '12345',
      //   is_anonymous: true,
      // };
      // const personData = {
      //   name: 'Test Donor',
      //   donor: true,
      // };
      // const result = await DonorService.createPersonAsDonor(personData, donorData);
      // expect(result.person).toBeDefined();
      // expect(result.donor).toBeDefined();
    });
  });
});