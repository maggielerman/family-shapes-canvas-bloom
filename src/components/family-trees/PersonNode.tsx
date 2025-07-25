import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, calculateAge } from '@/utils/dateUtils';
import { Person, PersonUtils } from '@/types/person';

interface PersonNodeData {
  person: Person;
  generationColor?: string;
  generation?: number;
}

export const PersonNode = memo(({ data }: NodeProps<PersonNodeData>) => {
  const person = data.person as Person;
  const generationColor = data.generationColor;
  const generation = data.generation;
  const age = person.date_of_birth ? calculateAge(person.date_of_birth) : null;
  const initials = PersonUtils.getInitials(person);

  return (
    <Card 
      className="w-56 shadow-lg border-2 hover:border-primary/50 transition-colors"
      style={{
        borderColor: generationColor || 'hsl(var(--border))',
        backgroundColor: generationColor ? `${generationColor}10` : undefined
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-3 mb-3">
          <Avatar 
            className="w-16 h-16 ring-2 shadow-md"
            style={{ 
              ringColor: generationColor || 'hsl(var(--border))'
            }}
          >
            <AvatarImage src={person.profile_photo_url || undefined} />
            <AvatarFallback 
              className="text-lg font-semibold"
              style={{
                backgroundColor: generationColor || undefined,
                color: generationColor ? '#ffffff' : undefined
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <div className="font-semibold text-sm truncate max-w-full">
              {person.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {person.date_of_birth && (
                <span>
                  {formatDateShort(person.date_of_birth)}
                  {age && ` (${age})`}
                </span>
              )}
              {generation !== undefined && (
                <div className="text-xs font-medium mt-1" style={{ color: generationColor }}>
                  Gen {generation}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 justify-center">
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
      </CardContent>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

PersonNode.displayName = 'PersonNode';