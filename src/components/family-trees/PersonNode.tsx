import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, calculateAge } from '@/utils/dateUtils';
import { Person, PersonUtils } from '@/types/person';

export const PersonNode = memo(({ data }: NodeProps) => {
  const person = data.person as Person;
  const age = person.date_of_birth ? calculateAge(person.date_of_birth) : null;
  const initials = PersonUtils.getInitials(person);

  return (
    <Card className="w-48 shadow-lg border-2 hover:border-primary/50 transition-colors">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <CardContent className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={person.profile_photo_url || undefined} />
            <AvatarFallback className="text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">
              {person.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {person.date_of_birth && (
                <span>
                  {formatDateShort(person.date_of_birth)}
                  {age && ` (${age})`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {person.gender && (
            <Badge variant="secondary" className="text-xs">
              {person.gender}
            </Badge>
          )}
          
          {PersonUtils.isDonor(person) && (
            <Badge variant="outline" className="text-xs">
              Donor
            </Badge>
          )}
          
          {person.used_ivf && (
            <Badge variant="outline" className="text-xs">
              IVF
            </Badge>
          )}
          
          {person.used_iui && (
            <Badge variant="outline" className="text-xs">
              IUI
            </Badge>
          )}
          
          {person.status && person.status !== 'active' && (
            <Badge variant="destructive" className="text-xs">
              {person.status}
            </Badge>
          )}
        </div>

        {person.birth_place && (
          <div className="text-xs text-muted-foreground mt-2 truncate">
            📍 {person.birth_place}
          </div>
        )}
      </CardContent>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

PersonNode.displayName = 'PersonNode';