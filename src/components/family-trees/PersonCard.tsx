import { Edit, Mail, Phone, Calendar, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
}

interface PersonCardProps {
  person: Person;
  onEdit?: (person: Person) => void;
}

export function PersonCard({ person, onEdit }: PersonCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={person.profile_photo_url || ""} />
              <AvatarFallback>
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{person.name}</h3>
              {person.date_of_birth && (
                <p className="text-sm text-muted-foreground">
                  Age {calculateAge(person.date_of_birth)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(person.status)}>
              {person.status}
            </Badge>
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(person)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {person.date_of_birth && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Born {formatDate(person.date_of_birth)}
          </div>
        )}
        
        {person.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            {person.email}
          </div>
        )}
        
        {person.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {person.phone}
          </div>
        )}
        
        {person.gender && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="w-4 h-4" />
            {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
          </div>
        )}
        
        {person.notes && (
          <div className="text-sm text-muted-foreground border-t pt-3">
            <p className="line-clamp-2">{person.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}