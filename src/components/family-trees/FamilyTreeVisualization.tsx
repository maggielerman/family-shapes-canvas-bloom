import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Heart, Baby, Dna, GitBranch, Target, Zap, Network, Layers } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";
import { ConnectionCreator } from "./ConnectionCreator";
import { TreeLayout } from "./layouts/TreeLayout";
import { RadialTreeLayout } from "./layouts/RadialTreeLayout";
import { ForceDirectedLayout } from "./layouts/ForceDirectedLayout";
import { ReactD3TreeLayout } from "./layouts/ReactD3TreeLayout";
import { ClusterLayout } from "./layouts/ClusterLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  family_tree_id?: string | null;
}

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
  const { toast } = useToast();

  const relationshipTypes = [
    { value: "parent", label: "Parent", icon: Users, color: "bg-blue-100 text-blue-800" },
    { value: "child", label: "Child", icon: Baby, color: "bg-green-100 text-green-800" },
    { value: "partner", label: "Partner", icon: Heart, color: "bg-pink-100 text-pink-800" },
    { value: "sibling", label: "Sibling", icon: Users, color: "bg-purple-100 text-purple-800" },
    { value: "donor", label: "Donor", icon: Dna, color: "bg-orange-100 text-orange-800" },
    { value: "half_sibling", label: "Half Sibling", icon: Users, color: "bg-indigo-100 text-indigo-800" },
  ];

  useEffect(() => {
    fetchConnections();
  }, [familyTreeId]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('family_tree_id', familyTreeId);

      if (error) throw error;
      setConnections(data || []);
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
    console.log('Person clicked:', person);
    // You can add more functionality here, like opening a person details dialog
  };

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
          Multiple visualization layouts available below
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Relationship Types & Gender Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium mb-2">Relationships</h4>
              <div className="flex flex-wrap gap-2">
                {relationshipTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <div key={type.value} className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                      <Icon className="w-3 h-3" />
                      {type.label}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium mb-2">Gender Colors</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
                  Male
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }}></div>
                  Female
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }}></div>
                  Other/Unknown
                </div>
              </div>
            </div>
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
        <Tabs defaultValue="interactive" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="interactive" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
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
          
          <TabsContent value="interactive" className="mt-4">
            <ConnectionCreator
              familyTreeId={familyTreeId}
              persons={persons}
              connections={connections}
              onConnectionAdded={fetchConnections}
            />
          </TabsContent>
          
          <TabsContent value="tree" className="mt-4">
            <TreeLayout
              persons={persons}
              connections={connections}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="radial" className="mt-4">
            <RadialTreeLayout
              persons={persons}
              connections={connections}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="force" className="mt-4">
            <ForceDirectedLayout
              persons={persons}
              connections={connections}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="react-tree" className="mt-4">
            <ReactD3TreeLayout
              persons={persons}
              connections={connections}
              width={800}
              height={600}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
          
          <TabsContent value="cluster" className="mt-4">
            <ClusterLayout
              persons={persons}
              connections={connections}
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
      />
    </div>
  );
}