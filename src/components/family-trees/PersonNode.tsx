import { memo, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Baby, Dna, Move } from 'lucide-react';

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
  onDrop?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onClick?: () => void;
}

const relationshipTypes = [
  { value: "parent", label: "Parent", icon: Users, color: "hsl(var(--chart-1))" },
  { value: "child", label: "Child", icon: Baby, color: "hsl(var(--chart-2))" },
  { value: "partner", label: "Partner", icon: Heart, color: "hsl(var(--chart-3))" },
  { value: "sibling", label: "Sibling", icon: Users, color: "hsl(var(--chart-4))" },
  { value: "donor", label: "Donor", icon: Dna, color: "hsl(var(--chart-5))" },
  { value: "gestational_carrier", label: "Gestational Carrier", icon: Baby, color: "hsl(var(--chart-1))" },
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
  onPositionChange,
  onClick,
}: PersonNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const getNodeColor = (gender?: string | null) => {
    switch (gender?.toLowerCase()) {
      case 'male': return "hsl(var(--chart-1))";
      case 'female': return "hsl(var(--chart-2))";
      default: return "hsl(var(--chart-3))";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
    setIsDragging(true);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - parentRect.left - dragOffset.x;
      const newY = moveEvent.clientY - parentRect.top - dragOffset.y;
      
      // Keep within bounds
      const boundedX = Math.max(40, Math.min(parentRect.width - 40, newX));
      const boundedY = Math.max(40, Math.min(parentRect.height - 40, newY));
      
      onPositionChange?.({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dragOffset, onPositionChange]);

  return (
    <div
      className={`absolute transition-all duration-200 select-none ${
        isDragged || isDragging ? 'scale-110 opacity-80 z-50' : ''
      } ${isHovered ? 'scale-105' : ''}`}
      style={{
        left: position.x - 40,
        top: position.y - 40,
        transform: isDragged ? 'rotate(5deg)' : 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={!isConnecting ? handleMouseDown : undefined}
      onClick={onClick}
    >
      {/* Main Node */}
      <div
        className={`relative w-20 h-20 rounded-full border-2 transition-all ${
          isDragged ? 'border-primary border-4' : 'border-border'
        } ${isHovered && isConnecting ? 'border-primary border-4 animate-pulse' : ''}`}
        style={{ backgroundColor: getNodeColor(person.gender) }}
        draggable={isConnecting}
        onDragStart={isConnecting ? (e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', person.id);
          onDragStart?.();
        } : undefined}
        onDragEnd={onDragEnd}
        onDragOver={isConnecting ? (e) => {
          e.preventDefault();
          onDragOver?.();
        } : undefined}
        onDragLeave={onDragLeave}
        onDrop={isConnecting ? (e) => {
          e.preventDefault();
          if (isConnecting && isHovered) {
            onDrop?.();
          }
        } : undefined}
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

      {/* Move indicator */}
      {!isConnecting && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
            <Move className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Drop zone indicator */}
      {isHovered && isConnecting && (
        <div className="absolute inset-0 rounded-full border-4 border-primary border-dashed animate-pulse bg-primary/10" />
      )}
    </div>
  );
});