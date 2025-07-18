import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, Baby, Dna } from 'lucide-react';

interface RelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromPersonName: string;
  toPersonName: string;
  onConfirm: (relationshipType: string) => void;
}

const relationshipTypes = [
  { value: "parent", label: "Parent", icon: Users, color: "hsl(var(--chart-1))", description: "Parent-child relationship" },
  { value: "child", label: "Child", icon: Baby, color: "hsl(var(--chart-2))", description: "Child-parent relationship" },
  { value: "partner", label: "Partner/Spouse", icon: Heart, color: "hsl(var(--chart-3))", description: "Romantic partnership or marriage" },
  { value: "sibling", label: "Sibling", icon: Users, color: "hsl(var(--chart-4))", description: "Sibling relationship (full, half, step, etc.)" },
  { value: "donor", label: "Donor", icon: Dna, color: "hsl(var(--chart-5))", description: "Genetic donor (sperm, egg, embryo)" },
  { value: "gestational_carrier", label: "Gestational Carrier", icon: Baby, color: "hsl(var(--chart-1))", description: "Surrogate or gestational carrier" },
];

export function RelationshipDialog({
  open,
  onOpenChange,
  fromPersonName,
  toPersonName,
  onConfirm,
}: RelationshipDialogProps) {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleConfirm = () => {
    if (selectedType) {
      onConfirm(selectedType);
      onOpenChange(false);
      setSelectedType('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Define Relationship</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            How is <span className="font-medium text-foreground">{fromPersonName}</span> related to{' '}
            <span className="font-medium text-foreground">{toPersonName}</span>?
          </div>
          
          <div className="grid gap-2">
            {relationshipTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted ${
                    selectedType === type.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                  {selectedType === type.value && (
                    <Badge variant="default" className="ml-auto">Selected</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedType}>
            Create Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}