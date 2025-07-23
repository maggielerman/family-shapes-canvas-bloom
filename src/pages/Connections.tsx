import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Heart, Baby, Dna, GitBranch, Target, Zap, Network, Layers, TreePine, Building2, Share2, Search } from "lucide-react";
import { ConnectionManager } from "@/components/connections/ConnectionManager";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Person } from "@/types/person";
import { Connection } from "@/types/connection";
import { ConnectionService } from "@/services/connectionService";
import { PersonService } from "@/services/personService";
import { 
  calculateGenerations, 
  getGenerationalConnections, 
  getSiblingConnections,
  getGenerationStats 
} from "@/utils/generationUtils";

interface FamilyTree {
  id: string;
  name: string;
  description?: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface FamilyTreeMember {
  id: string;
  family_tree_id: string;
  person_id: string;
  role: string;
}

export default function Connections() {
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [familyTreeMembers, setFamilyTreeMembers] = useState<FamilyTreeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamilyTree, setSelectedFamilyTree] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFamilyTrees();
    fetchAllPersons();
    fetchAllConnections();
    fetchFamilyTreeMembers();
  }, []);

  const fetchFamilyTrees = async () => {
    try {
      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .order('name');

      if (error) throw error;
      setFamilyTrees(data || []);
    } catch (error) {
      console.error('Error fetching family trees:', error);
      toast({
        title: "Error",
        description: "Failed to load family trees",
        variant: "destructive",
      });
    }
  };

  const fetchAllPersons = async () => {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .order('name');

      if (error) throw error;
      setPersons(data || []);
    } catch (error) {
      console.error('Error fetching persons:', error);
      toast({
        title: "Error",
        description: "Failed to load persons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    }
  };

  const fetchFamilyTreeMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_tree_members')
        .select('*');

      if (error) throw error;
      setFamilyTreeMembers(data || []);
    } catch (error) {
      console.error('Error fetching family tree members:', error);
      toast({
        title: "Error",
        description: "Failed to load family tree members",
        variant: "destructive",
      });
    }
  };

  const handleConnectionUpdated = () => {
    fetchAllConnections();
    fetchFamilyTreeMembers();
    toast({
      title: "Success",
      description: "Connections updated successfully",
    });
  };

  // Calculate statistics
  const generationMap = persons.length > 0 && connections.length > 0 
    ? calculateGenerations(persons, connections) 
    : new Map();
  const generationStats = getGenerationStats(generationMap);
  const generationalConnections = getGenerationalConnections(connections);
  const siblingConnections = getSiblingConnections(connections);

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
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Family Connections</h1>
          <p className="text-muted-foreground">
            Manage relationships and connections across all your family trees
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TreePine className="w-5 h-5 text-coral-600" />
              Family Trees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coral-600">{familyTrees.length}</div>
            <p className="text-sm text-muted-foreground">Total trees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-sage-600" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sage-600">{persons.length}</div>
            <p className="text-sm text-muted-foreground">Total people</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-dusty-600" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dusty-600">{connections.length}</div>
            <p className="text-sm text-muted-foreground">Total relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="w-5 h-5 text-navy-600" />
              Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-600">{generationStats.totalGenerations}</div>
            <p className="text-sm text-muted-foreground">Max: {generationStats.maxGeneration}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Connections</TabsTrigger>
          <TabsTrigger value="by-tree">By Family Tree</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                All Family Connections
              </CardTitle>
              <CardDescription>
                View and manage all connections between people in your family trees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionManager 
                persons={persons}
                onConnectionUpdated={handleConnectionUpdated}
                title="All Connections"
                subtitle={`Showing all ${connections.length} connections between ${persons.length} people`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-tree" className="space-y-6">
          <div className="space-y-6">
            {familyTrees.map((tree) => {
              // Get people in this family tree for count display
              const treePersonIds = new Set();
              const treeConnections = connections.filter(conn => {
                const fromPerson = persons.find(p => p.id === conn.from_person_id);
                const toPerson = persons.find(p => p.id === conn.to_person_id);
                
                // Check if both people are in this tree
                const fromInTree = fromPerson && familyTreeMembers.some(m => 
                  m.family_tree_id === tree.id && m.person_id === fromPerson.id
                );
                const toInTree = toPerson && familyTreeMembers.some(m => 
                  m.family_tree_id === tree.id && m.person_id === toPerson.id
                );
                
                if (fromInTree && toInTree) {
                  treePersonIds.add(conn.from_person_id);
                  treePersonIds.add(conn.to_person_id);
                  return true;
                }
                return false;
              });

              return (
                <Card key={tree.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TreePine className="w-5 h-5" />
                        <CardTitle className="text-lg">{tree.name}</CardTitle>
                        <Badge className={getVisibilityColor(tree.visibility)}>
                          {tree.visibility}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {treeConnections.length} connections • {treePersonIds.size} people
                      </div>
                    </div>
                    {tree.description && (
                      <CardDescription>{tree.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ConnectionManager 
                      familyTreeId={tree.id}
                      persons={persons}
                      onConnectionUpdated={handleConnectionUpdated}
                      title={`${tree.name} Connections`}
                      subtitle={`${treeConnections.length} connections between ${treePersonIds.size} people`}
                    />
                  </CardContent>
                </Card>
              );
            })}

            {/* Orphaned Connections - connections between people not in any family tree */}
            {(() => {
              const orphanedConnections = connections.filter(conn => {
                const fromPerson = persons.find(p => p.id === conn.from_person_id);
                const toPerson = persons.find(p => p.id === conn.to_person_id);
                
                // Check if either person is not in any family tree
                const fromInAnyTree = fromPerson && familyTreeMembers.some(m => m.person_id === fromPerson.id);
                const toInAnyTree = toPerson && familyTreeMembers.some(m => m.person_id === toPerson.id);
                
                return !fromInAnyTree || !toInAnyTree;
              });

              if (orphanedConnections.length === 0) return null;

              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <CardTitle className="text-lg">Other Connections</CardTitle>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {orphanedConnections.length} connections
                      </div>
                    </div>
                    <CardDescription>
                      Connections between people not currently in any family tree
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConnectionManager 
                      persons={persons}
                      onConnectionUpdated={handleConnectionUpdated}
                      title="Other Connections"
                      subtitle={`${orphanedConnections.length} connections between people not in any family tree`}
                    />
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Generational Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(generationalConnections.entries()).map(([generation, count]) => (
                    <div key={generation} className="flex justify-between items-center">
                      <span className="text-sm">Generation {generation}</span>
                      <Badge variant="outline">{count} connections</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Sibling Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sage-600">{siblingConnections.length}</div>
                <p className="text-sm text-muted-foreground">Sibling relationships</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 