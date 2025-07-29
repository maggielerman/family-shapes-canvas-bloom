import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { ConnectionWithDetails, ConnectionUtils } from '@/types/connection';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { Person } from '@/types/person';
import { RelationshipAttributeHelpers } from '@/types/relationshipAttributes';

interface ConnectionDisplayProps {
  connections: ConnectionWithDetails[];
  persons: Person[];
  title?: string;
  subtitle?: string;
}

export function ConnectionDisplay({ 
  connections, 
  persons, 
  title = "Connections",
  subtitle 
}: ConnectionDisplayProps) {
  const getPersonName = (personId: string) => {
    return persons.find(p => p.id === personId)?.name || 'Unknown';
  };

  const getRelationshipIcon = (type: string) => {
    return RelationshipTypeHelpers.getIcon(type as any);
  };

  const getRelationshipColor = (type: string) => {
    return RelationshipTypeHelpers.getColor(type as any);
  };

  const getRelationshipLabel = (type: string) => {
    return RelationshipTypeHelpers.getLabel(type as any);
  };

  const getAttributeInfo = (attributes: string[]) => {
    return RelationshipAttributeHelpers.getAttributeInfo(attributes);
  };

  const getConnectionDisplayText = (connection: ConnectionWithDetails) => {
    const fromName = getPersonName(connection.from_person_id);
    const toName = getPersonName(connection.to_person_id);
    const relationshipLabel = getRelationshipLabel(connection.relationship_type);

    // Use bidirectional arrow for bidirectional relationships
    if (ConnectionUtils.isBidirectional(connection.relationship_type as any)) {
      return `${fromName} ↔ ${toName} (${relationshipLabel})`;
    }

    return `${fromName} → ${toName} (${relationshipLabel})`;
  };

  // Deduplicate connections to show only one entry for bidirectional relationships
  const deduplicatedConnections = ConnectionUtils.deduplicate(connections);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Users className="h-4 w-4 md:h-5 md:w-5" />
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        {deduplicatedConnections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm md:text-base">No family connections</p>
            <p className="text-xs md:text-sm">Connections are created in the tree view</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deduplicatedConnections.map((connection) => {
              const Icon = getRelationshipIcon(connection.relationship_type);
              const attributes = (connection.metadata as any)?.attributes || [];
              const attributeInfo = getAttributeInfo(attributes);
              
              return (
                <div key={connection.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 border rounded-lg gap-2 md:gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1 w-fit text-xs"
                        style={{ 
                          backgroundColor: `${getRelationshipColor(connection.relationship_type)}20`,
                          color: getRelationshipColor(connection.relationship_type)
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden md:inline">{getRelationshipLabel(connection.relationship_type)}</span>
                        <span className="md:hidden">{getRelationshipLabel(connection.relationship_type).split(' ')[0]}</span>
                      </Badge>
                      {attributes.length > 0 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {attributes.length} attr{attributes.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm md:text-base">
                      <div className="max-w-[250px] md:max-w-none">
                        {getConnectionDisplayText(connection)}
                      </div>
                    </h4>
                    {attributeInfo.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {attributeInfo.slice(0, 3).map((attr, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {attr.label}
                          </Badge>
                        ))}
                        {attributeInfo.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{attributeInfo.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 