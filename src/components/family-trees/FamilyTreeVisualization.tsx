import { useEffect, useState, lazy, Suspense, useRef } from "react";
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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Handle responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(rect.width || 800, 320); // Minimum width for mobile
        const height = Math.max(rect.height || 600, 400); // Minimum height for mobile
        setDimensions({
          width,
          height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
    <div className="space-y-4 md:space-y-6" ref={containerRef}>
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button onClick={() => setAddPersonDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>
        
        <div className="flex gap-2">
          <ConnectionManager 
            familyTreeId={familyTreeId}
            persons={persons}
            onConnectionUpdated={fetchConnections}
          />
        </div>
      </div>

      {/* Generation Stats */}
      {generationStats.totalGenerations > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Generation Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-coral-600">{generationStats.totalGenerations}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Generations</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-sage-600">{persons.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">People</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-dusty-600">{connections.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-navy-600">{generationStats.maxGeneration}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Max Gen</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualization Tabs */}
      {persons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
          <p className="text-muted-foreground mb-4 text-sm md:text-base">
            Add your first family member to start building your family tree
          </p>
          <Button onClick={() => setAddPersonDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add First Person
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="tree" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="tree" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <GitBranch className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tree</span>
            </TabsTrigger>
            <TabsTrigger value="radial" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Radial</span>
            </TabsTrigger>
            <TabsTrigger value="force" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Network className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Force</span>
            </TabsTrigger>
            <TabsTrigger value="d3tree" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <TreePine className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">D3 Tree</span>
            </TabsTrigger>
            <TabsTrigger value="cluster" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cluster</span>
            </TabsTrigger>
            <TabsTrigger value="xyflow" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">XY Flow</span>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="tree" className="mt-4 md:mt-6">
          <div className="w-full overflow-x-auto">
            <Suspense fallback={<ChartLoadingSpinner />}>
              <TreeLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={dimensions.width}
                height={dimensions.height}
                onPersonClick={handlePersonClick}
              />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="radial" className="mt-4 md:mt-6">
          <div className="w-full overflow-x-auto">
            <Suspense fallback={<ChartLoadingSpinner />}>
              <RadialTreeLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={dimensions.width}
                height={dimensions.height}
                onPersonClick={handlePersonClick}
              />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="force" className="mt-4 md:mt-6">
          <div className="w-full overflow-x-auto">
            <Suspense fallback={<ChartLoadingSpinner />}>
              <ForceDirectedLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={dimensions.width}
                height={dimensions.height}
                onPersonClick={handlePersonClick}
              />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="d3tree" className="mt-4 md:mt-6">
          <div className="w-full overflow-x-auto">
            <Suspense fallback={<ChartLoadingSpinner />}>
              <ReactD3TreeLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={dimensions.width}
                height={dimensions.height}
                onPersonClick={handlePersonClick}
              />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="cluster" className="mt-4 md:mt-6">
          <div className="w-full overflow-x-auto">
            <Suspense fallback={<ChartLoadingSpinner />}>
              <ClusterLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={dimensions.width}
                height={dimensions.height}
                onPersonClick={handlePersonClick}
              />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="xyflow" className="mt-4 md:mt-6">
          <div className="w-full overflow-hidden">
            <Suspense fallback={<ChartLoadingSpinner />}>
              <XYFlowTreeBuilder
                familyTreeId={familyTreeId}
                persons={persons}
                onPersonAdded={onPersonAdded}
              />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
      )}

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