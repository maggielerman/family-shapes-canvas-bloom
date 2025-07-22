import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataExportDialogProps {
  children: React.ReactNode;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function DataExportDialog({ children }: DataExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: 'profile',
      label: 'Profile Information',
      description: 'Personal details, contact information',
      enabled: true,
    },
    {
      id: 'family_trees',
      label: 'Family Trees',
      description: 'All your family tree data and connections',
      enabled: true,
    },
    {
      id: 'people',
      label: 'People Data',
      description: 'Information about people in your trees',
      enabled: true,
    },
    {
      id: 'media',
      label: 'Media Files',
      description: 'Photos, documents, and other uploaded files',
      enabled: false,
    },
    {
      id: 'settings',
      label: 'Account Settings',
      description: 'Your preferences and configuration',
      enabled: true,
    },
  ]);
  const { toast } = useToast();

  const handleOptionToggle = (optionId: string) => {
    setExportOptions(prev =>
      prev.map(option =>
        option.id === optionId
          ? { ...option, enabled: !option.enabled }
          : option
      )
    );
  };

  const handleExport = async () => {
    const selectedOptions = exportOptions.filter(option => option.enabled);
    
    if (selectedOptions.length === 0) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one type of data to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const steps = selectedOptions.length;
      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setExportProgress(((i + 1) / steps) * 100);
      }

      // TODO: Implement actual data export logic
      // This would typically involve:
      // 1. Gathering data from various tables
      // 2. Formatting as JSON/CSV
      // 3. Creating a downloadable ZIP file
      // 4. Sending download link via email or direct download

      toast({
        title: "Export Complete",
        description: "Your data export has been prepared. Check your email for the download link.",
      });

      setOpen(false);
      setExportProgress(0);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetDialog = () => {
    setExportProgress(0);
    setIsExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export My Data
          </DialogTitle>
          <DialogDescription>
            Download a copy of your personal data. This may take a few minutes to prepare.
          </DialogDescription>
        </DialogHeader>

        {!isExporting ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select data to export:</Label>
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={option.enabled}
                    onCheckedChange={() => handleOptionToggle(option.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={option.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  Your data will be exported in JSON format and sent to your registered email address.
                  Large media files may be provided via a separate download link.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="font-medium">Preparing your data export...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a few minutes depending on the amount of data.
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={exportProgress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                {exportProgress.toFixed(0)}% complete
              </p>
            </div>
          </div>
        )}

        {!isExporting && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}