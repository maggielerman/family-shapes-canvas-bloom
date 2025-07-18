import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  UserPlus,
  Users,
  Loader2
} from "lucide-react";
import { PersonCard } from "@/components/family-trees/PersonCard";
import { PersonCardDialog } from "@/components/people/PersonCard";
import { EditPersonDialog } from "@/components/people/EditPersonDialog";
import { DeletePersonDialog } from "@/components/people/DeletePersonDialog";
import { AddPersonDialog } from "@/components/family-trees/AddPersonDialog";


interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  birth_place?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  notes?: string | null;
  donor?: boolean;
  used_ivf?: boolean;
  used_iui?: boolean;
  fertility_treatments?: any;
  is_self?: boolean;
  created_at: string;
  _count?: {
    family_trees: number;
    connections: number;
  };
}

export default function People() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);

  useEffect(() => {
    fetchPersons();
  }, [user]);

  const fetchPersons = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('persons')
        .select(`
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
        `)
        .eq('user_id', user.id)
        .order('is_self', { ascending: false })
        .order('name');

      if (error) throw error;

      // Get counts for each person
      const personsWithCounts = await Promise.all(
        (data || []).map(async (person) => {
          // Count family trees this person is in
          const { count: treeCount } = await supabase
            .from('persons')
            .select('*', { count: 'exact', head: true })
            .eq('id', person.id)
            .not('family_tree_id', 'is', null);

          // Count connections
          const { count: connectionCount } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .or(`from_person_id.eq.${person.id},to_person_id.eq.${person.id}`);

          return {
            ...person,
            _count: {
              family_trees: treeCount || 0,
              connections: connectionCount || 0
            }
          };
        })
      );

      setPersons(personsWithCounts);
    } catch (error) {
      console.error('Error fetching persons:', error);
      toast({
        title: "Error",
        description: "Failed to load people",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    try {
      // Delete all connections first
      await supabase
        .from('connections')
        .delete()
        .or(`from_person_id.eq.${personId},to_person_id.eq.${personId}`);

      // Delete the person
      const { error } = await supabase
        .from('persons')
        .delete()
        .eq('id', personId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Person Deleted",
        description: "The person and all their connections have been permanently deleted"
      });

      fetchPersons();
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: "Error",
        description: "Failed to delete person",
        variant: "destructive"
      });
    }
  };

  // Filter persons based on search and filters
  const filteredPersons = persons.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || person.status === statusFilter;
    const matchesGender = genderFilter === "all" || person.gender === genderFilter;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  const getStatsForPerson = (person: Person) => {
    return [
      `${person._count?.family_trees || 0} trees`,
      `${person._count?.connections || 0} connections`
    ].join(" • ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">People</h1>
          <p className="text-muted-foreground">
            Manage all people in your family trees and connections
          </p>
        </div>
        <Button onClick={() => setAddPersonDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{persons.length}</div>
            <p className="text-xs text-muted-foreground">
              In your database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Living</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {persons.filter(p => p.status === 'living').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active family members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {persons.reduce((sum, p) => sum + (p._count?.connections || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Family relationships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="living">Living</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-Binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* People Grid */}
      {filteredPersons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== "all" || genderFilter !== "all" 
                ? "No people match your filters" 
                : "No people yet"}
            </h3>
            <p className="text-muted-foreground mb-4 text-center">
              {searchTerm || statusFilter !== "all" || genderFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : "Add your first family member to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && genderFilter === "all" && (
              <Button onClick={() => setAddPersonDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Person
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersons.map((person) => (
            <div key={person.id} className="relative">
              <PersonCard
                person={person}
                onEdit={(p) => setEditingPerson(p)}
                onDelete={(p) => setDeletingPerson(p)}
                onClick={() => setViewingPerson(person)}
                showActions={true}
              />
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {getStatsForPerson(person)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={async (data) => {
          try {
            const { error } = await supabase
              .from('persons')
              .insert({
                ...data,
                user_id: user?.id
              });

            if (error) throw error;

            toast({
              title: "Person Added",
              description: `${data.name} has been added successfully`
            });

            fetchPersons();
            setAddPersonDialogOpen(false);
          } catch (error) {
            console.error('Error adding person:', error);
            toast({
              title: "Error",
              description: "Failed to add person",
              variant: "destructive"
            });
          }
        }}
      />

      {editingPerson && (
        <EditPersonDialog
          person={editingPerson}
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
          onPersonUpdated={fetchPersons}
        />
      )}

      {deletingPerson && (
        <DeletePersonDialog
          person={deletingPerson}
          open={!!deletingPerson}
          onOpenChange={(open) => !open && setDeletingPerson(null)}
          onConfirmDelete={() => {
            handleDeletePerson(deletingPerson.id);
            setDeletingPerson(null);
          }}
        />
      )}

      <PersonCardDialog
        person={viewingPerson}
        open={!!viewingPerson}
        onOpenChange={(open) => !open && setViewingPerson(null)}
        onEdit={() => {
          setEditingPerson(viewingPerson);
          setViewingPerson(null);
        }}
      />
    </div>
  );
}