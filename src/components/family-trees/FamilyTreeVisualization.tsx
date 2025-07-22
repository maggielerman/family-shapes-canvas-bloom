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
import { 
  calculateGenerations, 
  getGenerationalConnections, 
  getSiblingConnections,
  getGenerationStats 
} from "@/utils/generationUtils";

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

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

  const relationshipTypes = [
    { value: "parent", label: "Parent", icon: Users, color: "hsl(var(--chart-1))" },
    { value: "child", label: "Child", icon: Baby, color: "hsl(var(--chart-2))" },
    { value: "partner", label: "Partner", icon: Heart, color: "hsl(var(--chart-3))" },
    { value: "sibling", label: "Sibling", icon: Users, color: "hsl(var(--chart-4))" },
    { value: "donor", label: "Donor", icon: Dna, color: "hsl(var(--chart-5))" },
    { value: "gestational_carrier", label: "Gestational Carrier", icon: Baby, color: "hsl(var(--chart-1))" },
  ];

  useEffect(() => {
    fetchConnections();
  }, [familyTreeId]);

  const fetchConnections = async () => {
    try {
      // Fetch connections directly associated with this family tree
      const { data: treeConnections, error: treeError } = await supabase
        .from('connections')
        .select('*')
        .eq('family_tree_id', familyTreeId);

      if (treeError) throw treeError;

      // Get person IDs who are members of this family tree
      const { data: treeMembers, error: membersError } = await supabase
        .from('family_tree_members')
        .select('person_id')
        .eq('family_tree_id', familyTreeId);

      if (membersError) throw membersError;

      const personIds = (treeMembers || []).map(m => m.person_id);

      // Fetch connections between people who are members of this tree (but don't have family_tree_id set)
      const { data: memberConnections, error: memberError } = await supabase
        .from('connections')
        .select('*')
        .is('family_tree_id', null)
        .in('from_person_id', personIds)
        .in('to_person_id', personIds);

      if (memberError) throw memberError;

      // Combine and deduplicate connections
      const allConnections = [...(treeConnections || []), ...(memberConnections || [])];
      const uniqueConnections = allConnections.filter((conn, index, self) => 
        index === self.findIndex(c => c.id === conn.id)
      );

      setConnections(uniqueConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleAddPerson = async (personData: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const { error } = await supabase
        .from('persons')
        .insert({
          ...personData,
          family_tree_id: familyTreeId,
          user_id: userData.user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Person added successfully",
      });

      setAddPersonDialogOpen(false);
      onPersonAdded();
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person",
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

  // Calculate responsive dimensions based on screen size
  const getVisualizationDimensions = () => {
    if (typeof window !== 'undefined') {
      const width = Math.min(window.innerWidth - 40, 800); // Account for padding
      const height = Math.min(window.innerHeight * 0.7, 600);
      return { width, height };
    }
    return { width: 800, height: 600 };
  };

  const { width: vizWidth, height: vizHeight } = getVisualizationDimensions();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button 
            onClick={() => setAddPersonDialogOpen(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground text-center sm:text-right">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
          <div className="flex flex-col items-center justify-center h-64 sm:h-96 text-center p-4">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Start building your family tree by adding family members.
            </p>
            <Button 
              onClick={() => setAddPersonDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Person
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="xyflow" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-full min-w-max grid-cols-6 sm:w-auto">
              <TabsTrigger value="xyflow" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                <Network className="w-3 h-3" />
                <span className="hidden sm:inline">Interactive</span>
                <span className="sm:hidden">Flow</span>
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                <GitBranch className="w-3 h-3" />
                Tree
              </TabsTrigger>
              <TabsTrigger value="radial" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                <Users className="w-3 h-3" />
                <span className="hidden sm:inline">Radial</span>
                <span className="sm:hidden">Rad</span>
              </TabsTrigger>
              <TabsTrigger value="force" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                <Zap className="w-3 h-3" />
                Force
              </TabsTrigger>
              <TabsTrigger value="react-tree" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                <Network className="w-3 h-3" />
                <span className="hidden sm:inline">D3 Tree</span>
                <span className="sm:hidden">D3</span>
              </TabsTrigger>
              <TabsTrigger value="cluster" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                <Layers className="w-3 h-3" />
                <span className="hidden sm:inline">Cluster</span>
                <span className="sm:hidden">Clus</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="xyflow" className="mt-4">
            <div className="w-full overflow-hidden rounded-lg border">
              <XYFlowTreeBuilder
                familyTreeId={familyTreeId}
                persons={persons}
                onPersonAdded={onPersonAdded}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="tree" className="mt-4">
            <div className="w-full overflow-auto rounded-lg border bg-background">
              <TreeLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={vizWidth}
                height={vizHeight}
                onPersonClick={handlePersonClick}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="radial" className="mt-4">
            <div className="w-full overflow-auto rounded-lg border bg-background">
              <RadialTreeLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={vizWidth}
                height={vizHeight}
                onPersonClick={handlePersonClick}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="force" className="mt-4">
            <div className="w-full overflow-auto rounded-lg border bg-background">
              <ForceDirectedLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={vizWidth}
                height={vizHeight}
                onPersonClick={handlePersonClick}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="react-tree" className="mt-4">
            <div className="w-full overflow-auto rounded-lg border bg-background">
              <ReactD3TreeLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={vizWidth}
                height={vizHeight}
                onPersonClick={handlePersonClick}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="cluster" className="mt-4">
            <div className="w-full overflow-auto rounded-lg border bg-background">
              <ClusterLayout
                persons={persons}
                connections={connections}
                relationshipTypes={relationshipTypes}
                width={vizWidth}
                height={vizHeight}
                onPersonClick={handlePersonClick}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
      />

      <PersonCardDialog
        person={viewingPerson}
        open={!!viewingPerson}
        onOpenChange={(open) => !open && setViewingPerson(null)}
      />
    </div>
  );
}