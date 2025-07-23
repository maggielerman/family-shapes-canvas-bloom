import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users, Edit, Trash2, Upload, Share2, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AddPersonDialog } from "@/components/family-trees/AddPersonDialog";
import { AddExistingPersonDialog } from "@/components/family-trees/AddExistingPersonDialog";
import { PersonCard } from "@/components/people/PersonCard";
import { PersonCardDialog } from "@/components/people/PersonCard";
import { EditPersonDialog } from "@/components/people/EditPersonDialog";
import { FamilyTreeVisualization } from "@/components/family-trees/FamilyTreeVisualization";
import { FamilyTreeStats } from "@/components/family-trees/FamilyTreeStats";
import { SharingSettingsDialog } from "@/components/family-trees/SharingSettingsDialog";
import { FamilyTreeDocumentManager } from "@/components/family-trees/FamilyTreeDocumentManager";
import { ConnectionManager } from "@/components/connections/ConnectionManager";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PersonService } from "@/services/personService";
import { Person } from "@/types/person";
import { Connection } from "@/types/connection";
import { ConnectionService } from "@/services/connectionService";
import { usePersonManagement } from '@/hooks/use-person-management';

interface FamilyTree {
  id: string;
  name: string;
  description?: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function FamilyTreeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [addExistingPersonDialogOpen, setAddExistingPersonDialogOpen] = useState(false);
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  useEffect(() => {
    if (id) {
      fetchFamilyTree();
      fetchPersons();
      fetchConnections();
    }
  }, [id]);

  const fetchFamilyTree = async () => {
    try {
      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFamilyTree(data);
    } catch (error) {
      console.error('Error fetching family tree:', error);
      toast({
        title: "Error",
        description: "Failed to load family tree",
        variant: "destructive",
      });
      navigate('/family-trees');
    }
  };

  const fetchPersons = async () => {
    try {
      // Fetch persons through the family_tree_members junction table
      const { data, error } = await supabase
        .from('family_tree_members')
        .select(`
          person_id,
          role,
          person:persons(
            id,
            name,
            date_of_birth,
            birth_place,
            gender,
            profile_photo_url,
            email,
            phone,
            address,
            status,
            notes,
            donor,
            used_ivf,
            used_iui,
            fertility_treatments,
            is_self,
            created_at
          )
        `)
        .eq('family_tree_id', id);

      if (error) throw error;
      
      // Transform the data to match our Person interface
      const personsData = (data || []).map(membership => ({
        ...membership.person,
        membership_role: membership.role
      }));
      
      setPersons(personsData || []);
    } catch (error) {
      console.error('Error fetching persons:', error);
      toast({
        title: "Error",
        description: "Failed to load family members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const connectionsData = await ConnectionService.getConnectionsForFamilyTree(id!);
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

  const { handleAddPerson, handleAddDonor, isSubmitting } = usePersonManagement({
    familyTreeId: familyTree?.id,
    onPersonAdded: () => {
      setAddPersonDialogOpen(false);
      fetchFamilyTree();
    },
    onDonorAdded: () => {
      setAddPersonDialogOpen(false);
      fetchFamilyTree();
    },
  });

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'private':
        return 'bg-red-100 text-red-800';
      case 'shared':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!familyTree) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Family tree not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/family-trees')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trees
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{familyTree.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getVisibilityColor(familyTree.visibility)}>
                {familyTree.visibility}
              </Badge>
              {familyTree.description && (
                <p className="text-sm text-muted-foreground">
                  {familyTree.description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSharingDialogOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={() => setAddPersonDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="people" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">People ({persons.length})</span>
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span className="hidden lg:inline">Connections</span>
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden lg:inline">Tree</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden lg:inline">Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">Media</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Family Members</h2>
            <Button onClick={() => setAddExistingPersonDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Existing Person
            </Button>
          </div>
          
          {persons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Add your first family member to start building your family tree
                </p>
                <Button onClick={() => setAddPersonDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Person
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {persons.map((person) => (
                <PersonCard 
                  key={person.id} 
                  person={person}
                  onClick={() => setViewingPerson(person)}
                  onEdit={(p) => setEditingPerson(p)}
                  showRemoveFromTree={true}
                  onPersonUpdated={fetchPersons}
                  variant="card"
                  onRemoveFromTree={async (p) => {
                    try {
                      const { error } = await supabase
                        .from('family_tree_members')
                        .delete()
                        .eq('person_id', p.id)
                        .eq('family_tree_id', familyTree.id);

                      if (error) throw error;

                      toast({
                        title: "Person Removed",
                        description: `${p.name} has been removed from this family tree`
                      });

                      fetchPersons();
                    } catch (error) {
                      console.error('Error removing person from tree:', error);
                      toast({
                        title: "Error",
                        description: "Failed to remove person from tree",
                        variant: "destructive"
                      });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Family Connections</h2>
          </div>
          <ConnectionManager 
            familyTreeId={familyTree.id}
            persons={persons}
            onConnectionUpdated={fetchConnections}
          />
        </TabsContent>

        <TabsContent value="tree" className="space-y-6">
          <FamilyTreeVisualization
            familyTreeId={familyTree.id}
            persons={persons}
            connections={connections}
            onPersonAdded={fetchPersons}
            onConnectionsUpdated={fetchConnections}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Family Tree Statistics</h2>
          </div>
          
          {persons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No statistics available</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Add family members to see detailed statistics about your family tree
                </p>
                <Button onClick={() => setAddPersonDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Person
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <FamilyTreeStats 
                persons={persons} 
                connections={connections} 
                showTitle={false}
              />
              
              {/* Additional detailed statistics can be added here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tree Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(familyTree.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(familyTree.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visibility:</span>
                      <Badge className={getVisibilityColor(familyTree.visibility)}>
                        {familyTree.visibility}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Member Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Members:</span>
                      <span className="font-semibold">{persons.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Male:</span>
                      <span>{persons.filter(p => p.gender === 'male').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Female:</span>
                      <span>{persons.filter(p => p.gender === 'female').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other:</span>
                      <span>{persons.filter(p => p.gender && !['male', 'female'].includes(p.gender)).length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <FamilyTreeDocumentManager familyTreeId={familyTree.id} />
        </TabsContent>
      </Tabs>

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
        onDonorSubmit={handleAddDonor}
      />

      <AddExistingPersonDialog
        open={addExistingPersonDialogOpen}
        onOpenChange={setAddExistingPersonDialogOpen}
        familyTreeId={familyTree.id}
        onPersonAdded={fetchPersons}
      />
      
      <SharingSettingsDialog
        open={sharingDialogOpen}
        onOpenChange={setSharingDialogOpen}
        familyTree={familyTree}
        onTreeUpdated={fetchFamilyTree}
      />

      <PersonCardDialog
        person={viewingPerson}
        open={!!viewingPerson}
        onOpenChange={(open) => !open && setViewingPerson(null)}
        onEdit={() => {
          setEditingPerson(viewingPerson);
          setViewingPerson(null);
        }}
      />

      {editingPerson && (
        <EditPersonDialog
          person={editingPerson}
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
          onPersonUpdated={() => {
            fetchPersons();
            setEditingPerson(null);
          }}
        />
      )}
    </div>
  );
}