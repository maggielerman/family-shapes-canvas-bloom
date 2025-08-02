import { Image as ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  variant?: 'default' | 'square' | 'wide' | 'tall';
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function ImagePlaceholder({ 
  variant = 'default', 
  className = '', 
  title = 'Visual Placeholder',
  description = 'Organization dashboard preview or feature illustration will be displayed here',
  icon: Icon = ImageIcon
}: ImagePlaceholderProps) {
  const sizeClasses = {
    default: 'w-full h-64',
    square: 'w-full aspect-square',
    wide: 'w-full h-48',
    tall: 'w-full h-96'
  };

  const iconSizes = {
    default: 'w-16 h-8',
    square: 'w-12 h-6',
    wide: 'w-14 h-7',
    tall: 'w-20 h-10'
  };

  const textSizes = {
    default: {
      title: 'text-lg',
      description: 'text-sm'
    },
    square: {
      title: 'text-base',
      description: 'text-xs'
    },
    wide: {
      title: 'text-base',
      description: 'text-xs'
    },
    tall: {
      title: 'text-xl',
      description: 'text-sm'
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[variant]} bg-gradient-to-br from-coral-50 to-dusty-50 rounded-2xl border-2 border-dashed border-coral-200 flex flex-col items-center justify-center p-8 text-center`}>
        <Icon className={`${iconSizes[variant]} text-coral-400 mb-4`} />
        <h3 className={`${textSizes[variant].title} font-medium text-coral-700 mb-2`}>{title}</h3>
        <p className={`${textSizes[variant].description} text-coral-600`}>
          {description}
        </p>
      </div>
    </div>
  );
} 