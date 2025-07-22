import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Heart, Baby, Dna, GitBranch, Target, Zap, Network, Layers } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";
import { PersonCardDialog } from "@/components/people/PersonCard";
import { ConnectionManager } from "@/components/connections/ConnectionManager";

import { TreeLayout } from "./layouts/TreeLayout";
import { RadialTreeLayout } from "./layouts/RadialTreeLayout";
import { ForceDirectedLayout } from "./layouts/ForceDirectedLayout";
import { ReactD3TreeLayout } from "./layouts/ReactD3TreeLayout";
import { ClusterLayout } from "./layouts/ClusterLayout";
import { XYFlowTreeBuilder } from "./XYFlowTreeBuilder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Person } from "@/types/person";
import { Connection, ConnectionUtils } from "@/types/connection";
import { RelationshipTypeHelpers } from "@/types/relationshipTypes";
import { ConnectionService } from "@/services/connectionService";
import { PersonService } from "@/services/personService";
import { 
  calculateGenerations, 
  getGenerationalConnections, 
  getSiblingConnections,
  getGenerationStats 
} from "@/utils/generationUtils";
import { usePersonManagement } from '@/hooks/use-person-management';

interface FamilyTreeVisualizationProps {
  familyTreeId: string;
  persons: Person[];
  onPersonAdded: () => void;
}

export function FamilyTreeVisualization({ familyTreeId, persons, onPersonAdded }: FamilyTreeVisualizationProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const { toast } = useToast();

  const { handleAddPerson, handleAddDonor } = usePersonManagement({
    familyTreeId,
    onPersonAdded: () => {
      setAddPersonDialogOpen(false);
      // Refresh the tree data
      fetchConnections();
    },
    onDonorAdded: () => {
      setAddPersonDialogOpen(false);
      // Refresh the tree data
      fetchConnections();
    },
  });

  // Use centralized relationship types
  const relationshipTypes = RelationshipTypeHelpers.getForSelection();

  useEffect(() => {
    fetchConnections();
  }, [familyTreeId]);

  const fetchConnections = async () => {
    try {
      const connectionsData = await ConnectionService.getConnectionsForFamilyTree(familyTreeId);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    }
  };

  const handlePersonClick = (person: Person) => {
    setViewingPerson(person);
  };

  // Calculate generation statistics
  const generationMap = persons.length > 0 && connections.length > 0 
    ? calculateGenerations(persons, connections) 
    : new Map();
  const generationStats = getGenerationStats(generationMap);
  const generationalConnections = getGenerationalConnections(connections);
  const siblingConnections = getSiblingConnections(connections);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={() => setAddPersonDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Generation-based visualization • {generationStats.totalGenerations} generations
        </div>
      </div>

      {/* Connection Manager */}
      <ConnectionManager
        familyTreeId={familyTreeId}
        persons={persons}
        onConnectionUpdated={fetchConnections}
      />

      {/* Generation & Connection Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Family Tree Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total People</div>
              <div className="font-semibold">{persons.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Generations</div>
              <div className="font-semibold">{generationStats.totalGenerations}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Parent-Child Lines</div>
              <div className="font-semibold">{generationalConnections.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Sibling Groups</div>
              <div className="font-semibold text-muted-foreground">
                {siblingConnections.length} 
                <span className="text-xs block">color coded</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <strong>How to read:</strong> Each generation has a unique color. 
            Lines connect parents to children. Siblings share the same generation color but aren't connected by lines.
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      {persons.length === 0 ? (
        <div className="border rounded-lg bg-card">
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your family tree by adding family members.
            </p>
            <Button onClick={() => setAddPersonDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Person
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="xyflow" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="xyflow" className="flex items-center gap-1">
              <Network className="w-3 h-3" />
              Interactive
            </TabsTrigger>
            <TabsTrigger value="tree" className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              Tree
            </TabsTrigger>
            <TabsTrigger value="radial" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Radial
            </TabsTrigger>
            <TabsTrigger value="force" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Force
            </TabsTrigger>
            <TabsTrigger value="react-tree" className="flex items-center gap-1">
              <Network className="w-3 h-3" />
              D3 Tree
            </TabsTrigger>
            <TabsTrigger value="cluster" className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Cluster
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="xyflow" className="mt-4">
            <XYFlowTreeBuilder
              familyTreeId={familyTreeId}
              persons={persons}
              onPersonAdded={onPersonAdded}
            />
          </TabsContent>
          
          <TabsContent value="tree" className="mt-4">
            <TreeLayout
              persons={persons}
              connections={connections}
              relationshipTypes={relationshipTypes}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="radial" className="mt-4">
            <RadialTreeLayout
              persons={persons}
              connections={connections}
              relationshipTypes={relationshipTypes}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="force" className="mt-4">
            <ForceDirectedLayout
              persons={persons}
              connections={connections}
              relationshipTypes={relationshipTypes}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="react-tree" className="mt-4">
            <ReactD3TreeLayout
              persons={persons}
              connections={connections}
              relationshipTypes={relationshipTypes}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="cluster" className="mt-4">
            <ClusterLayout
              persons={persons}
              connections={connections}
              relationshipTypes={relationshipTypes}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
        </Tabs>
      )}

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
        onDonorSubmit={handleAddDonor}
      />

      <PersonCardDialog
        person={viewingPerson}
        open={!!viewingPerson}
        onOpenChange={(open) => !open && setViewingPerson(null)}
      />
    </div>
  );
}