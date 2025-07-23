import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Eye,
  Share2,
  Info,
  Heart,
  Lock,
  Globe
} from "lucide-react";

import { RelationshipTypeHelpers } from "@/types/relationshipTypes";
import { ForceDirectedLayout } from "./layouts/ForceDirectedLayout";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PublicFamilyTree {
  id: string;
  name: string;
  description?: string | null;
  visibility: string;
  created_at: string;
  user_id: string;
}

interface PublicPerson {
  id: string;
  name: string;
  date_of_birth?: string | null;
  birth_place?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

interface PublicConnection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
}

interface PublicFamilyTreeViewerProps {
  treeId?: string;
  isPublicLink?: boolean;
  accessToken?: string;
}

export function PublicFamilyTreeViewer({ 
  treeId, 
  isPublicLink = false, 
  accessToken 
}: PublicFamilyTreeViewerProps) {
  const params = useParams();
  const { toast } = useToast();
  
  const familyTreeId = treeId || params.id;
  const [familyTree, setFamilyTree] = useState<PublicFamilyTree | null>(null);
  const [persons, setPersons] = useState<PublicPerson[]>([]);
  const [connections, setConnections] = useState<PublicConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Use centralized relationship types
  const relationshipTypes = RelationshipTypeHelpers.getForSelection();

  useEffect(() => {
    if (familyTreeId) {
      checkAccess();
    }
  }, [familyTreeId, accessToken]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      
      if (isPublicLink && accessToken) {
        // Validate sharing link access
        const { data: linkData, error: linkError } = await supabase
          .from('sharing_links')
          .select('*')
          .eq('link_token', accessToken)
          .eq('is_active', true)
          .single();

        if (linkError || !linkData) {
          throw new Error('Invalid or expired sharing link');
        }

        // Check if link has expired
        if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
          throw new Error('This sharing link has expired');
        }

        // Check usage limits
        if (linkData.max_uses && linkData.current_uses >= linkData.max_uses) {
          throw new Error('This sharing link has reached its usage limit');
        }

        // Increment usage count
        await supabase
          .from('sharing_links')
          .update({ current_uses: (linkData.current_uses || 0) + 1 })
          .eq('id', linkData.id);

        setHasAccess(true);
        await fetchPublicTreeData();
      } else {
        // Check if tree is publicly visible
        const { data: treeData, error: treeError } = await supabase
          .from('family_trees')
          .select('*')
          .eq('id', familyTreeId)
          .eq('visibility', 'public')
          .single();

        if (treeError || !treeData) {
          throw new Error('Family tree not found or not publicly accessible');
        }

        setHasAccess(true);
        await fetchPublicTreeData();
      }
    } catch (error: any) {
      console.error('Access check failed:', error);
      toast({
        title: "Access Denied",
        description: (error instanceof Error ? error.message : String(error)) || "You don't have permission to view this family tree",
        variant: "destructive",
      });
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicTreeData = async () => {
    try {
      // Fetch family tree details
      const { data: treeData, error: treeError } = await supabase
        .from('family_trees')
        .select('*')
        .eq('id', familyTreeId)
        .single();

      if (treeError) throw treeError;
      setFamilyTree(treeData);

      // Fetch family tree members via junction table
      const { data: membersData, error: membersError } = await supabase
        .from('family_tree_members')
        .select(`
          person:persons(
            id,
            name,
            date_of_birth,
            birth_place,
            gender,
            profile_photo_url,
            status,
            notes
          )
        `)
        .eq('family_tree_id', familyTreeId);

      if (membersError) throw membersError;
      setPersons((membersData || []).map(member => member.person));

      // Get person IDs who are members of this family tree
      const personIds = (membersData || []).map(member => member.person.id);

      // Fetch connections between people who are members of this tree
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .in('from_person_id', personIds)
        .in('to_person_id', personIds);

      if (connectionsError) throw connectionsError;
      setConnections(connectionsData || []);

    } catch (error) {
      console.error('Error fetching public tree data:', error);
      toast({
        title: "Error",
        description: "Failed to load family tree data",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      // Parse the date string and create a date object in local timezone
      // to avoid timezone conversion issues
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess || !familyTree) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This family tree is private or the sharing link is invalid.
            </p>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                If you believe you should have access to this family tree, please contact the owner for a valid sharing link.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <div className="border-b bg-card/50 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{familyTree.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  <span>Public Family Tree</span>
                  <Badge variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Read Only
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share This Tree
            </Button>
          </div>
          {familyTree.description && (
            <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
              {familyTree.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="tree" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tree">Family Tree</TabsTrigger>
            <TabsTrigger value="people">Family Members ({persons.length})</TabsTrigger>
            <TabsTrigger value="about">About This Tree</TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Interactive Family Tree
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-1 mb-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This is a read-only view. You can explore the family relationships but cannot make changes.
                    </AlertDescription>
                  </Alert>
                </div>
                <ForceDirectedLayout
                  persons={persons as any[]}
                  connections={connections as any[]}
                  relationshipTypes={relationshipTypes}
                  width={800}
                  height={600}
                  onPersonClick={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="people" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {persons.map((person) => (
                <Card key={person.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {person.profile_photo_url ? (
                        <img
                          src={person.profile_photo_url}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{person.name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {person.date_of_birth && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(person.date_of_birth)}</span>
                            </div>
                          )}
                          {person.birth_place && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{person.birth_place}</span>
                            </div>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {person.status || 'living'}
                          </Badge>
                        </div>
                        {person.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {person.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Family Tree</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Tree Name</label>
                    <p className="text-sm">{familyTree.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{formatDate(familyTree.created_at)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Family Members</label>
                    <p className="text-sm">{persons.length} people</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Relationships</label>
                    <p className="text-sm">{connections.length} connections</p>
                  </div>
                </div>
                
                {familyTree.description && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm whitespace-pre-wrap">{familyTree.description}</p>
                  </div>
                )}

                <Alert>
                  <Heart className="h-4 w-4" />
                  <AlertDescription>
                    This family tree was created with Family Shapes - a platform for visualizing and sharing family connections.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}