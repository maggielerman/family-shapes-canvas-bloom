import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Link2, 
  Edit, 
  Trash2, 
  Plus,
  GitBranch
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  Connection, 
  ConnectionWithDetails, 
  CreateConnectionData, 
  UpdateConnectionData,
  ConnectionUtils,
  RelationshipType
} from '@/types/connection';
import { ConnectionService } from '@/services/connectionService';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { Person } from '@/types/person';
import { RelationshipAttributeSelector } from '@/components/family-trees/RelationshipAttributeSelector';
import { RelationshipAttributeHelpers } from '@/types/relationshipAttributes';

interface ConnectionManagerProps {
  // Family tree context
  familyTreeId?: string;
  // Person context (for person-specific connections)
  personId?: string;
  // Available persons for selection
  persons: Person[];
  // Callback when connections are updated
  onConnectionUpdated: () => void;
  // Optional title override
  title?: string;
  // Optional subtitle
  subtitle?: string;
}

export function ConnectionManager({
  familyTreeId,
  personId,
  persons,
  onConnectionUpdated,
  title = "Connection Management",
  subtitle
}: ConnectionManagerProps) {
  const { toast } = useToast();
  const [connections, setConnections] = useState<ConnectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ConnectionWithDetails | null>(null);
  const [newConnection, setNewConnection] = useState<CreateConnectionData>({
    from_person_id: personId || '',
    to_person_id: '',
    relationship_type: '',
    family_tree_id: familyTreeId || null
  });
  const [newConnectionAttributes, setNewConnectionAttributes] = useState<string[]>([]);
  const [editingConnectionAttributes, setEditingConnectionAttributes] = useState<string[]>([]);

  const relationshipTypes = RelationshipTypeHelpers.getForSelection();

  useEffect(() => {
    fetchConnections();
  }, [familyTreeId, personId]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      let fetchedConnections: ConnectionWithDetails[];

      if (personId) {
        // Get connections for a specific person
        fetchedConnections = await ConnectionService.getConnectionsForPerson(personId);
      } else if (familyTreeId) {
        // Get connections for a family tree
        const treeConnections = await ConnectionService.getConnectionsForFamilyTree(familyTreeId);
        fetchedConnections = treeConnections.map(conn => ({
          ...conn,
          direction: 'outgoing' as const,
          other_person_name: getPersonName(conn.to_person_id),
          other_person_id: conn.to_person_id
        }));
      } else {
        fetchedConnections = [];
      }

      setConnections(fetchedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPersonName = (personId: string) => {
    return persons.find(p => p.id === personId)?.name || 'Unknown';
  };

  const getRelationshipIcon = (type: string) => {
    return RelationshipTypeHelpers.getIcon(type as RelationshipType);
  };

  const getRelationshipColor = (type: string) => {
    return RelationshipTypeHelpers.getColor(type as RelationshipType);
  };

  const getRelationshipLabel = (type: string) => {
    return RelationshipTypeHelpers.getLabel(type as RelationshipType);
  };

  const handleCreateConnection = async () => {
    // Validate required fields
    if (!newConnection.from_person_id || !newConnection.to_person_id || !newConnection.relationship_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate that persons are different
    if (newConnection.from_person_id === newConnection.to_person_id) {
      toast({
        title: "Error",
        description: "A person cannot have a relationship with themselves",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if connection already exists
      const exists = await ConnectionService.connectionExists(
        newConnection.from_person_id,
        newConnection.to_person_id,
        newConnection.relationship_type as RelationshipType,
        familyTreeId
      );

      if (exists) {
        toast({
          title: "Connection Already Exists",
          description: "This relationship already exists between these people",
          variant: "destructive",
        });
        return;
      }

      // Create connection with reciprocal and attributes
      const connectionWithAttributes = {
        ...newConnection,
        metadata: {
          attributes: newConnectionAttributes
        }
      };
      await ConnectionService.createConnectionWithReciprocal(connectionWithAttributes);

      toast({
        title: "Success",
        description: "Connection created successfully",
      });

      // Reset form
      setNewConnection({
        from_person_id: personId || '',
        to_person_id: '',
        relationship_type: '',
        family_tree_id: familyTreeId || null
      });
      setNewConnectionAttributes([]);
      setIsAddingConnection(false);
      
      // Refresh connections
      fetchConnections();
      onConnectionUpdated();
    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create connection",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConnection = async () => {
    if (!editingConnection) return;

    try {
      const updateData: UpdateConnectionData = {
        id: editingConnection.id,
        relationship_type: editingConnection.relationship_type,
        family_tree_id: editingConnection.family_tree_id,
        group_id: editingConnection.group_id,
        organization_id: editingConnection.organization_id,
        notes: editingConnection.notes,
        metadata: {
          attributes: editingConnectionAttributes
        } as any
      };

      await ConnectionService.updateConnectionWithReciprocal(updateData);

      toast({
        title: "Success",
        description: "Connection updated successfully",
      });

      setEditingConnection(null);
      fetchConnections();
      onConnectionUpdated();
    } catch (error) {
      console.error('Error updating connection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update connection",
        variant: "destructive",
      });
    }
  };

  const handleEditConnection = (connection: ConnectionWithDetails) => {
    setEditingConnection(connection);
    // Extract attributes from metadata
    const attributes = (connection.metadata as any)?.attributes || [];
    setEditingConnectionAttributes(attributes);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this connection? This will also remove any reciprocal relationships.")) {
      return;
    }

    try {
      await ConnectionService.deleteConnectionWithReciprocal(connectionId);

      toast({
        title: "Success",
        description: "Connection deleted successfully",
      });

      fetchConnections();
      onConnectionUpdated();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete connection",
        variant: "destructive",
      });
    }
  };

  const getConnectionDisplayText = (connection: ConnectionWithDetails) => {
    const fromName = getPersonName(connection.from_person_id);
    const toName = getPersonName(connection.to_person_id);
    const relationshipLabel = getRelationshipLabel(connection.relationship_type);

    if (ConnectionUtils.isBidirectional(connection.relationship_type as RelationshipType)) {
      return `${fromName} ↔ ${toName} (${relationshipLabel})`;
    }

    return `${fromName} → ${toName} (${relationshipLabel})`;
  };

  const getAttributeInfo = (attributes: string[]) => {
    return RelationshipAttributeHelpers.getAttributeInfo(attributes);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Loading connections...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Dialog open={isAddingConnection} onOpenChange={setIsAddingConnection}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Connection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Connection</DialogTitle>
                <DialogDescription>
                  Define a relationship between two family members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {!personId && (
                  <div>
                    <label className="text-sm font-medium">From Person</label>
                    <Select
                      value={newConnection.from_person_id}
                      onValueChange={(value) => setNewConnection(prev => ({ ...prev, from_person_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {persons.map(person => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">To Person</label>
                  <Select
                    value={newConnection.to_person_id}
                    onValueChange={(value) => setNewConnection(prev => ({ ...prev, to_person_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons
                        .filter(person => person.id !== newConnection.from_person_id)
                        .map(person => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Relationship Type</label>
                  <Select
                    value={newConnection.relationship_type}
                    onValueChange={(value) => setNewConnection(prev => ({ ...prev, relationship_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Relationship Attributes */}
                {newConnection.relationship_type && (
                  <RelationshipAttributeSelector
                    relationshipType={newConnection.relationship_type}
                    selectedAttributes={newConnectionAttributes}
                    onAttributesChange={setNewConnectionAttributes}
                  />
                )}
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateConnection}>Create Connection</Button>
                  <Button variant="outline" onClick={() => setIsAddingConnection(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No connections yet. Add people to start creating relationships.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relationship</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map(connection => {
                const Icon = getRelationshipIcon(connection.relationship_type);
                return (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="flex items-center gap-1 w-fit"
                          style={{ 
                            backgroundColor: `${getRelationshipColor(connection.relationship_type)}20`,
                            color: getRelationshipColor(connection.relationship_type)
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {getRelationshipLabel(connection.relationship_type)}
                          {connection.direction === 'incoming' && (
                            <span className="text-xs opacity-70">(incoming)</span>
                          )}
                        </Badge>
                        {(() => {
                          const attributes = (connection.metadata as any)?.attributes || [];
                          if (attributes.length > 0) {
                            return (
                              <Badge 
                                variant="outline" 
                                className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {attributes.length} attr{attributes.length !== 1 ? 's' : ''}
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getConnectionDisplayText(connection)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const attributes = (connection.metadata as any)?.attributes || [];
                        const attributeInfo = getAttributeInfo(attributes);
                        
                        if (attributeInfo.length === 0) {
                          return (
                            <span className="text-sm text-muted-foreground">No attributes</span>
                          );
                        }
                        
                        return (
                          <div className="flex flex-wrap gap-1">
                            {attributeInfo.map((attr, index) => (
                              <TooltipProvider key={index}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs cursor-help"
                                    >
                                      {attr.label}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{attr.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog 
                          open={editingConnection?.id === connection.id} 
                          onOpenChange={(open) => !open && setEditingConnection(null)}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditConnection(connection)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Connection</DialogTitle>
                              <DialogDescription>
                                Change the relationship type between {getPersonName(connection.from_person_id)} and {getPersonName(connection.to_person_id)}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Relationship Type</label>
                                <Select
                                  value={editingConnection?.relationship_type || ''}
                                  onValueChange={(value) => setEditingConnection(prev => 
                                    prev ? { ...prev, relationship_type: value } : null
                                  )}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {relationshipTypes.map(type => {
                                      const Icon = type.icon;
                                      return (
                                        <SelectItem key={type.value} value={type.value}>
                                          <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {type.label}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Relationship Attributes */}
                              {editingConnection?.relationship_type && (
                                <RelationshipAttributeSelector
                                  relationshipType={editingConnection.relationship_type}
                                  selectedAttributes={editingConnectionAttributes}
                                  onAttributesChange={setEditingConnectionAttributes}
                                />
                              )}
                              
                              <div className="flex gap-2">
                                <Button onClick={handleUpdateConnection}>Update</Button>
                                <Button variant="outline" onClick={() => setEditingConnection(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteConnection(connection.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 