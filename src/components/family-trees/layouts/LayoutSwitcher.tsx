import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Network, Target, Share2, TreePine } from 'lucide-react';

type LayoutType = 'force' | 'radial' | 'dagre' | 'reactflow' | 'xyflow';

interface LayoutOption {
  value: LayoutType;
  label: string;
  description: string;
  icon: typeof Network;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    value: 'force',
    label: 'Force Directed',
    description: 'Dynamic force simulation',
    icon: Network
  },
  {
    value: 'radial',
    label: 'Radial',
    description: 'Generational circles',
    icon: Target
  },
  {
    value: 'dagre',
    label: 'Tree',
    description: 'Hierarchical layout',
    icon: Share2
  },
  {
    value: 'reactflow',
    label: 'ReactFlow',
    description: 'ReactFlow layout',
    icon: Share2
  },
  {
    value: 'xyflow',
    label: 'xyFlow',
    description: 'xy flow',
    icon: TreePine
  }
];

interface LayoutSwitcherProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  className?: string;
}

export function LayoutSwitcher({ 
  currentLayout, 
  onLayoutChange, 
  className = '' 
}: LayoutSwitcherProps) {
  const currentOption = LAYOUT_OPTIONS.find(option => option.value === currentLayout);

  return (
    <div className={className}>
      <Select value={currentLayout} onValueChange={onLayoutChange}>
        <SelectTrigger className="w-40">
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentOption && (
                <>
                  <currentOption.icon className="h-4 w-4" />
                  <span className="text-sm">{currentOption.label}</span>
                </>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LAYOUT_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
} 