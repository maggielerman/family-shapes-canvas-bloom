import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/use-file-upload';

interface ImageUploadProps {
  onImageUploaded?: (uploadedFile: any) => void;
  onImageSelected?: (file: File) => void;
  currentImageUrl?: string;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSize?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageSelected,
  currentImageUrl,
  disabled = false,
  className,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      alert(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    onImageSelected?.(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const uploadedFile = await uploadFile(selectedFile);
      if (uploadedFile) {
        onImageUploaded?.(uploadedFile);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="space-y-2">
        {preview ? (
          <div className="relative">
            <div className="aspect-square w-32 mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearImage}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              disabled={disabled || isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            onClick={openFileDialog}
            className={cn(
              "aspect-square w-32 mx-auto border-2 border-dashed rounded-lg",
              "flex flex-col items-center justify-center cursor-pointer",
              "hover:bg-muted/50 transition-colors",
              "border-muted-foreground/25",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground text-center">
              Click to add photo
            </span>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {preview ? 'Change' : 'Select'} Photo
          </Button>

          {selectedFile && (
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={disabled || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};