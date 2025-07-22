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
import { PersonService } from "@/services/personService";
import { Person } from "@/types/person";
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shared':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || !familyTree) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/family-trees')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trees
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold truncate">{familyTree.name}</h1>
            <Badge className={getVisibilityColor(familyTree.visibility)} variant="outline">
              {familyTree.visibility}
            </Badge>
          </div>
          {familyTree.description && (
            <p className="text-muted-foreground text-sm lg:text-base">{familyTree.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Button 
            variant="outline"
            onClick={() => setSharingDialogOpen(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Edit className="w-4 h-4 mr-2" />
            Edit Tree
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Upload className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      <Tabs defaultValue="people" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="people" className="text-xs sm:text-sm">People</TabsTrigger>
          <TabsTrigger value="tree" className="text-xs sm:text-sm">Tree View</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-xl font-semibold">Family Members</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button 
                variant="outline" 
                onClick={() => setAddExistingPersonDialogOpen(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Existing
              </Button>
              <Button onClick={() => setAddPersonDialogOpen(true)} size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add New Person
              </Button>
            </div>
          </div>

          {persons.length === 0 ? (
            <Card className="text-center py-8 lg:py-12">
              <CardContent className="px-4">
                <Users className="w-12 h-12 lg:w-16 lg:h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
                <p className="text-muted-foreground mb-4 text-sm lg:text-base">
                  Start building your family tree by adding family members.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setAddExistingPersonDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Existing Person
                  </Button>
                  <Button onClick={() => setAddPersonDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Person
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
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