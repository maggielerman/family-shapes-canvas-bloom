import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Heart, Baby, Dna } from "lucide-react";
import { AddPersonDialog } from "./AddPersonDialog";
import { ConnectionCreator } from "./ConnectionCreator";
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
          Drag people to create connections between them
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Relationship Types</CardTitle>
        </CardHeader>
        <CardContent>
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
        <ConnectionCreator
          familyTreeId={familyTreeId}
          persons={persons}
          connections={connections}
          onConnectionAdded={fetchConnections}
        />
      )}

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
      />
    </div>
  );
}