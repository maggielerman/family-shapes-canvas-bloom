import React, { useState } from 'react';
import CleanUnionDagreLayout from './CleanUnionDagreLayout';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data for the demo
const samplePersons: Person[] = [
  {
    id: '1',
    name: 'John Smith',
    date_of_birth: '1980-01-01',
    date_of_death: null,
    gender: 'male',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    date_of_birth: '1982-05-15',
    date_of_death: null,
    gender: 'female',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Alice Smith',
    date_of_birth: '2010-03-20',
    date_of_death: null,
    gender: 'female',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Bob Smith',
    date_of_birth: '2012-07-10',
    date_of_death: null,
    gender: 'male',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Robert Smith Sr.',
    date_of_birth: '1950-12-25',
    date_of_death: null,
    gender: 'male',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Mary Smith',
    date_of_birth: '1952-08-14',
    date_of_death: null,
    gender: 'female',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Sarah Johnson',
    date_of_birth: '1955-03-10',
    date_of_death: null,
    gender: 'female',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'Michael Johnson',
    date_of_birth: '1953-07-22',
    date_of_death: null,
    gender: 'male',
    status: 'living',
    is_self: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const sampleConnections: Connection[] = [
  // Grandparents to Parents (Robert Sr. & Mary -> John)
  {
    id: '1',
    from_person_id: '5',
    to_person_id: '1',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    from_person_id: '6',
    to_person_id: '1',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Grandparents to Parents (Michael & Sarah -> Jane)
  {
    id: '3',
    from_person_id: '8',
    to_person_id: '2',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    from_person_id: '7',
    to_person_id: '2',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Parents to Children (John & Jane -> Alice)
  {
    id: '5',
    from_person_id: '1',
    to_person_id: '3',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    from_person_id: '2',
    to_person_id: '3',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Parents to Children (John & Jane -> Bob)
  {
    id: '7',
    from_person_id: '1',
    to_person_id: '4',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    from_person_id: '2',
    to_person_id: '4',
    relationship_type: 'parent',
    group_id: 'demo-group',
    organization_id: 'demo-org',
    notes: '',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const sampleRelationshipTypes = [
  {
    id: 'parent',
    name: 'Parent',
    category: 'generational',
    reciprocal_id: 'child',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'child',
    name: 'Child',
    category: 'generational',
    reciprocal_id: 'parent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'spouse',
    name: 'Spouse',
    category: 'lateral',
    reciprocal_id: 'spouse',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

interface UnionDagreLayoutDemoProps {
  width?: number;
  height?: number;
}

export function UnionDagreLayoutDemo({ width = 1200, height = 800 }: UnionDagreLayoutDemoProps) {
  const [currentLayout, setCurrentLayout] = useState<'TB' | 'LR' | 'BT' | 'RL'>('TB');
  const [enableUnions, setEnableUnions] = useState(true);
  const [minSharedChildren, setMinSharedChildren] = useState(1);

  const handlePersonClick = (person: Person) => {
    console.log('Person clicked:', person.name);
  };

  const handleUnionClick = (union: any) => {
    console.log('Union clicked:', union);
  };

  return (
    <div className="w-full h-full relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-20 space-y-4">
        <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Union Nodes Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable Unions Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-unions" className="text-sm font-medium">
                Enable Union Nodes
              </Label>
              <Switch
                id="enable-unions"
                checked={enableUnions}
                onCheckedChange={setEnableUnions}
              />
            </div>

            {/* Min Shared Children Slider */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Min Shared Children: {minSharedChildren}
              </Label>
              <Slider
                value={[minSharedChildren]}
                onValueChange={(value) => setMinSharedChildren(value[0])}
                max={3}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values create fewer unions (more strict grouping)
              </p>
            </div>

            {/* Layout Direction */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Layout Direction</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['TB', 'LR', 'BT', 'RL'] as const).map((direction) => (
                  <Button
                    key={direction}
                    variant={currentLayout === direction ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentLayout(direction)}
                    className="text-xs"
                  >
                    {direction}
                  </Button>
                ))}
              </div>
            </div>

            {/* Demo Info */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Sample Family:</strong> Three generations with unions. 
                Grandparents: Robert Sr. & Mary Smith, Michael & Sarah Johnson. 
                Parents: John & Jane Smith (union). 
                Children: Alice & Bob Smith.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Union Dagre Layout */}
      <div className="w-full h-full">
        <CleanUnionDagreLayout
          persons={samplePersons}
          connections={sampleConnections}
          width={width}
          height={height}
          onPersonClick={handlePersonClick}
          onUnionClick={handleUnionClick}
          enableUnions={enableUnions}
          minSharedChildren={minSharedChildren}
        />
      </div>
    </div>
  );
}

export default UnionDagreLayoutDemo; 