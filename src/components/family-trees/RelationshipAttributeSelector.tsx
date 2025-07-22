import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { RELATIONSHIP_ATTRIBUTES, RelationshipAttributeHelpers } from '@/types/relationshipAttributes';

// Use centralized relationship attributes
export const relationshipAttributes = RELATIONSHIP_ATTRIBUTES;

// Helper to get relevant attribute categories based on relationship type
export const getRelevantAttributes = (relationshipType: string) => {
  return RelationshipAttributeHelpers.getRelevantCategories(relationshipType);
};

interface RelationshipAttributeSelectorProps {
  relationshipType: string;
  selectedAttributes: string[];
  onAttributesChange: (attributes: string[]) => void;
  disabled?: boolean;
}

export function RelationshipAttributeSelector({
  relationshipType,
  selectedAttributes,
  onAttributesChange,
  disabled = false
}: RelationshipAttributeSelectorProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(['sibling', 'donor']);
  
  const relevantCategories = getRelevantAttributes(relationshipType);
  
  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const toggleAttribute = (attributeValue: string) => {
    if (disabled) return;
    
    const newAttributes = selectedAttributes.includes(attributeValue)
      ? selectedAttributes.filter(attr => attr !== attributeValue)
      : [...selectedAttributes, attributeValue];
    
    onAttributesChange(newAttributes);
  };
  
  const removeAttribute = (attributeValue: string) => {
    if (disabled) return;
    onAttributesChange(selectedAttributes.filter(attr => attr !== attributeValue));
  };
  
  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      biological: 'Biological Context',
      legal: 'Legal Context', 
      art: 'ART Context',
      sibling: 'Sibling Type',
      donor: 'Donor Type',
    };
    return titles[category] || category;
  };
  
  if (relevantCategories.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Relationship Attributes (Optional)</Label>
        {selectedAttributes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAttributesChange([])}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {/* Selected Attributes Display */}
      {selectedAttributes.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-md">
          {selectedAttributes.map(attrValue => {
            // Find the attribute definition
            const attribute = Object.values(relationshipAttributes)
              .flat()
              .find(attr => attr.value === attrValue);
            
            return (
              <Badge 
                key={attrValue}
                variant="secondary" 
                className="text-xs flex items-center gap-1"
              >
                {attribute?.label || attrValue}
                {!disabled && (
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeAttribute(attrValue)}
                  />
                )}
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Attribute Categories */}
      <div className="space-y-2">
        {relevantCategories.map(category => {
          const categoryAttributes = relationshipAttributes[category as keyof typeof relationshipAttributes];
          const isOpen = openCategories.includes(category);
          
          return (
            <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-sm font-normal"
                  disabled={disabled}
                >
                  <span>{getCategoryTitle(category)}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 pl-4">
                {categoryAttributes.map(attribute => {
                  const isSelected = selectedAttributes.includes(attribute.value);
                  
                  return (
                    <Button
                      key={attribute.value}
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs font-normal"
                      onClick={() => toggleAttribute(attribute.value)}
                      disabled={disabled}
                    >
                      <div className="text-left">
                        <div>{attribute.label}</div>
                        {attribute.description && (
                          <div className="text-xs text-muted-foreground">
                            {attribute.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}