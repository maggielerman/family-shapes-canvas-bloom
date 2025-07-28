import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { calculateGenerations, getGenerationStats, getGenerationalConnections, getSiblingConnections } from '@/utils/generationUtils';

interface FamilyTreeStatsProps {
  persons: Person[];
  connections: Connection[];
  title?: string;
  showTitle?: boolean;
}

export function FamilyTreeStats({ 
  persons, 
  connections, 
  title = "Family Tree Statistics",
  showTitle = true 
}: FamilyTreeStatsProps) {
  // Calculate generation statistics
  const generationMap = persons.length > 0 && connections.length > 0 
    ? calculateGenerations(persons, connections) 
    : new Map();
  const generationStats = getGenerationStats(generationMap);
  const generationalConnections = getGenerationalConnections(connections);
  const siblingConnections = getSiblingConnections(connections);

  if (persons.length === 0) {
    return null;
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{persons.length}</div>
            <div className="text-sm text-muted-foreground">People</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{generationalConnections.length}</div>
            <div className="text-sm text-muted-foreground">Generational</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{siblingConnections.length}</div>
            <div className="text-sm text-muted-foreground">Siblings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-navy-600">{generationStats.maxGeneration}</div>
            <div className="text-sm text-muted-foreground">Max Gen</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 