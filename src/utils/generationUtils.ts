export interface GenerationInfo {
  generation: number;
  color: string;
  depth: number;
}

export interface PersonWithGeneration {
  id: string;
  name: string;
  generation?: number;
  [key: string]: any;
}

export interface ConnectionForGeneration {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

/**
 * Color palette for generations - each generation gets a distinct color
 */
const GENERATION_COLORS = [
  '#8b5cf6', // Purple - Generation 0 (root/oldest)
  '#3b82f6', // Blue - Generation 1
  '#10b981', // Green - Generation 2
  '#f59e0b', // Amber - Generation 3
  '#ef4444', // Red - Generation 4
  '#06b6d4', // Cyan - Generation 5
  '#84cc16', // Lime - Generation 6
  '#f97316', // Orange - Generation 7
  '#ec4899', // Pink - Generation 8
  '#6b7280', // Gray - Generation 9+
];

/**
 * Calculate the generation level for each person in the family tree
 * Generation 0 = oldest generation (root ancestors)
 * Higher numbers = younger generations
 */
export function calculateGenerations(
  persons: PersonWithGeneration[],
  connections: ConnectionForGeneration[]
): Map<string, GenerationInfo> {
  const generationMap = new Map<string, GenerationInfo>();
  const visited = new Set<string>();

  // Find root persons (those who are not children of anyone)
  const childIds = new Set(
    connections
      .filter(c => c.relationship_type === 'parent')
      .map(c => c.to_person_id)
  );
  
  const rootPersons = persons.filter(p => !childIds.has(p.id));

  // If no clear root found, use persons with the most parent connections
  if (rootPersons.length === 0 && persons.length > 0) {
    rootPersons.push(persons[0]);
  }

  // Calculate generations starting from root persons
  const calculateGenerationForPerson = (personId: string, currentGeneration: number = 0): number => {
    if (visited.has(personId)) {
      return generationMap.get(personId)?.generation || 0;
    }

    visited.add(personId);

    // Find parent connections for this person
    const parentConnections = connections.filter(
      c => c.to_person_id === personId && c.relationship_type === 'parent'
    );

    let generation = currentGeneration;

    if (parentConnections.length > 0) {
      // If this person has parents, their generation is max parent generation + 1
      const parentGenerations = parentConnections.map(c => 
        calculateGenerationForPerson(c.from_person_id, currentGeneration)
      );
      generation = Math.max(...parentGenerations) + 1;
    }

    // Store the generation info
    generationMap.set(personId, {
      generation,
      color: getGenerationColor(generation),
      depth: generation
    });

    return generation;
  };

  // Start with root persons
  rootPersons.forEach(person => {
    calculateGenerationForPerson(person.id, 0);
  });

  // Handle any remaining unvisited persons (isolated nodes)
  persons.forEach(person => {
    if (!visited.has(person.id)) {
      calculateGenerationForPerson(person.id, 0);
    }
  });

  return generationMap;
}

/**
 * Get color for a specific generation
 */
export function getGenerationColor(generation: number): string {
  if (generation < 0) return GENERATION_COLORS[0];
  if (generation >= GENERATION_COLORS.length) {
    return GENERATION_COLORS[GENERATION_COLORS.length - 1];
  }
  return GENERATION_COLORS[generation];
}

/**
 * Check if a connection represents a generational relationship (parent-child)
 * vs a lateral relationship (sibling, partner, etc.)
 */
export function isGenerationalConnection(relationshipType: string): boolean {
  const generationalTypes = ['parent', 'child', 'biological_parent', 'social_parent', 'donor'];
  return generationalTypes.includes(relationshipType);
}

/**
 * Check if a connection represents a sibling relationship
 */
export function isSiblingConnection(relationshipType: string): boolean {
  const siblingTypes = ['sibling', 'half_sibling', 'step_sibling'];
  return siblingTypes.includes(relationshipType);
}

/**
 * Get connections that should be displayed as lines (generational connections)
 */
export function getGenerationalConnections(connections: ConnectionForGeneration[]): ConnectionForGeneration[] {
  return connections.filter(c => isGenerationalConnection(c.relationship_type));
}

/**
 * Get connections that should be hidden from line display but kept in connection manager (sibling connections)
 */
export function getSiblingConnections(connections: ConnectionForGeneration[]): ConnectionForGeneration[] {
  return connections.filter(c => isSiblingConnection(c.relationship_type));
}

/**
 * Get generation statistics
 */
export function getGenerationStats(generationMap: Map<string, GenerationInfo>) {
  const stats = {
    totalGenerations: 0,
    generationCounts: new Map<number, number>(),
    minGeneration: Infinity,
    maxGeneration: -Infinity
  };

  generationMap.forEach((info, personId) => {
    const gen = info.generation;
    stats.generationCounts.set(gen, (stats.generationCounts.get(gen) || 0) + 1);
    stats.minGeneration = Math.min(stats.minGeneration, gen);
    stats.maxGeneration = Math.max(stats.maxGeneration, gen);
  });

  stats.totalGenerations = stats.maxGeneration - stats.minGeneration + 1;
  
  return stats;
}

/**
 * Get the generation colors palette for legend display
 */
export function getGenerationColorPalette() {
  return GENERATION_COLORS.map((color, index) => ({
    generation: index,
    color,
    label: `Generation ${index}`
  }));
}