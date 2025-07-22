import { Edit, Mail, Phone, Calendar, UserCircle, Trash2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateShort, calculateAge } from "@/utils/dateUtils";

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  is_self?: boolean;
}

interface PersonCardProps {
  person: Person;
  onEdit?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  onRemoveFromTree?: (person: Person) => void;
  onClick?: () => void;
  showActions?: boolean;
  showRemoveFromTree?: boolean;
}

export function PersonCard({ 
  person, 
  onEdit, 
  onDelete, 
  onRemoveFromTree, 
  onClick,
  showActions = false,
  showRemoveFromTree = false 
}: PersonCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return formatDateShort(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'living':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deceased':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const calculateAgeLocal = (birthDate: string) => {
    const age = calculateAge(birthDate);
    return age !== null ? age : 'Unknown';
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={person.profile_photo_url || ""} />
              <AvatarFallback>
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{person.name}</h3>
              {person.date_of_birth && (
                <p className="text-sm text-muted-foreground">
                  Age {calculateAgeLocal(person.date_of_birth)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 flex-shrink-0">
            <div className="flex flex-wrap gap-1 justify-end">
              <Badge className={`${getStatusColor(person.status)} text-xs`}>
                {person.status}
              </Badge>
              {person.is_self && (
                <Badge variant="default" className="bg-[hsl(9,67%,49%)] text-white border-[hsl(9,67%,49%)] text-xs">
                  Self
                </Badge>
              )}
            </div>
            {(showActions || onEdit || onDelete || showRemoveFromTree) && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(person);
                    }}
                    title="Edit person"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {showRemoveFromTree && onRemoveFromTree && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromTree(person);
                    }}
                    title="Remove from this tree"
                    className="text-amber-600 hover:text-amber-700 h-8 w-8 p-0"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
                {showActions && onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(person);
                    }}
                    title="Delete person permanently"
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {person.date_of_birth && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Born {formatDate(person.date_of_birth)}</span>
          </div>
        )}
        
        {person.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{person.email}</span>
          </div>
        )}
        
        {person.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{person.phone}</span>
          </div>
        )}
        
        {person.gender && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}</span>
          </div>
        )}
        
        {person.notes && (
          <div className="text-sm text-muted-foreground border-t pt-3">
            <p className="line-clamp-3 break-words">{person.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}