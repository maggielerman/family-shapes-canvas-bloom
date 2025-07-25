import { useEffect, useRef, useState } from 'react';
import ReactFamilyTree from 'react-family-tree';
import { Node, ExtNode, Gender, RelType } from 'relatives-tree/lib/types';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { InfoPanel } from './InfoPanel';

interface RelationshipType {
  value: string;
  label: string;
  color: string;
}

interface FamilyChartLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: RelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: 'force' | 'radial' | 'dagre' | 'family-chart';
  onLayoutChange: (layout: 'force' | 'radial' | 'dagre' | 'family-chart') => void;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 80;

export function FamilyChartLayout({ 
  persons, 
  connections, 
  relationshipTypes, 
  width, 
  height, 
  onPersonClick,
  currentLayout,
  onLayoutChange
}: FamilyChartLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [familyNodes, setFamilyNodes] = useState<Node[]>([]);
  const [rootId, setRootId] = useState<string | undefined>();

  useEffect(() => {
    if (persons.length === 0) {
      console.log('FamilyChartLayout: No persons available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Transform our data to react-family-tree format
      const nodes: Node[] = [];
      const nodeMap = new Map<string, Node>();

      // Create nodes for all persons
      persons.forEach(person => {
        const node: Node = {
          id: person.id,
          gender: person.gender === 'male' ? Gender.male : person.gender === 'female' ? Gender.female : Gender.male,
          parents: [],
          children: [],
          siblings: [],
          spouses: [],
        };
        nodes.push(node);
        nodeMap.set(person.id, node);
      });

      // Process connections to establish relationships
      connections.forEach(connection => {
        const fromNode = nodeMap.get(connection.from_person_id);
        const toNode = nodeMap.get(connection.to_person_id);

        if (!fromNode || !toNode) {
          console.warn('FamilyChartLayout: Skipping connection - node not found:', connection);
          return;
        }

        // Create mutable copies of the nodes to modify them
        const mutableFromNode = fromNode as any;
        const mutableToNode = toNode as any;

        switch (connection.relationship_type) {
          case 'parent':
            // fromNode is parent of toNode
            mutableToNode.parents = [...mutableToNode.parents, { id: fromNode.id, type: RelType.blood }];
            mutableFromNode.children = [...mutableFromNode.children, { id: toNode.id, type: RelType.blood }];
            break;

          case 'child':
            // fromNode is child of toNode
            mutableFromNode.parents = [...mutableFromNode.parents, { id: toNode.id, type: RelType.blood }];
            mutableToNode.children = [...mutableToNode.children, { id: fromNode.id, type: RelType.blood }];
            break;

          case 'partner':
          case 'spouse':
            // Bidirectional spouse relationship
            const spouseType = connection.relationship_type === 'spouse' ? RelType.married : RelType.married;
            mutableFromNode.spouses = [...mutableFromNode.spouses, { id: toNode.id, type: spouseType }];
            mutableToNode.spouses = [...mutableToNode.spouses, { id: fromNode.id, type: spouseType }];
            break;

          case 'sibling':
            // Bidirectional sibling relationship
            mutableFromNode.siblings = [...mutableFromNode.siblings, { id: toNode.id, type: RelType.blood }];
            mutableToNode.siblings = [...mutableToNode.siblings, { id: fromNode.id, type: RelType.blood }];
            break;
        }
      });

      // Find root node (person with no parents or is_self)
      let rootNode: Node | undefined;
      
      // First, try to find the self person
      const selfPerson = persons.find(p => p.is_self === true);
      if (selfPerson) {
        rootNode = nodeMap.get(selfPerson.id);
      }
      
      // If no self person, find someone with no parents
      if (!rootNode) {
        rootNode = nodes.find(node => node.parents.length === 0);
      }
      
      // If still no root, use the first person
      if (!rootNode && nodes.length > 0) {
        rootNode = nodes[0];
      }

      if (!rootNode) {
        throw new Error('No root node found');
      }

      setFamilyNodes(nodes);
      setRootId(rootNode.id);
      console.log('FamilyChartLayout: Data transformed successfully', { nodes, rootId: rootNode.id });
    } catch (error) {
      console.error('FamilyChartLayout: Error transforming data:', error);
      setError(`Failed to transform data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [persons, connections]);

  const handleCenterSelf = () => {
    const selfPerson = persons.find(person => person.is_self === true);
    if (selfPerson) {
      // React-family-tree doesn't have built-in centering, but we could implement it
      console.log('Center on self:', selfPerson.name);
    }
  };

  const handleZoomToFit = () => {
    // React-family-tree doesn't have built-in zoom controls
    setZoomLevel(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  if (familyNodes.length === 0 || !rootId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">No family data available</div>
      </div>
    );
  }

  const FamilyNode = ({ node, style }: { node: ExtNode; style: React.CSSProperties }) => {
    const person = persons.find(p => p.id === node.id);
    if (!person) return null;

    return (
      <div
        className="absolute bg-white border-2 border-gray-300 rounded-lg p-2 cursor-pointer hover:border-blue-500 transition-colors"
        style={{
          ...style,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => onPersonClick?.(person)}
      >
        <div className="font-semibold text-sm truncate w-full text-center">
          {person.name}
        </div>
        {person.birth_date && (
          <div className="text-xs text-gray-500">
            {new Date(person.birth_date).getFullYear()}
            {person.death_date && ` - ${new Date(person.death_date).getFullYear()}`}
          </div>
        )}
        <div className="text-xs text-gray-400 capitalize">{node.gender}</div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Toolbar - top right */}
      <div className="absolute top-4 right-4 z-10">
        <TreeToolbar
          persons={persons}
          currentLayout={currentLayout}
          onCenterSelf={handleCenterSelf}
          onZoomToFit={handleZoomToFit}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-3"
        />
      </div>

      {/* Layout Switcher - top left */}
      <div className="absolute top-4 left-4 z-10">
        <LayoutSwitcher
          currentLayout={currentLayout}
          onLayoutChange={onLayoutChange}
        />
      </div>

      {/* Info Panel - bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <InfoPanel
          layout="Family Chart"
          zoomLevel={zoomLevel}
          relationshipFilters={{
            generational: true,
            lateral: true,
            donor: true
          }}
        />
      </div>

      {/* Chart Container */}
      <div 
        ref={containerRef}
        className="border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 overflow-auto relative"
        style={{ width, height }}
      >
        <ReactFamilyTree
          nodes={familyNodes}
          rootId={rootId}
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          renderNode={(node: ExtNode) => (
            <FamilyNode
              key={node.id}
              node={node}
              style={{
                transform: `translate(${node.left * (NODE_WIDTH / 2)}px, ${node.top * (NODE_HEIGHT / 2)}px)`,
              }}
            />
          )}
        />
      </div>
    </div>
  );
} 