import { Button } from '@/components/ui/button';
import { User, Maximize2, Grid3X3 } from 'lucide-react';
import { Person } from '@/types/person';

interface TreeToolbarProps {
  persons: Person[];
  currentLayout: 'force' | 'radial' | 'dagre';
  layoutDirection?: 'TB' | 'LR' | 'BT' | 'RL';
  onCenterSelf: () => void;
  onZoomToFit: () => void;
  onLayoutDirectionChange?: () => void;
  className?: string;
}

export function TreeToolbar({
  persons,
  currentLayout,
  layoutDirection,
  onCenterSelf,
  onZoomToFit,
  onLayoutDirectionChange,
  className = ''
}: TreeToolbarProps) {
  // Find if there's a person designated as "self"
  const selfPerson = persons.find(person => person.is_self === true);
  const hasSelf = !!selfPerson;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Navigation Controls */}
      <div className="flex flex-col gap-2">
        {/* Center-Self Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCenterSelf}
          disabled={!hasSelf}
          className="h-8 w-8 p-0"
          title={hasSelf ? `Center on ${selfPerson?.name}` : 'No person designated as self'}
        >
          <User className="h-4 w-4" />
        </Button>

        {/* Zoom to Fit Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomToFit}
          className="h-8 w-8 p-0"
          title="Zoom to fit all nodes"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Separator */}
      <div className="border-t border-border w-full" />

      {/* Layout Controls */}
      <div className="flex flex-col gap-2">
        {/* Layout Direction Toggle - only enabled in dagre mode */}
        <Button
          variant="outline"
          size="sm"
          onClick={onLayoutDirectionChange}
          disabled={currentLayout !== 'dagre' || !onLayoutDirectionChange}
          className="h-8 w-8 p-0"
          title={
            currentLayout !== 'dagre' 
              ? 'Direction control only available in Tree layout'
              : `Current: ${layoutDirection}. Click to cycle through orientations.`
          }
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 