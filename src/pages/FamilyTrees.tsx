import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Settings, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CreateFamilyTreeDialog } from "@/components/family-trees/CreateFamilyTreeDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FamilyTree {
  id: string;
  name: string;
  description?: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tree_data?: any;
  settings?: any;
  _count?: {
    persons: number;
    connections: number;
  };
}

export default function FamilyTrees() {
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchFamilyTrees();
  }, []);

  const fetchFamilyTrees = async () => {
    try {
      console.log('Fetching family trees...');
      
      // First get basic family trees data
      const { data: treesData, error: treesError } = await supabase
        .from('family_trees')
        .select('*')
        .order('updated_at', { ascending: false });

      console.log('Family trees data:', treesData, 'Error:', treesError);

      if (treesError) throw treesError;

      // Get counts separately for each tree
      const treesWithCounts = await Promise.all(
        (treesData || []).map(async (tree) => {
          console.log('Processing tree:', tree.name, tree.id);
          
          // Count family tree members
          const { count: membersCount, error: membersError } = await supabase
            .from('family_tree_members')
            .select('*', { count: 'exact', head: true })
            .eq('family_tree_id', tree.id);

          if (membersError) {
            console.error('Error counting members:', membersError);
          }

          // Count connections
          const { count: connectionsCount, error: connectionsError } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .eq('family_tree_id', tree.id);

          if (connectionsError) {
            console.error('Error counting connections:', connectionsError);
          }

          return {
            ...tree,
            _count: {
              persons: membersCount || 0,
              connections: connectionsCount || 0
            }
          };
        })
      );
      
      console.log('Final trees with counts:', treesWithCounts);
      setFamilyTrees(treesWithCounts);
    } catch (error) {
      console.error('Error fetching family trees:', error);
      toast({
        title: "Error",
        description: "Failed to load family trees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = async (data: { name: string; description: string; visibility: 'private' | 'shared' | 'public' }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const { data: newTree, error } = await supabase
        .from('family_trees')
        .insert({
          name: data.name,
          description: data.description,
          visibility: data.visibility,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Family tree created successfully",
      });

      setCreateDialogOpen(false);
      fetchFamilyTrees();
      navigate(`/family-trees/${newTree.id}`);
    } catch (error) {
      console.error('Error creating family tree:', error);
      toast({
        title: "Error",
        description: "Failed to create family tree",
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

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Family Trees</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Create and manage your family trees</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Family Trees</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Create and manage your family trees</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Tree
        </Button>
      </div>

      {familyTrees.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No family trees yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first family tree to start building your family history.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tree
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {familyTrees.map((tree) => (
            <Card key={tree.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tree.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {tree.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge className={getVisibilityColor(tree.visibility)}>
                    {tree.visibility}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{tree._count?.persons || 0} people</span>
                    <span>{tree._count?.connections || 0} connections</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/family-trees/${tree.id}`)}
                    >
                      View Tree
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/family-trees/${tree.id}/settings`);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    {tree.visibility !== 'private' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Share functionality
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFamilyTreeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTree}
      />
    </div>
  );
}