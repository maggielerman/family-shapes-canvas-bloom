import { useEffect, useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Heart, Baby, Dna, GitBranch, Target, Zap, Network, Layers, TreePine } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";
import { PersonCardDialog } from "@/components/people/PersonCard";
import { ConnectionManager } from "@/components/connections/ConnectionManager";

// Lazy load heavy chart components for better performance
const TreeLayout = lazy(() => import("./layouts/TreeLayout").then(module => ({ default: module.TreeLayout })));
const RadialTreeLayout = lazy(() => import("./layouts/RadialTreeLayout").then(module => ({ default: module.RadialTreeLayout })));
const ForceDirectedLayout = lazy(() => import("./layouts/ForceDirectedLayout").then(module => ({ default: module.ForceDirectedLayout })));
const ReactD3TreeLayout = lazy(() => import("./layouts/ReactD3TreeLayout").then(module => ({ default: module.ReactD3TreeLayout })));
const ClusterLayout = lazy(() => import("./layouts/ClusterLayout").then(module => ({ default: module.ClusterLayout })));
const XYFlowTreeBuilder = lazy(() => import("./XYFlowTreeBuilder").then(module => ({ default: module.XYFlowTreeBuilder })));

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

// Loading component for chart components
const ChartLoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
  </div>
);

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
        
        <div className="flex gap-2">
          <ConnectionManager 
            familyTreeId={familyTreeId}
            persons={persons}
            connections={connections}
            onConnectionsUpdated={fetchConnections}
          />
        </div>
      </div>

      {/* Generation Stats */}
      {generationStats.totalGenerations > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Generation Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-coral-600">{generationStats.totalGenerations}</div>
                <div className="text-sm text-muted-foreground">Generations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sage-600">{persons.length}</div>
                <div className="text-sm text-muted-foreground">People</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-dusty-600">{connections.length}</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-navy-600">{generationStats.maxGeneration}</div>
                <div className="text-sm text-muted-foreground">Max Gen</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualization Tabs */}
      <Tabs defaultValue="tree" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span className="hidden lg:inline">Tree</span>
          </TabsTrigger>
          <TabsTrigger value="radial" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden lg:inline">Radial</span>
          </TabsTrigger>
          <TabsTrigger value="force" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            <span className="hidden lg:inline">Force</span>
          </TabsTrigger>
          <TabsTrigger value="d3tree" className="flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            <span className="hidden lg:inline">D3 Tree</span>
          </TabsTrigger>
          <TabsTrigger value="cluster" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden lg:inline">Cluster</span>
          </TabsTrigger>
          <TabsTrigger value="xyflow" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden lg:inline">XY Flow</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <TreeLayout
              persons={persons}
              connections={connections}
              onPersonClick={handlePersonClick}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="radial" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <RadialTreeLayout
              persons={persons}
              connections={connections}
              onPersonClick={handlePersonClick}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="force" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <ForceDirectedLayout
              persons={persons}
              connections={connections}
              onPersonClick={handlePersonClick}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="d3tree" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <ReactD3TreeLayout
              persons={persons}
              connections={connections}
              onPersonClick={handlePersonClick}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="cluster" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <ClusterLayout
              persons={persons}
              connections={connections}
              onPersonClick={handlePersonClick}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="xyflow" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <XYFlowTreeBuilder
              familyTreeId={familyTreeId}
              persons={persons}
              connections={connections}
              onPersonClick={handlePersonClick}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
        onDonorSubmit={handleAddDonor}
      />

      {viewingPerson && (
        <PersonCardDialog
          person={viewingPerson}
          open={!!viewingPerson}
          onOpenChange={(open) => !open && setViewingPerson(null)}
        />
      )}
    </div>
  );
}