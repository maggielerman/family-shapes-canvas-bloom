import { describe, it, expect } from 'vitest';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

// Test the data transformation logic that we fixed
const transformToFamilyChartFormat = (persons: Person[], connections: Connection[]) => {
  const nodes = persons.map(person => {
    const node: any = {
      id: person.id,
      name: person.name || 'Unknown',
      // Convert gender to M/F format as expected by the library
      gender: person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : undefined,
      img: person.profile_photo_url || undefined,
      pids: [], // Initialize partner IDs
      _data: person // Store original data for reference
    };

    // Find parent connections
    const parentConnections = connections.filter(conn => {
      if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
        return true;
      }
      if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
        return true;
      }
      return false;
    });

    // Set parent IDs
    parentConnections.forEach(conn => {
      let parentId: string;
      
      if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
        parentId = conn.from_person_id;
      } else if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
        parentId = conn.to_person_id;
      } else {
        return;
      }
      
      const parent = persons.find(p => p.id === parentId);
      if (parent) {
        if (parent.gender === 'male') {
          if (!node.fid) {
            node.fid = parent.id;
          }
        } else if (parent.gender === 'female') {
          if (!node.mid) {
            node.mid = parent.id;
          }
        } else {
          // Unknown gender - assign to available slot
          if (!node.fid) {
            node.fid = parent.id;
          } else if (!node.mid) {
            node.mid = parent.id;
          }
        }
      }
    });

    // Find spouse connections
    const spouseConnections = connections.filter(
      conn => (conn.from_person_id === person.id || conn.to_person_id === person.id) &&
      (conn.relationship_type === 'spouse' || conn.relationship_type === 'partner')
    );

    // Set partner IDs
    spouseConnections.forEach(conn => {
      const partnerId = conn.from_person_id === person.id ? conn.to_person_id : conn.from_person_id;
      if (!node.pids.includes(partnerId)) {
        node.pids.push(partnerId);
      }
    });

    return node;
  });

  return nodes;
};

describe('FamilyChartLayout Data Transformation', () => {
  const mockPersons: Person[] = [
    {
      id: '1',
      name: 'John Doe',
      gender: 'male',
      date_of_birth: '1980-01-01',
      profile_photo_url: undefined,
      is_self: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Jane Doe',
      gender: 'female',
      date_of_birth: '1982-01-01',
      profile_photo_url: undefined,
      is_self: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Child Doe',
      gender: 'male',
      date_of_birth: '2010-01-01',
      profile_photo_url: undefined,
      is_self: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const mockConnections: Connection[] = [
    {
      id: '1',
      from_person_id: '1',
      to_person_id: '2',
      relationship_type: 'spouse',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      from_person_id: '1',
      to_person_id: '3',
      relationship_type: 'parent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      from_person_id: '2',
      to_person_id: '3',
      relationship_type: 'parent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  it('should transform gender correctly to M/F format', () => {
    const result = transformToFamilyChartFormat(mockPersons, mockConnections);
    
    // Check that gender is converted correctly
    const johnNode = result.find(node => node.id === '1');
    const janeNode = result.find(node => node.id === '2');
    const childNode = result.find(node => node.id === '3');
    
    expect(johnNode?.gender).toBe('M'); // male -> M
    expect(janeNode?.gender).toBe('F'); // female -> F
    expect(childNode?.gender).toBe('M'); // male -> M
  });

  it('should set up parent relationships correctly', () => {
    const result = transformToFamilyChartFormat(mockPersons, mockConnections);
    
    const childNode = result.find(node => node.id === '3');
    
    // Child should have both parents
    expect(childNode?.fid).toBe('1'); // John is father
    expect(childNode?.mid).toBe('2'); // Jane is mother
  });

  it('should set up spouse relationships correctly', () => {
    const result = transformToFamilyChartFormat(mockPersons, mockConnections);
    
    const johnNode = result.find(node => node.id === '1');
    const janeNode = result.find(node => node.id === '2');
    
    // Both should have each other as partners
    expect(johnNode?.pids).toContain('2');
    expect(janeNode?.pids).toContain('1');
  });

  it('should handle unknown gender gracefully', () => {
    const personsWithUnknownGender: Person[] = [
      {
        id: '1',
        name: 'Unknown Parent',
        gender: undefined,
        date_of_birth: '1980-01-01',
        profile_photo_url: undefined,
        is_self: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Child',
        gender: 'male',
        date_of_birth: '2010-01-01',
        profile_photo_url: undefined,
        is_self: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const connections: Connection[] = [
      {
        id: '1',
        from_person_id: '1',
        to_person_id: '2',
        relationship_type: 'parent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const result = transformToFamilyChartFormat(personsWithUnknownGender, connections);
    
    const childNode = result.find(node => node.id === '2');
    const parentNode = result.find(node => node.id === '1');
    
    // Unknown gender parent should be assigned to fid slot
    expect(childNode?.fid).toBe('1');
    expect(parentNode?.gender).toBeUndefined();
  });

  it('should preserve original person data', () => {
    const result = transformToFamilyChartFormat(mockPersons, mockConnections);
    
    const johnNode = result.find(node => node.id === '1');
    
    // Should preserve original data
    expect(johnNode?._data).toEqual(mockPersons[0]);
  });
}); 