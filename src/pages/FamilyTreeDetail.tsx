import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users, Edit, Trash2, Upload, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AddPersonDialog } from "@/components/family-trees/AddPersonDialog";
import { AddExistingPersonDialog } from "@/components/family-trees/AddExistingPersonDialog";
import { PersonCard } from "@/components/family-trees/PersonCard";
import { PersonCardDialog } from "@/components/people/PersonCard";
import { EditPersonDialog } from "@/components/people/EditPersonDialog";
import { FamilyTreeVisualization } from "@/components/family-trees/FamilyTreeVisualization";
import { SharingSettingsDialog } from "@/components/family-trees/SharingSettingsDialog";
import { FamilyTreeDocumentManager } from "@/components/family-trees/FamilyTreeDocumentManager";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Person } from "@/types/person";

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

  const handleAddPerson = async (personData: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      // First create the person
      const { data: newPerson, error: personError } = await supabase
        .from('persons')
        .insert({
          ...personData,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (personError) throw personError;

      // Then add them to the family tree
      const { error: membershipError } = await supabase
        .from('family_tree_members')
        .insert({
          family_tree_id: id,
          person_id: newPerson.id,
          added_by: userData.user.id,
          role: 'member'
        });

      if (membershipError) throw membershipError;

      toast({
        title: "Success",
        description: "Person added successfully",
      });

      setAddPersonDialogOpen(false);
      fetchPersons();
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person",
        variant: "destructive",
      });
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shared':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || !familyTree) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/family-trees')}
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Trees</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{familyTree.name}</h1>
            <Badge className={`${getVisibilityColor(familyTree.visibility)} flex-shrink-0`}>
              {familyTree.visibility}
            </Badge>
          </div>
          {familyTree.description && (
            <p className="text-muted-foreground line-clamp-2">{familyTree.description}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button 
            variant="outline"
            onClick={() => setSharingDialogOpen(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
          >
            <Edit className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Edit Tree</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Upload Documents</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="people" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="people" className="flex-1 sm:flex-none">People</TabsTrigger>
            <TabsTrigger value="tree" className="flex-1 sm:flex-none">Tree View</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 sm:flex-none">Media</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="people" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Family Members</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setAddExistingPersonDialogOpen(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Existing
              </Button>
              <Button 
                onClick={() => setAddPersonDialogOpen(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Person
              </Button>
            </div>
          </div>

          {persons.length === 0 ? (
            <Card className="text-center py-8 sm:py-12">
              <CardContent>
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
                <p className="text-muted-foreground mb-4 px-4">
                  Start building your family tree by adding family members.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setAddExistingPersonDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Existing Person
                  </Button>
                  <Button 
                    onClick={() => setAddPersonDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Person
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {persons.map((person) => (
                <PersonCard 
                  key={person.id} 
                  person={person}
                  onClick={() => setViewingPerson(person)}
                  onEdit={(p) => setEditingPerson(p)}
                  showRemoveFromTree={true}
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

        <TabsContent value="tree" className="space-y-6">
          <FamilyTreeVisualization
            familyTreeId={familyTree.id}
            persons={persons}
            onPersonAdded={fetchPersons}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <FamilyTreeDocumentManager familyTreeId={familyTree.id} />
        </TabsContent>
      </Tabs>

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
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