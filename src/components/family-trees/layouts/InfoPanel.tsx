interface InfoPanelProps {
  layout: string;
  zoomLevel: number;
  relationshipFilters: Record<string, boolean>;
  className?: string;
}

export function InfoPanel({ 
  layout, 
  zoomLevel, 
  relationshipFilters, 
  className = '' 
}: InfoPanelProps) {
  return (
    <div className={className}>
      <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm space-y-1">
        <div>Layout: {layout}</div>
        <div>{Math.round(zoomLevel * 100)}%</div>
        <div className="text-xs text-muted-foreground">
          Showing: {Object.entries(relationshipFilters)
            .filter(([_, enabled]) => enabled)
            .map(([category]) => 
              category === 'generational' ? 'Parent-Child' : 
              category === 'lateral' ? 'Siblings & Partners' : 
              'Donors'
            )
            .join(', ')}
        </div>
      </div>
    </div>
  );
} 