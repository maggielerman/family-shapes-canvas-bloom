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
import { Connection, ConnectionUtils } from "@/types/connection";
import { ConnectionService } from "@/services/connectionService";
import { PersonService } from "@/services/personService";
import { RelationshipTypeHelpers } from "@/types/relationshipTypes";

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
      setPersons((data || []) as Person[]);
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Family Connections</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage relationships and connections across all your family trees
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <TreePine className="w-4 h-4 sm:w-5 sm:h-5 text-coral-600" />
              <span className="hidden sm:inline">Family Trees</span>
              <span className="sm:hidden">Trees</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-coral-600">{familyTrees.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total trees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sage-600" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sage-600">{persons.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total people</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-dusty-600" />
              <span className="hidden sm:inline">Connections</span>
              <span className="sm:hidden">Links</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-dusty-600">{connections.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total relationships</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm py-2">All</TabsTrigger>
          <TabsTrigger value="by-tree" className="text-xs sm:text-sm py-2">By Tree</TabsTrigger>
          <TabsTrigger value="by-person" className="text-xs sm:text-sm py-2">By Person</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">All Family Connections</span>
                <span className="sm:hidden">All Connections</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                <span className="hidden sm:inline">View and manage all connections between people in your family trees</span>
                <span className="sm:hidden">Manage all family connections</span>
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

        <TabsContent value="by-tree" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <TreePine className="w-4 h-4 sm:w-5 sm:h-5" />
                        <CardTitle className="text-base sm:text-lg">{tree.name}</CardTitle>
                        <Badge className={`text-xs ${getVisibilityColor(tree.visibility)}`}>
                          {tree.visibility}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {treeConnections.length} connections • {treePersonIds.size} people
                      </div>
                    </div>
                    {tree.description && (
                      <CardDescription className="text-sm">{tree.description}</CardDescription>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        <CardTitle className="text-base sm:text-lg">Other Connections</CardTitle>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {orphanedConnections.length} connections
                      </div>
                    </div>
                    <CardDescription className="text-sm">
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

        <TabsContent value="by-person" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            {persons.map((person) => {
              // Get connections where this person is either the from or to person
              const personConnections = connections.filter(conn => 
                conn.from_person_id === person.id || conn.to_person_id === person.id
              );

              // Deduplicate bidirectional connections to avoid showing both directions
              const deduplicatedPersonConnections = ConnectionUtils.deduplicate(personConnections);

              // Get the other person in each connection
              const personConnectionsWithDetails = deduplicatedPersonConnections.map(conn => {
                const otherPersonId = conn.from_person_id === person.id 
                  ? conn.to_person_id 
                  : conn.from_person_id;
                const otherPerson = persons.find(p => p.id === otherPersonId);
                const isFromPerson = conn.from_person_id === person.id;
                
                return {
                  connection: conn,
                  otherPerson,
                  isFromPerson
                };
              });

              // Group connections by family tree
              const connectionsByTree = new Map<string, typeof personConnectionsWithDetails>();
              
              personConnectionsWithDetails.forEach(({ connection, otherPerson, isFromPerson }) => {
                if (!otherPerson) return;
                
                // Find which family trees this person and the other person share
                const personTreeIds = new Set(
                  familyTreeMembers
                    .filter(m => m.person_id === person.id)
                    .map(m => m.family_tree_id)
                );
                
                const otherPersonTreeIds = new Set(
                  familyTreeMembers
                    .filter(m => m.person_id === otherPerson.id)
                    .map(m => m.family_tree_id)
                );
                
                // Find shared trees
                const sharedTreeIds = Array.from(personTreeIds).filter(id => otherPersonTreeIds.has(id));
                
                if (sharedTreeIds.length > 0) {
                  // Add to each shared tree
                  sharedTreeIds.forEach(treeId => {
                    if (!connectionsByTree.has(treeId)) {
                      connectionsByTree.set(treeId, []);
                    }
                    connectionsByTree.get(treeId)!.push({ connection, otherPerson, isFromPerson });
                  });
                } else {
                  // No shared trees - add to "Other" category
                  if (!connectionsByTree.has('other')) {
                    connectionsByTree.set('other', []);
                  }
                  connectionsByTree.get('other')!.push({ connection, otherPerson, isFromPerson });
                }
              });

              return (
                <Card key={person.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sage-100 rounded-full flex items-center justify-center">
                          <span className="text-sage-700 font-semibold text-sm sm:text-base">
                            {person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">{person.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {deduplicatedPersonConnections.length} connection{deduplicatedPersonConnections.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {person.email && <div>{person.email}</div>}
                        {person.date_of_birth && (
                          <div>Born: {new Date(person.date_of_birth).getFullYear()}</div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {deduplicatedPersonConnections.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">No connections found for this person</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.from(connectionsByTree.entries()).map(([treeId, treeConnections]) => {
                          const tree = treeId !== 'other' 
                            ? familyTrees.find(t => t.id === treeId)
                            : null;
                          
                          return (
                            <div key={treeId} className="space-y-2">
                              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                                {tree ? (
                                  <>
                                    <TreePine className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {tree.name}
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Other Connections
                                  </>
                                )}
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {treeConnections.length} connection{treeConnections.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              
                              <div className="grid gap-2">
                                {treeConnections.map(({ connection, otherPerson, isFromPerson }) => (
                                  <div key={connection.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-dusty-100 rounded-full flex items-center justify-center">
                                        <span className="text-dusty-700 text-xs sm:text-sm font-medium">
                                          {otherPerson?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="font-medium text-sm sm:text-base">{otherPerson?.name}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                          {(() => {
                                            const relationshipLabel = RelationshipTypeHelpers.getLabel(connection.relationship_type as any);
                                            if (ConnectionUtils.isBidirectional(connection.relationship_type as any)) {
                                              return `↔ ${relationshipLabel}`;
                                            }
                                            return `${isFromPerson ? '→' : '←'} ${relationshipLabel}`;
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs w-fit">
                                      {RelationshipTypeHelpers.getLabel(connection.relationship_type as any)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 