import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGenerationColorPalette } from '@/utils/generationUtils';

interface GenerationLegendProps {
  generationMap: Map<string, { generation: number; color: string; depth: number }>;
  className?: string;
}

export function GenerationLegend({ generationMap, className = '' }: GenerationLegendProps) {
  // Get unique generations present in the current family tree
  const presentGenerations = new Set<number>();
  generationMap.forEach(info => {
    presentGenerations.add(info.generation);
  });

  const sortedGenerations = Array.from(presentGenerations).sort((a, b) => a - b);
  const colorPalette = getGenerationColorPalette();

  if (sortedGenerations.length === 0) {
    return null;
  }

  const getGenerationLabel = (generation: number) => {
    if (generation === 0) return 'Oldest Generation';
    if (generation === 1) return 'Parents';
    if (generation === 2) return 'Children';
    if (generation === 3) return 'Grandchildren';
    return `Generation ${generation}`;
  };

  return (
    <Card className={`w-fit ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">
          Generation Colors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedGenerations.map(generation => {
          const colorInfo = colorPalette[generation] || colorPalette[colorPalette.length - 1];
          const count = Array.from(generationMap.values())
            .filter(info => info.generation === generation).length;
          
          return (
            <div key={generation} className="flex items-center gap-3 text-sm">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: colorInfo.color }}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {getGenerationLabel(generation)}
                </div>
                <div className="text-xs text-gray-500">
                  {count} {count === 1 ? 'person' : 'people'}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Connection line legend */}
        <div className="border-t pt-3 mt-3">
          <div className="text-xs font-medium text-gray-600 mb-2">Connection Lines</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-0.5 bg-blue-500" />
              <span className="text-gray-700">Parent-Child</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-0.5 bg-green-500" />
              <span className="text-gray-700">Sibling</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-0.5 bg-orange-500" />
              <span className="text-gray-700">Donor</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 