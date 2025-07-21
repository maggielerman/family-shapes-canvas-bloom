import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { ConnectionWithDetails } from '@/types/connection';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { Person } from '@/types/person';

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
    const relationshipAttributes = {
      biological: [
        { value: "biological", label: "Biological", description: "Genetically related" },
        { value: "adopted", label: "Adopted", description: "Legal adoption" },
        { value: "step", label: "Step", description: "Through marriage/partnership" },
        { value: "foster", label: "Foster", description: "Foster care relationship" },
      ],
      legal: [
        { value: "legal", label: "Legal", description: "Legally recognized" },
        { value: "intended", label: "Intended", description: "Intended parent in ART" },
      ],
      art: [
        { value: "ivf", label: "IVF", description: "In vitro fertilization" },
        { value: "iui", label: "IUI", description: "Intrauterine insemination" },
        { value: "donor_conceived", label: "Donor Conceived", description: "Conceived using donor gametes" },
      ],
      sibling: [
        { value: "full", label: "Full", description: "Shares both biological parents" },
        { value: "half", label: "Half", description: "Shares one biological parent" },
        { value: "donor_sibling", label: "Dibling", description: "Shares same sperm/egg donor" },
        { value: "step_sibling", label: "Step", description: "Through parent's marriage/partnership" },
      ],
      donor: [
        { value: "sperm_donor", label: "Sperm Donor", description: "Provided sperm" },
        { value: "egg_donor", label: "Egg Donor", description: "Provided eggs" },
        { value: "embryo_donor", label: "Embryo Donor", description: "Provided embryo" },
      ],
    };

    const allAttributes = Object.values(relationshipAttributes).flat();
    return attributes.map(attrValue => {
      const attribute = allAttributes.find(attr => attr.value === attrValue);
      return {
        value: attrValue,
        label: attribute?.label || attrValue,
        description: attribute?.description || ''
      };
    });
  };

  const getConnectionDisplayText = (connection: ConnectionWithDetails) => {
    const fromName = getPersonName(connection.from_person_id);
    const toName = getPersonName(connection.to_person_id);
    const relationshipLabel = getRelationshipLabel(connection.relationship_type);

    return `${fromName} → ${toName} (${relationshipLabel})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No family connections</p>
            <p className="text-xs">Connections are created in the tree view</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection) => {
              const Icon = getRelationshipIcon(connection.relationship_type);
              const attributes = (connection.metadata as any)?.attributes || [];
              const attributeInfo = getAttributeInfo(attributes);
              
              return (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
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
                    <h4 className="font-medium text-sm">
                      {getConnectionDisplayText(connection)}
                    </h4>
                    {attributeInfo.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {attributeInfo.map((attr, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {attr.label}
                          </Badge>
                        ))}
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