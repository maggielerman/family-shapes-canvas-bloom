import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Heart, Baby, Dna, GitBranch, Target, Zap, Network, Layers, TreePine, Building2, Share2 } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";
import { PersonCardDialog } from "@/components/people/PersonCard";

// Lazy load heavy chart components for better performance

const ForceDirectedLayout = lazy(() => import("./layouts/ForceDirectedLayout").then(module => ({ default: module.ForceDirectedLayout })));

const DagreLayout = lazy(() => import("./layouts/DagreLayout").then(module => ({ default: module.DagreLayout })));
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
  connections: Connection[];
  onPersonAdded: () => void;
  onConnectionsUpdated: () => void;
}

export function FamilyTreeVisualization({ familyTreeId, persons, connections, onPersonAdded, onConnectionsUpdated }: FamilyTreeVisualizationProps) {
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
      onConnectionsUpdated();
    },
    onDonorAdded: () => {
      setAddPersonDialogOpen(false);
      // Refresh the tree data
      onConnectionsUpdated();
    },
  });

  // Use centralized relationship types
  const relationshipTypes = RelationshipTypeHelpers.getForSelection();

  // Handle responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
    <div className="space-y-6" ref={containerRef}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={() => setAddPersonDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
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
      {persons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first family member to start building your family tree
          </p>
          <Button onClick={() => setAddPersonDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Person
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="force" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="force" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              <span className="hidden lg:inline">Force</span>
            </TabsTrigger>
            <TabsTrigger value="dagre" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden lg:inline">Dagre</span>
            </TabsTrigger>
            <TabsTrigger value="xyflow" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden lg:inline">XY Flow</span>
            </TabsTrigger>
          </TabsList>



        <TabsContent value="force" className="mt-6">
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
        </TabsContent>



        <TabsContent value="dagre" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <DagreLayout
              persons={persons}
              connections={connections}
              relationshipTypes={relationshipTypes}
              width={dimensions.width}
              height={dimensions.height}
              onPersonClick={handlePersonClick}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="xyflow" className="mt-6">
          <Suspense fallback={<ChartLoadingSpinner />}>
            <XYFlowTreeBuilder
              familyTreeId={familyTreeId}
              persons={persons}
              onPersonAdded={onPersonAdded}
            />
          </Suspense>
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