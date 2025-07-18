import Tree from 'react-d3-tree';
import { useEffect, useState } from 'react';

interface Person {
  id: string;
  name: string;
  gender?: string | null;
  profile_photo_url?: string | null;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
}

interface ReactD3TreeLayoutProps {
  persons: Person[];
  connections: Connection[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
}

interface TreeData {
  name: string;
  attributes?: {
    id: string;
    gender?: string | null;
    profile_photo_url?: string | null;
  };
  children?: TreeData[];
}

export function ReactD3TreeLayout({ persons, connections, width, height, onPersonClick }: ReactD3TreeLayoutProps) {
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (persons.length === 0) {
      setTreeData(null);
      return;
    }

    const hierarchyData = createHierarchy(persons, connections);
    setTreeData(hierarchyData);
    
    // Center the tree
    setTranslate({
      x: width / 2,
      y: height / 6
    });
  }, [persons, connections, width, height]);

  const handleNodeClick = (nodeData: any) => {
    if (nodeData.attributes?.id) {
      const person = persons.find(p => p.id === nodeData.attributes.id);
      if (person) {
        onPersonClick?.(person);
      }
    }
  };

  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => (
    <g onClick={() => handleNodeClick(nodeDatum)}>
      <circle
        r={25}
        fill={getGenderColor(nodeDatum.attributes?.gender)}
        stroke="hsl(var(--border))"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      />
      {nodeDatum.attributes?.profile_photo_url && (
        <image
          x={-20}
          y={-20}
          width={40}
          height={40}
          href={nodeDatum.attributes.profile_photo_url}
          clipPath="circle(20px)"
        />
      )}
      <text
        fill="hsl(var(--foreground))"
        strokeWidth="0"
        x="0"
        y="40"
        textAnchor="middle"
        fontSize="12px"
      >
        {nodeDatum.name}
      </text>
      {nodeDatum.children && (
        <text
          fill="hsl(var(--muted-foreground))"
          strokeWidth="0"
          x="0"
          y="-35"
          textAnchor="middle"
          fontSize="10px"
          style={{ cursor: 'pointer' }}
          onClick={toggleNode}
        >
          {nodeDatum.__rd3t?.collapsed ? '+' : '−'}
        </text>
      )}
    </g>
  );

  if (!treeData) {
    return (
      <div 
        className="border rounded-lg bg-background flex items-center justify-center"
        style={{ width, height }}
      >
        <p className="text-muted-foreground">No family tree data available</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-background" style={{ width, height }}>
      <Tree
        data={treeData}
        translate={translate}
        orientation="vertical"
        pathFunc="step"
        renderCustomNodeElement={renderCustomNode}
        separation={{ siblings: 2, nonSiblings: 2 }}
        nodeSize={{ x: 200, y: 150 }}
        zoomable={true}
        draggable={true}
        collapsible={true}
        enableLegacyTransitions={false}
      />
    </div>
  );
}

function createHierarchy(persons: Person[], connections: Connection[]): TreeData | null {
  if (persons.length === 0) return null;

  // Find root person (someone who is not a child)
  const childIds = new Set(connections.map(c => c.to_person_id));
  const rootPersons = persons.filter(p => !childIds.has(p.id));
  
  const root = rootPersons[0] || persons[0];
  return buildTree(root, persons, connections, new Set());
}

function buildTree(person: Person, allPersons: Person[], connections: Connection[], visited: Set<string>): TreeData {
  if (visited.has(person.id)) {
    return {
      name: person.name,
      attributes: {
        id: person.id,
        gender: person.gender,
        profile_photo_url: person.profile_photo_url
      }
    };
  }
  
  visited.add(person.id);

  const children = connections
    .filter(c => c.from_person_id === person.id)
    .map(c => allPersons.find(p => p.id === c.to_person_id))
    .filter(p => p && !visited.has(p.id))
    .map(p => buildTree(p!, allPersons, connections, visited));

  return {
    name: person.name,
    attributes: {
      id: person.id,
      gender: person.gender,
      profile_photo_url: person.profile_photo_url
    },
    children: children.length > 0 ? children : undefined
  };
}

function getGenderColor(gender?: string | null): string {
  switch (gender?.toLowerCase()) {
    case 'male': return 'hsl(var(--chart-1))';
    case 'female': return 'hsl(var(--chart-2))';
    default: return 'hsl(var(--chart-3))';
  }
}