import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Network, GitBranch, Users, Zap, Layers, Target } from 'lucide-react';

export type LayoutType = 'manual' | 'dagre' | 'elk' | 'd3-hierarchy' | 'd3-force' | 'd3-cluster' | 'd3-tree';

export interface LayoutOption {
  value: LayoutType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const layoutOptions: LayoutOption[] = [
  {
    value: 'manual',
    label: 'Manual',
    description: 'Drag nodes to position them manually',
    icon: Network,
  },
  {
    value: 'dagre',
    label: 'Dagre',
    description: 'Directed graph layout with hierarchical positioning',
    icon: GitBranch,
  },
  {
    value: 'elk',
    label: 'ELK',
    description: 'Advanced layout engine with multiple algorithms',
    icon: Target,
  },
  {
    value: 'd3-hierarchy',
    label: 'D3 Hierarchy',
    description: 'Hierarchical tree layout using D3',
    icon: Users,
  },
  {
    value: 'd3-force',
    label: 'D3 Force',
    description: 'Force-directed layout for interactive graphs',
    icon: Zap,
  },
  {
    value: 'd3-cluster',
    label: 'D3 Cluster',
    description: 'Cluster layout for grouped hierarchies',
    icon: Layers,
  },
  {
    value: 'd3-tree',
    label: 'D3 Tree',
    description: 'Traditional tree layout using D3',
    icon: GitBranch,
  },
];

interface XYFlowLayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  disabled?: boolean;
}

export function XYFlowLayoutSelector({ 
  currentLayout, 
  onLayoutChange, 
  disabled = false 
}: XYFlowLayoutSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentOption = layoutOptions.find(option => option.value === currentLayout);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Layout Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Quick Layout Selector */}
          <div className="flex items-center gap-2">
            <Select 
              value={currentLayout} 
              onValueChange={(value: LayoutType) => onLayoutChange(value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full relative">
                {disabled && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md z-10">
                    <div className="text-xs text-muted-foreground">Applying...</div>
                  </div>
                )}
                <SelectValue>
                  {currentOption && (
                    <div className="flex items-center gap-2">
                      <currentOption.icon className="w-4 h-4" />
                      <span>{currentOption.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {layoutOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
            >
              {isExpanded ? 'Hide' : 'Details'}
            </Button>
          </div>

          {/* Layout Details */}
          {isExpanded && currentOption && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <currentOption.icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{currentOption.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{currentOption.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Layout Tips */}
          <div className="text-xs text-muted-foreground">
            <p className="mb-1">
              <strong>Tips:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use <strong>Manual</strong> for precise positioning</li>
              <li>Use <strong>Dagre</strong> for hierarchical family trees</li>
              <li>Use <strong>D3 Force</strong> for interactive exploration</li>
              <li>Use <strong>ELK</strong> for complex layouts with many nodes</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 