import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Move,
  Link2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  family_tree_id?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  x?: number;
  y?: number;
}

type EditMode = 'view' | 'move' | 'connect' | 'edit' | 'delete';

interface EnhancedPersonNodeProps {
  person: Person;
  position: { x: number; y: number };
  editMode: EditMode;
  isSelected?: boolean;
  isExpanded?: boolean;
  isPendingConnection?: boolean;
  onClick: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onUpdate: () => void;
}

export const EnhancedPersonNode = memo(({
  person,
  position,
  editMode,
  isSelected = false,
  isExpanded = false,
  isPendingConnection = false,
  onClick,
  onPositionChange,
  onUpdate
}: EnhancedPersonNodeProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editData, setEditData] = useState({
    name: person.name,
    email: person.email || '',
    phone: person.phone || '',
    date_of_birth: person.date_of_birth || '',
    gender: person.gender || '',
    notes: person.notes || ''
  });

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
    if (editMode !== 'move' || e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    
    setIsDragging(true);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - parentRect.left - offsetX;
      const newY = moveEvent.clientY - parentRect.top - offsetY;
      
      const boundedX = Math.max(40, Math.min(parentRect.width - 40, newX));
      const boundedY = Math.max(40, Math.min(parentRect.height - 40, newY));
      
      onPositionChange({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editMode, onPositionChange]);

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('persons')
        .update({
          name: editData.name,
          email: editData.email || null,
          phone: editData.phone || null,
          date_of_birth: editData.date_of_birth || null,
          gender: editData.gender || null,
          notes: editData.notes || null
        })
        .eq('id', person.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Person updated successfully",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating person:', error);
      toast({
        title: "Error",
        description: "Failed to update person",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: person.name,
      email: person.email || '',
      phone: person.phone || '',
      date_of_birth: person.date_of_birth || '',
      gender: person.gender || '',
      notes: person.notes || ''
    });
    setIsEditing(false);
  };

  // Calculate dynamic positioning
  const nodeSize = isExpanded ? 200 : 80;
  const nodeStyle = {
    left: position.x - (nodeSize / 2),
    top: position.y - (nodeSize / 2),
    width: nodeSize,
    height: isExpanded ? 'auto' : nodeSize,
    cursor: editMode === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
    zIndex: isExpanded ? 50 : (isSelected ? 40 : 30),
  };

  return (
    <div
      className={`absolute transition-all duration-300 select-none ${
        isDragging ? 'scale-110 opacity-80' : ''
      } ${isSelected ? 'scale-105' : ''} ${
        isPendingConnection ? 'ring-2 ring-primary animate-pulse' : ''
      }`}
      style={nodeStyle}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging && editMode !== 'move') {
          onClick();
        }
      }}
    >
      {isExpanded ? (
        /* Expanded Card View */
        <Card className="w-full shadow-lg border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center"
                  style={{ backgroundColor: getNodeColor(person.gender) }}
                >
                  {person.profile_photo_url ? (
                    <img
                      src={person.profile_photo_url}
                      alt={person.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {getInitials(person.name)}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-sm">{person.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {person.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                {editMode === 'edit' && !isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                {editMode === 'move' && (
                  <div className="text-muted-foreground">
                    <Move className="w-3 h-3" />
                  </div>
                )}
                {editMode === 'connect' && (
                  <div className="text-primary">
                    <Link2 className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              /* Edit Form */
              <div className="space-y-3">
                <Input
                  placeholder="Name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Phone"
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Input
                  placeholder="Birth Date"
                  type="date"
                  value={editData.date_of_birth}
                  onChange={(e) => setEditData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
                <Select
                  value={editData.gender}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Notes"
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* View Details */
              <div className="space-y-2 text-xs">
                {person.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span>{person.phone}</span>
                  </div>
                )}
                {person.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span>{(() => {
                      // Parse the date string and create a date object in local timezone
                      // to avoid timezone conversion issues
                      const [year, month, day] = person.date_of_birth.split('-').map(Number);
                      const date = new Date(year, month - 1, day); // month is 0-indexed
                      return date.toLocaleDateString();
                    })()}</span>
                  </div>
                )}
                {person.gender && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="capitalize">{person.gender}</span>
                  </div>
                )}
                {person.notes && (
                  <div className="text-muted-foreground text-xs mt-2 p-2 bg-muted rounded">
                    {person.notes}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Compact Node View */
        <div
          className={`w-full h-full rounded-full border-2 transition-all ${
            isSelected ? 'border-primary border-4' : 'border-border'
          } ${editMode === 'connect' && isPendingConnection ? 'border-primary border-4 animate-pulse' : ''}
          ${editMode === 'delete' ? 'border-destructive border-4' : ''}`}
          style={{ backgroundColor: getNodeColor(person.gender) }}
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

          {/* Name Label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
            <div className="text-xs font-medium text-foreground max-w-20 truncate">
              {person.name}
            </div>
            {person.date_of_birth && (
              <div className="text-xs text-muted-foreground">
                {(() => {
                  // Parse the date string and create a date object in local timezone
                  // to avoid timezone conversion issues
                  const [year, month, day] = person.date_of_birth.split('-').map(Number);
                  const date = new Date(year, month - 1, day); // month is 0-indexed
                  return date.getFullYear();
                })()}
              </div>
            )}
          </div>

          {/* Mode Indicators */}
          {editMode === 'move' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Move className="w-3 h-3" />
            </div>
          )}
          {editMode === 'connect' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <Link2 className="w-3 h-3" />
            </div>
          )}
          {editMode === 'edit' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center">
              <Edit className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );
});