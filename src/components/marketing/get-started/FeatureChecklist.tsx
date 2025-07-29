import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { organizationFeatures, OrganizationFeature } from "./OrganizationFeatures";

interface FeatureChecklistProps {
  selectedFeatures?: string[];
  variant?: 'checklist' | 'bullets';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export default function FeatureChecklist({ 
  selectedFeatures = [], 
  variant = 'checklist',
  columns = 2,
  className = ""
}: FeatureChecklistProps) {
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return "grid grid-cols-1 gap-3";
      case 2:
        return "grid grid-cols-1 md:grid-cols-2 gap-3";
      case 3:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3";
      case 4:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3";
      default:
        return "grid grid-cols-1 md:grid-cols-2 gap-3";
    }
  };

  if (variant === 'bullets') {
    return (
      <div className={`${getGridClass()} ${className}`}>
        {organizationFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <Icon className="w-4 h-4 text-coral-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">
                  {feature.label}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${getGridClass()} ${className}`}>
      {organizationFeatures.map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.id} className="flex items-start space-x-3">
            <Checkbox
              id={feature.id}
              checked={selectedFeatures.includes(feature.id)}
              className="mt-1 rounded border-coral-300 data-[state=checked]:bg-coral-600 data-[state=checked]:border-coral-600 data-[state=checked]:text-white"
            />
            <div className="flex-1">
              <Label 
                htmlFor={feature.id} 
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                <Icon className="w-4 h-4 text-coral-600" />
                {feature.label}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {feature.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 