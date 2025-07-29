import { Image as ImageIcon } from "lucide-react";

export default function ImagePlaceholder() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md aspect-square bg-gradient-to-br from-coral-50 to-dusty-50 rounded-2xl border-2 border-dashed border-coral-200 flex flex-col items-center justify-center p-8 text-center">
        <ImageIcon className="w-16 h-16 text-coral-400 mb-4" />
        <h3 className="text-lg font-medium text-coral-700 mb-2">Visual Placeholder</h3>
        <p className="text-sm text-coral-600">
          Organization dashboard preview or feature illustration will be displayed here
        </p>
      </div>
    </div>
  );
} 