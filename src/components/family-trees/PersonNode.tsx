import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Baby, Dna } from 'lucide-react';

interface PersonNodeProps {
  person: {
    id: string;
    name: string;
    gender?: string | null;
    date_of_birth?: string | null;
    profile_photo_url?: string | null;
    status: string;
  };
  position: { x: number; y: number };
  isDragged?: boolean;
  isHovered?: boolean;
  isConnecting?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: () => void;
  onDragLeave?: () => void;
  onDrop?: (relationshipType: string) => void;
}

const relationshipTypes = [
  { value: "parent", label: "Parent", icon: Users, color: "bg-blue-100 text-blue-800" },
  { value: "child", label: "Child", icon: Baby, color: "bg-green-100 text-green-800" },
  { value: "partner", label: "Partner", icon: Heart, color: "bg-pink-100 text-pink-800" },
  { value: "sibling", label: "Sibling", icon: Users, color: "bg-purple-100 text-purple-800" },
  { value: "donor", label: "Donor", icon: Dna, color: "bg-orange-100 text-orange-800" },
  { value: "half_sibling", label: "Half Sibling", icon: Users, color: "bg-indigo-100 text-indigo-800" },
];

export const PersonNode = memo(({
  person,
  position,
  isDragged = false,
  isHovered = false,
  isConnecting = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: PersonNodeProps) => {
  const getNodeColor = (gender?: string | null) => {
    switch (gender?.toLowerCase()) {
      case 'male': return "hsl(var(--primary))";
      case 'female': return "hsl(var(--secondary))";
      default: return "hsl(var(--muted))";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      className={`absolute transition-all duration-200 ${
        isDragged ? 'scale-110 opacity-80 z-50' : ''
      } ${isHovered ? 'scale-105' : ''}`}
      style={{
        left: position.x - 40,
        top: position.y - 40,
        transform: isDragged ? 'rotate(5deg)' : 'none',
      }}
    >
      {/* Main Node */}
      <div
        className={`relative w-20 h-20 rounded-full border-2 cursor-grab active:cursor-grabbing transition-all ${
          isDragged ? 'border-primary border-4' : 'border-border'
        } ${isHovered && isConnecting ? 'border-primary border-4 animate-pulse' : ''}`}
        style={{ backgroundColor: getNodeColor(person.gender) }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', person.id);
          onDragStart?.();
        }}
        onDragEnd={onDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver?.();
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          // Show relationship selector when dropping
          if (isConnecting && isHovered) {
            // For now, default to sibling - we'll improve this
            onDrop?.('sibling');
          }
        }}
      >
        {/* Profile Image or Initials */}
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          {person.profile_photo_url ? (
            <img
              src={person.profile_photo_url}
              alt={person.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {getInitials(person.name)}
            </span>
          )}
        </div>
      </div>

      {/* Name Label */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
        <div className="text-xs font-medium text-foreground max-w-20 truncate">
          {person.name}
        </div>
        {person.date_of_birth && (
          <div className="text-xs text-muted-foreground">
            {new Date(person.date_of_birth).getFullYear()}
          </div>
        )}
      </div>

      {/* Connection Options (shown when hovering during drag) */}
      {isHovered && isConnecting && (
        <Card className="absolute top-full left-1/2 transform -translate-x-1/2 mt-16 z-50 animate-fade-in">
          <CardContent className="p-2">
            <div className="text-xs font-medium mb-2">Connect as:</div>
            <div className="flex flex-col gap-1">
              {relationshipTypes.slice(0, 4).map(type => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant="ghost"
                    size="sm"
                    className="justify-start h-6 text-xs"
                    onClick={() => onDrop?.(type.value)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});